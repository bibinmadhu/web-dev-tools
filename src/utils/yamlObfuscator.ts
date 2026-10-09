/**
 * DevHub YAML Obfuscator & De-obfuscator Engine
 * 
 * Provides bi-directional obfuscation of YAML files (Kubernetes manifests, Docker Compose,
 * GitHub Actions, Spring Boot, OpenAPI, CloudFormation), masking keys, sensitive values,
 * and anchors while strictly preserving YAML syntax, structure, indentation, multiline blocks,
 * and comments across single and multi-document YAML.
 */

import YAML, {
  visit,
  isScalar,
  isAlias,
  isPair,
  isMap,
  isSeq,
  Scalar,
  Document,
} from 'yaml';

export type YamlNamingStyle = 'prefixed' | 'random_hex' | 'pseudonym' | 'alphabetical' | 'hash';

export type YamlValueMode = 'all_values' | 'all_strings' | 'sensitive_only' | 'custom_keys_only' | 'none';

export type YamlCommentHandling = 'preserve' | 'strip' | 'mask';

export interface YamlObfuscatorOptions {
  namingStyle: YamlNamingStyle;
  keyPrefix: string;
  valuePrefix: string;
  anchorPrefix: string;
  obfuscateKeys: boolean;
  obfuscateValues: boolean;
  valueMode: YamlValueMode;
  sensitiveKeyPatterns: string[];
  obfuscateAnchors: boolean;
  commentHandling: YamlCommentHandling;
  maskNumbers: boolean;
  maskBooleans: boolean;
  excludedKeys: string[];
  excludedValues: string[];
  preserveQuotes: boolean;
  customOverrides?: Record<string, string>;
}

export interface YamlMappingStats {
  keysCount: number;
  valuesCount: number;
  anchorsCount: number;
  commentsCount: number;
  totalReplacements: number;
}

export interface YamlObfuscatorMapping {
  format: 'devhub-yaml-obfuscator-config';
  version: 1;
  id: string;
  name: string;
  description?: string;
  exportedAt: string;
  options: YamlObfuscatorOptions;
  keys: Record<string, string>;       // original -> obfuscated
  values: Record<string, string>;     // original -> obfuscated
  anchors: Record<string, string>;    // original -> obfuscated
  reverseMapping: {
    keys: Record<string, string>;     // obfuscated -> original
    values: Record<string, string>;   // obfuscated -> original
    anchors: Record<string, string>;  // obfuscated -> original
  };
  stats: YamlMappingStats;
}

export interface YamlObfuscateResult {
  obfuscatedYaml: string;
  mapping: YamlObfuscatorMapping;
  detectedKeys: string[];
  detectedValues: string[];
  detectedAnchors: string[];
  replacementsCount: number;
  warnings: string[];
}

export interface YamlDeobfuscateResult {
  deobfuscatedYaml: string;
  restoredCount: number;
  unrecognizedTokens: string[];
  roundtripMatch?: boolean;
}

// Default standard framework keys that are preserved by default to keep YAML functional
export const DEFAULT_EXCLUDED_YAML_KEYS: string[] = [
  // Kubernetes standard keys
  'apiVersion', 'kind', 'metadata', 'spec', 'status', 'name', 'namespace',
  'labels', 'annotations', 'containers', 'image', 'ports', 'env', 'type',
  'resources', 'limits', 'requests', 'selector', 'matchLabels', 'template',
  'volumeMounts', 'volumes', 'restartPolicy', 'securityContext', 'serviceAccountName',
  'replicas', 'strategy', 'protocol', 'targetPort', 'nodePort',

  // Docker Compose standard keys
  'version', 'services', 'build', 'context', 'dockerfile', 'environment',
  'depends_on', 'restart', 'command', 'entrypoint', 'healthcheck', 'networks',
  'logging', 'driver', 'deploy', 'configs', 'secrets',

  // GitHub Actions standard keys
  'on', 'push', 'pull_request', 'workflow_dispatch', 'schedule', 'jobs',
  'runs-on', 'steps', 'uses', 'with', 'run', 'branches', 'paths', 'tags',
  'strategy', 'matrix', 'needs', 'if', 'outputs',

  // OpenAPI / Swagger standard keys
  'openapi', 'swagger', 'info', 'title', 'paths', 'get', 'post', 'put',
  'delete', 'patch', 'responses', 'description', 'content', 'schema',
  'components', 'schemas', 'security', 'securitySchemes', 'parameters',

  // General structural keywords
  'true', 'false', 'null', 'yes', 'no', 'on', 'off', '~', 'default', 'enabled', 'disabled'
];

export const DEFAULT_SENSITIVE_KEY_PATTERNS: string[] = [
  'password', 'passwd', 'pwd', 'secret', 'token', 'key', 'auth', 'cred',
  'credential', 'cert', 'certificate', 'private', 'bearer', 'conn',
  'connection', 'connectionstring', 'dsn', 'uri', 'url', 'host', 'hostname',
  'apikey', 'api_key', 'access_key', 'secret_key', 'client_secret', 'ssh',
  'oauth', 'jwt', 'hash', 'salt', 'pin', 'email'
];

export const DEFAULT_YAML_OBFUSCATOR_OPTIONS: YamlObfuscatorOptions = {
  namingStyle: 'prefixed',
  keyPrefix: 'k_',
  valuePrefix: 'val_',
  anchorPrefix: 'anc_',
  obfuscateKeys: false, // Default: values only (keys preserved to retain YAML structure)
  obfuscateValues: true, // Default: enabled
  valueMode: 'sensitive_only',
  sensitiveKeyPatterns: [...DEFAULT_SENSITIVE_KEY_PATTERNS],
  obfuscateAnchors: true,
  commentHandling: 'preserve',
  maskNumbers: false,
  maskBooleans: false,
  excludedKeys: [...DEFAULT_EXCLUDED_YAML_KEYS],
  excludedValues: [],
  preserveQuotes: true,
  customOverrides: {},
};

// Dictionary pool for pseudonym / dictionary naming style
const PSEUDONYM_WORDS = [
  'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
  'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa',
  'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey',
  'xray', 'yankee', 'zulu', 'apex', 'beacon', 'cipher', 'datum', 'ember',
  'flux', 'glyph', 'helix', 'ion', 'jade', 'karma', 'lumen', 'nexus',
  'orbit', 'prism', 'quasar', 'relay', 'strata', 'titan', 'vector', 'zenith'
];

/**
 * Generates an obfuscated identifier according to the selected naming style
 */
export function generateObfuscatedIdentifier(
  type: 'key' | 'value' | 'anchor',
  index: number,
  originalText: string,
  options: YamlObfuscatorOptions
): string {
  const prefix =
    type === 'key'
      ? options.keyPrefix || 'k_'
      : type === 'value'
      ? options.valuePrefix || 'val_'
      : options.anchorPrefix || 'anc_';

  switch (options.namingStyle) {
    case 'random_hex': {
      // Deterministic hash-based hex snippet to ensure consistency
      let hash = 0;
      for (let i = 0; i < originalText.length; i++) {
        hash = ((hash << 5) - hash + originalText.charCodeAt(i)) | 0;
      }
      const hex = Math.abs(hash).toString(16).padStart(6, '0').slice(0, 6);
      return `${prefix}${hex}`;
    }

    case 'pseudonym': {
      const word = PSEUDONYM_WORDS[(index - 1) % PSEUDONYM_WORDS.length];
      const cycle = Math.floor((index - 1) / PSEUDONYM_WORDS.length);
      return cycle > 0 ? `${prefix}${word}_${cycle + 1}` : `${prefix}${word}`;
    }

    case 'alphabetical': {
      let str = '';
      let n = index - 1;
      while (n >= 0) {
        str = String.fromCharCode(97 + (n % 26)) + str;
        n = Math.floor(n / 26) - 1;
      }
      return `${prefix}${str}`;
    }

    case 'hash': {
      let h1 = 0xdeadbeef ^ originalText.length;
      let h2 = 0x41c64e6d ^ originalText.length;
      for (let i = 0; i < originalText.length; i++) {
        const ch = originalText.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      const hexSnippet = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).slice(0, 6);
      return `${prefix}${hexSnippet}`;
    }

    case 'prefixed':
    default:
      return `${prefix}${index}`;
  }
}

/**
 * Checks if a key name matches any sensitive keyword pattern
 */
export function isSensitiveKey(keyName: string, patterns: string[]): boolean {
  if (!keyName || typeof keyName !== 'string') return false;
  const clean = keyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return patterns.some((p) => {
    const cleanPattern = p.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean.includes(cleanPattern);
  });
}

/**
 * Checks if a string value looks like a sensitive token, URL, email, or key
 */
export function isSensitiveValuePattern(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  // JWT pattern (3 base64 parts)
  if (/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(trimmed) && trimmed.length > 25) {
    return true;
  }
  // URL with credentials or query params
  if (/^https?:\/\/[^\s]+$/i.test(trimmed)) {
    return true;
  }
  // Email address
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
    return true;
  }
  // API key / hex / hash pattern
  if (/^[a-fA-F0-9]{32,64}$/.test(trimmed)) {
    return true;
  }
  // High-entropy token with underscores / hyphens (e.g. sk_live_..., ghp_..., ey...)
  if (/^(sk|pk|ghp|gho|xoxb|xoxp|key|tok|sec)_[a-zA-Z0-9_-]{10,}$/i.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * Main Obfuscation function for YAML documents
 */
/**
 * Safely serializes an array of parsed YAML documents preserving multi-doc boundaries
 */
export function serializeYamlDocuments(docs: any[]): string {
  if (docs.length === 0) return '';
  if (docs.length === 1) return docs[0].toString();
  return docs
    .map((doc, idx) => {
      let str = doc.toString().trim();
      if (idx > 0 && !str.startsWith('---')) {
        str = '---\n' + str;
      }
      return str;
    })
    .join('\n');
}

export function obfuscateYaml(
  yamlContent: string,
  userOptions: Partial<YamlObfuscatorOptions> = {},
  existingMapping?: YamlObfuscatorMapping
): YamlObfuscateResult {
  const options: YamlObfuscatorOptions = {
    ...DEFAULT_YAML_OBFUSCATOR_OPTIONS,
    ...userOptions,
    excludedKeys: [
      ...DEFAULT_EXCLUDED_YAML_KEYS,
      ...(userOptions.excludedKeys || [])
    ],
    sensitiveKeyPatterns: [
      ...DEFAULT_SENSITIVE_KEY_PATTERNS,
      ...(userOptions.sensitiveKeyPatterns || [])
    ],
  };

  const warnings: string[] = [];
  const detectedKeys: string[] = [];
  const detectedValues: string[] = [];
  const detectedAnchors: string[] = [];

  // Mappings dictionaries
  const keysMap: Record<string, string> = { ...(existingMapping?.keys || {}) };
  const valuesMap: Record<string, string> = { ...(existingMapping?.values || {}) };
  const anchorsMap: Record<string, string> = { ...(existingMapping?.anchors || {}) };

  // Reverse mappings dictionaries
  const reverseKeysMap: Record<string, string> = { ...(existingMapping?.reverseMapping?.keys || {}) };
  const reverseValuesMap: Record<string, string> = { ...(existingMapping?.reverseMapping?.values || {}) };
  const reverseAnchorsMap: Record<string, string> = { ...(existingMapping?.reverseMapping?.anchors || {}) };

  // Apply custom overrides
  if (options.customOverrides) {
    for (const [orig, obf] of Object.entries(options.customOverrides)) {
      if (orig && obf) {
        keysMap[orig] = obf;
        reverseKeysMap[obf] = orig;
      }
    }
  }

  // Counters for generation
  let keyCounter = Object.keys(keysMap).length;
  let valCounter = Object.keys(valuesMap).length;
  let ancCounter = Object.keys(anchorsMap).length;
  let replacementsCount = 0;
  let commentsCount = 0;

  const excludedSet = new Set((options.excludedKeys || []).map((k) => k.toLowerCase()));
  const excludedValuesSet = new Set((options.excludedValues || []).map((v) => v.trim().toLowerCase()));

  // Helper to get or create key mapping
  function getOrAssignKey(origKey: string): string {
    if (keysMap[origKey]) {
      return keysMap[origKey];
    }
    keyCounter++;
    const obf = generateObfuscatedIdentifier('key', keyCounter, origKey, options);
    keysMap[origKey] = obf;
    reverseKeysMap[obf] = origKey;
    return obf;
  }

  // Helper to get or create value mapping
  function getOrAssignValue(origVal: string): string {
    if (valuesMap[origVal]) {
      return valuesMap[origVal];
    }
    valCounter++;
    const obf = generateObfuscatedIdentifier('value', valCounter, origVal, options);
    valuesMap[origVal] = obf;
    reverseValuesMap[obf] = origVal;
    return obf;
  }

  // Helper to get or create anchor mapping
  function getOrAssignAnchor(origAnchor: string): string {
    if (anchorsMap[origAnchor]) {
      return anchorsMap[origAnchor];
    }
    ancCounter++;
    const obf = generateObfuscatedIdentifier('anchor', ancCounter, origAnchor, options);
    anchorsMap[origAnchor] = obf;
    reverseAnchorsMap[obf] = origAnchor;
    return obf;
  }

  // Check if string is empty or just whitespace
  if (!yamlContent || !yamlContent.trim()) {
    const emptyMapping: YamlObfuscatorMapping = {
      format: 'devhub-yaml-obfuscator-config',
      version: 1,
      id: `yaml-map-${Date.now()}`,
      name: 'Empty YAML Mapping',
      exportedAt: new Date().toISOString(),
      options,
      keys: {},
      values: {},
      anchors: {},
      reverseMapping: { keys: {}, values: {}, anchors: {} },
      stats: { keysCount: 0, valuesCount: 0, anchorsCount: 0, commentsCount: 0, totalReplacements: 0 },
    };
    return {
      obfuscatedYaml: yamlContent,
      mapping: emptyMapping,
      detectedKeys: [],
      detectedValues: [],
      detectedAnchors: [],
      replacementsCount: 0,
      warnings: ['Input YAML content is empty.'],
    };
  }

  let parsedDocuments: any[] = [];
  try {
    parsedDocuments = YAML.parseAllDocuments(yamlContent, {
      keepSourceTokens: true,
      logLevel: 'silent',
    }) as any[];
  } catch (err: any) {
    warnings.push(`YAML Parser note: ${err?.message || 'Syntax error encountered during parsing'}`);
  }

  // If documents failed to parse properly or is empty
  if (parsedDocuments.length === 0) {
    warnings.push('Could not parse valid YAML documents. Attempting regex-based text processing.');
    return fallbackRegexObfuscate(yamlContent, options, existingMapping);
  }

  // Process all documents in the YAML stream
  const modifiedDocs = parsedDocuments.map((doc, docIdx) => {
    // Check for document-level parse errors
    if (doc.errors && doc.errors.length > 0) {
      warnings.push(`Document #${docIdx + 1} has ${doc.errors.length} syntax warning(s).`);
    }

    // Pass 1: Collect & Obfuscate Anchors
    if (options.obfuscateAnchors) {
      visit(doc, {
        Node(_, node) {
          if (node.anchor) {
            const origAnchor = node.anchor;
            if (!detectedAnchors.includes(origAnchor)) {
              detectedAnchors.push(origAnchor);
            }
            const obfAnchor = getOrAssignAnchor(origAnchor);
            node.anchor = obfAnchor;
            replacementsCount++;
          }
          if (isAlias(node) && typeof node.source === 'string') {
            const origSource = node.source;
            if (!detectedAnchors.includes(origSource)) {
              detectedAnchors.push(origSource);
            }
            const obfSource = getOrAssignAnchor(origSource);
            node.source = obfSource;
            replacementsCount++;
          }
        },
      });
    }

    // Pass 2: Process Pairs, Keys, and Values
    visit(doc, {
      Pair(_, pair) {
        let parentKeyName = '';

        // Obfuscate Pair Key
        if (isScalar(pair.key) && typeof pair.key.value === 'string') {
          const keyVal = String(pair.key.value);
          parentKeyName = keyVal;

          if (!detectedKeys.includes(keyVal)) {
            detectedKeys.push(keyVal);
          }

          const isExcluded = excludedSet.has(keyVal.toLowerCase());
          if (options.obfuscateKeys && !isExcluded) {
            const obfKey = getOrAssignKey(keyVal);
            pair.key.value = obfKey;
            replacementsCount++;
          }
        }

        // Obfuscate Pair Value
        if (pair.value && isScalar(pair.value)) {
          const val = pair.value.value;

          // Candidate tracking and string value obfuscation
          if (typeof val === 'string') {
            const keyIsSensitive = Boolean(parentKeyName && isSensitiveKey(parentKeyName, options.sensitiveKeyPatterns));
            const valIsSensitive = isSensitiveValuePattern(val);

            if (val.trim() !== '' && !detectedValues.includes(val)) {
              detectedValues.push(val);
            }

            if (options.obfuscateValues) {
              const isExcludedVal = excludedValuesSet.has(val.trim().toLowerCase());
              let shouldObfuscate = false;

              if (!isExcludedVal) {
                if (options.valueMode === 'all_strings' || options.valueMode === 'all_values') {
                  shouldObfuscate = true;
                } else if (options.valueMode === 'sensitive_only') {
                  shouldObfuscate = keyIsSensitive || valIsSensitive;
                } else if (options.valueMode === 'custom_keys_only') {
                  shouldObfuscate = keyIsSensitive;
                }
              }

              if (shouldObfuscate && val.trim() !== '') {
                const obfVal = getOrAssignValue(val);
                pair.value.value = obfVal;
                replacementsCount++;
              }
            }
          }

          // Number Masking
          if (typeof val === 'number' && options.maskNumbers) {
            pair.value.value = 0;
            replacementsCount++;
          }

          // Boolean Masking
          if (typeof val === 'boolean' && options.maskBooleans) {
            pair.value.value = false;
            replacementsCount++;
          }
        }
      },

      // Process sequence items (scalars in arrays)
      Seq(_, seq) {
        seq.items.forEach((item) => {
          if (isScalar(item) && typeof item.value === 'string') {
            const val = item.value;
            const valIsSensitive = isSensitiveValuePattern(val);

            if (val.trim() !== '' && !detectedValues.includes(val)) {
              detectedValues.push(val);
            }

            if (options.obfuscateValues) {
              const isExcludedVal = excludedValuesSet.has(val.trim().toLowerCase());
              let shouldObf = false;
              if (!isExcludedVal) {
                if (options.valueMode === 'all_strings' || options.valueMode === 'all_values') {
                  shouldObf = true;
                } else if (options.valueMode === 'sensitive_only') {
                  shouldObf = valIsSensitive;
                }
              }

              if (shouldObf && val.trim() !== '') {
                const obfVal = getOrAssignValue(val);
                item.value = obfVal;
                replacementsCount++;
              }
            }
          }
        });
      },

      // Comment Handling
      Scalar(_, scalar) {
        if (options.commentHandling === 'strip') {
          if (scalar.comment) {
            scalar.comment = '';
            commentsCount++;
          }
          if (scalar.commentBefore) {
            scalar.commentBefore = '';
            commentsCount++;
          }
        }
      },
    });

    return doc;
  });

  let finalObfuscatedYaml = serializeYamlDocuments(parsedDocuments);

  // Strip or mask global comments if required
  if (options.commentHandling === 'strip') {
    finalObfuscatedYaml = finalObfuscatedYaml
      .split('\n')
      .map((line) => {
        const hashIdx = line.indexOf('#');
        if (hashIdx !== -1) {
          // Check if inside quotes
          const before = line.slice(0, hashIdx);
          const quotesCount = (before.match(/"/g) || []).length + (before.match(/'/g) || []).length;
          if (quotesCount % 2 === 0) {
            commentsCount++;
            return before.trimEnd();
          }
        }
        return line;
      })
      .filter((line, idx, arr) => {
        // Remove trailing empty lines created by comment stripping
        return line.trim() !== '' || (idx > 0 && arr[idx - 1].trim() !== '');
      })
      .join('\n');
  } else if (options.commentHandling === 'mask') {
    finalObfuscatedYaml = finalObfuscatedYaml
      .split('\n')
      .map((line) => {
        const hashIdx = line.indexOf('#');
        if (hashIdx !== -1) {
          const before = line.slice(0, hashIdx);
          const quotesCount = (before.match(/"/g) || []).length + (before.match(/'/g) || []).length;
          if (quotesCount % 2 === 0) {
            commentsCount++;
            return `${before}# [REDACTED COMMENT]`;
          }
        }
        return line;
      })
      .join('\n');
  }

  const mappingStats: YamlMappingStats = {
    keysCount: Object.keys(keysMap).length,
    valuesCount: Object.keys(valuesMap).length,
    anchorsCount: Object.keys(anchorsMap).length,
    commentsCount,
    totalReplacements: replacementsCount,
  };

  const mapping: YamlObfuscatorMapping = {
    format: 'devhub-yaml-obfuscator-config',
    version: 1,
    id: `yaml-map-${Date.now()}`,
    name: 'YAML Obfuscation Mapping',
    exportedAt: new Date().toISOString(),
    options,
    keys: keysMap,
    values: valuesMap,
    anchors: anchorsMap,
    reverseMapping: {
      keys: reverseKeysMap,
      values: reverseValuesMap,
      anchors: reverseAnchorsMap,
    },
    stats: mappingStats,
  };

  return {
    obfuscatedYaml: finalObfuscatedYaml,
    mapping,
    detectedKeys,
    detectedValues,
    detectedAnchors,
    replacementsCount,
    warnings,
  };
}

/**
 * Fallback regex-based obfuscator when AST parser encounters fatal syntax errors
 */
function fallbackRegexObfuscate(
  yamlContent: string,
  options: YamlObfuscatorOptions,
  existingMapping?: YamlObfuscatorMapping
): YamlObfuscateResult {
  const keysMap: Record<string, string> = { ...(existingMapping?.keys || {}) };
  const valuesMap: Record<string, string> = { ...(existingMapping?.values || {}) };
  const anchorsMap: Record<string, string> = { ...(existingMapping?.anchors || {}) };
  const reverseKeysMap: Record<string, string> = { ...(existingMapping?.reverseMapping?.keys || {}) };
  const reverseValuesMap: Record<string, string> = { ...(existingMapping?.reverseMapping?.values || {}) };
  const reverseAnchorsMap: Record<string, string> = { ...(existingMapping?.reverseMapping?.anchors || {}) };

  let keyCounter = Object.keys(keysMap).length;
  let valCounter = Object.keys(valuesMap).length;
  let replacementsCount = 0;

  const lines = yamlContent.split('\n');
  const excludedSet = new Set(options.excludedKeys.map((k) => k.toLowerCase()));

  const modifiedLines = lines.map((line) => {
    // Check if line contains a key: value
    const match = line.match(/^(\s*)([a-zA-Z0-9_-]+)(\s*:\s*)(.*)$/);
    if (!match) return line;

    const indent = match[1];
    const key = match[2];
    const colon = match[3];
    let val = match[4];

    let newKey = key;
    if (options.obfuscateKeys && !excludedSet.has(key.toLowerCase())) {
      if (!keysMap[key]) {
        keyCounter++;
        const obfKey = generateObfuscatedIdentifier('key', keyCounter, key, options);
        keysMap[key] = obfKey;
        reverseKeysMap[obfKey] = key;
      }
      newKey = keysMap[key];
      replacementsCount++;
    }

    if (options.obfuscateValues && val.trim()) {
      const cleanVal = val.trim().replace(/^['"]|['"]$/g, '');
      const isExcludedVal = (options.excludedValues || []).some(
        (ev) => ev.trim().toLowerCase() === cleanVal.toLowerCase()
      );
      if (!isExcludedVal) {
        const isCandidate =
          options.valueMode === 'all_strings' ||
          options.valueMode === 'all_values' ||
          isSensitiveKey(key, options.sensitiveKeyPatterns) ||
          isSensitiveValuePattern(cleanVal);
        if (isCandidate) {
          if (!valuesMap[cleanVal]) {
            valCounter++;
            const obfVal = generateObfuscatedIdentifier('value', valCounter, cleanVal, options);
            valuesMap[cleanVal] = obfVal;
            reverseValuesMap[obfVal] = cleanVal;
          }
          val = `"${valuesMap[cleanVal]}"`;
          replacementsCount++;
        }
      }
    }

    return `${indent}${newKey}${colon}${val}`;
  });

  const mapping: YamlObfuscatorMapping = {
    format: 'devhub-yaml-obfuscator-config',
    version: 1,
    id: `yaml-map-${Date.now()}`,
    name: 'YAML Obfuscation Mapping (Regex Mode)',
    exportedAt: new Date().toISOString(),
    options,
    keys: keysMap,
    values: valuesMap,
    anchors: anchorsMap,
    reverseMapping: {
      keys: reverseKeysMap,
      values: reverseValuesMap,
      anchors: reverseAnchorsMap,
    },
    stats: {
      keysCount: Object.keys(keysMap).length,
      valuesCount: Object.keys(valuesMap).length,
      anchorsCount: 0,
      commentsCount: 0,
      totalReplacements: replacementsCount,
    },
  };

  return {
    obfuscatedYaml: modifiedLines.join('\n'),
    mapping,
    detectedKeys: Object.keys(keysMap),
    detectedValues: Object.keys(valuesMap),
    detectedAnchors: [],
    replacementsCount,
    warnings: ['Obfuscated using line-by-line fallback mode due to YAML syntax warnings.'],
  };
}

/**
 * De-obfuscate YAML using mapping dictionary
 */
export function deobfuscateYaml(
  obfuscatedYaml: string,
  mapping: YamlObfuscatorMapping
): YamlDeobfuscateResult {
  if (!obfuscatedYaml || !obfuscatedYaml.trim()) {
    return {
      deobfuscatedYaml: '',
      restoredCount: 0,
      unrecognizedTokens: [],
      roundtripMatch: true,
    };
  }

  let restoredCount = 0;
  const unrecognizedTokens: string[] = [];

  const reverseKeys = mapping.reverseMapping?.keys || {};
  const reverseValues = mapping.reverseMapping?.values || {};
  const reverseAnchors = mapping.reverseMapping?.anchors || {};

  // Build combined token map
  const tokenMap = new Map<string, string>();
  for (const [obf, orig] of Object.entries(reverseKeys)) {
    tokenMap.set(obf, orig);
  }
  for (const [obf, orig] of Object.entries(reverseValues)) {
    tokenMap.set(obf, orig);
  }
  for (const [obf, orig] of Object.entries(reverseAnchors)) {
    tokenMap.set(obf, orig);
  }

  let docs: any[] = [];
  try {
    docs = YAML.parseAllDocuments(obfuscatedYaml, { keepSourceTokens: true, logLevel: 'silent' }) as any[];
  } catch (e) {
    // fallback to regex string replacement if AST parsing fails
  }

  if (docs.length > 0) {
    docs.forEach((doc) => {
      // 1. Restore Anchors and Aliases
      visit(doc, {
        Node(_, node) {
          if (node.anchor && reverseAnchors[node.anchor]) {
            node.anchor = reverseAnchors[node.anchor];
            restoredCount++;
          }
          if (isAlias(node) && typeof node.source === 'string' && reverseAnchors[node.source]) {
            node.source = reverseAnchors[node.source];
            restoredCount++;
          }
        },
      });

      // 2. Restore Pairs (Keys & Values)
      visit(doc, {
        Pair(_, pair) {
          if (isScalar(pair.key) && typeof pair.key.value === 'string') {
            const currentKey = pair.key.value;
            if (reverseKeys[currentKey]) {
              pair.key.value = reverseKeys[currentKey];
              restoredCount++;
            }
          }

          if (pair.value && isScalar(pair.value) && typeof pair.value.value === 'string') {
            const currentVal = pair.value.value;
            if (reverseValues[currentVal]) {
              pair.value.value = reverseValues[currentVal];
              restoredCount++;
            }
          }
        },

        Seq(_, seq) {
          seq.items.forEach((item) => {
            if (isScalar(item) && typeof item.value === 'string') {
              const currentVal = item.value;
              if (reverseValues[currentVal]) {
                item.value = reverseValues[currentVal];
                restoredCount++;
              }
            }
          });
        },
      });
    });

    const astResult = serializeYamlDocuments(docs);

    // Secondary regex safety pass: ensure any remaining literal tokens in comments or quotes are cleanly reversed
    let refined = astResult;
    for (const [obf, orig] of tokenMap.entries()) {
      // Word boundary regex
      const escaped = obf.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const reg = new RegExp(`\\b${escaped}\\b`, 'g');
      if (reg.test(refined)) {
        refined = refined.replace(reg, orig);
        restoredCount++;
      }
    }

    return {
      deobfuscatedYaml: refined,
      restoredCount,
      unrecognizedTokens,
    };
  }

  // Fallback direct regex replacement across text
  let fallbackText = obfuscatedYaml;
  for (const [obf, orig] of tokenMap.entries()) {
    const escaped = obf.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const reg = new RegExp(`\\b${escaped}\\b`, 'g');
    if (reg.test(fallbackText)) {
      fallbackText = fallbackText.replace(reg, orig);
      restoredCount++;
    }
  }

  return {
    deobfuscatedYaml: fallbackText,
    restoredCount,
    unrecognizedTokens,
  };
}

/**
 * Configuration Export & Import Validator
 */
export interface YamlObfuscatorConfigExport {
  format: 'devhub-yaml-obfuscator-config';
  version: 1;
  id: string;
  name: string;
  description?: string;
  exportedAt: string;
  options: YamlObfuscatorOptions;
  mappings: {
    keys: Record<string, string>;
    values: Record<string, string>;
    anchors: Record<string, string>;
  };
  stats: YamlMappingStats;
}

export function createYamlConfigExport(
  mapping: YamlObfuscatorMapping,
  name?: string,
  description?: string
): YamlObfuscatorConfigExport {
  return {
    format: 'devhub-yaml-obfuscator-config',
    version: 1,
    id: mapping.id || `yaml-config-${Date.now()}`,
    name: name || mapping.name || 'YAML Obfuscation Profile',
    description: description || mapping.description || 'Configured YAML obfuscation mappings and options',
    exportedAt: new Date().toISOString(),
    options: { ...mapping.options },
    mappings: {
      keys: { ...mapping.keys },
      values: { ...mapping.values },
      anchors: { ...mapping.anchors },
    },
    stats: { ...mapping.stats },
  };
}

export function validateAndParseYamlConfig(input: string | unknown): {
  success: boolean;
  config?: YamlObfuscatorConfigExport;
  mapping?: YamlObfuscatorMapping;
  error?: string;
} {
  try {
    let raw: any;
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (!trimmed) {
        return { success: false, error: 'Configuration string is empty.' };
      }
      raw = JSON.parse(trimmed);
    } else {
      raw = input;
    }

    if (!raw || typeof raw !== 'object') {
      return { success: false, error: 'Invalid format: Root must be a JSON object.' };
    }

    if (raw.format !== 'devhub-yaml-obfuscator-config' && !raw.mappings && !raw.keys) {
      return {
        success: false,
        error: 'Invalid configuration format: Missing required YAML obfuscator format identifier.',
      };
    }

    // Extract options
    const options: YamlObfuscatorOptions = {
      ...DEFAULT_YAML_OBFUSCATOR_OPTIONS,
      ...(raw.options || {}),
      excludedKeys: Array.isArray(raw.options?.excludedKeys)
        ? raw.options.excludedKeys
        : DEFAULT_YAML_OBFUSCATOR_OPTIONS.excludedKeys,
      excludedValues: Array.isArray(raw.options?.excludedValues)
        ? raw.options.excludedValues
        : [],
    };

    // Extract mappings
    const keys: Record<string, string> = { ...(raw.mappings?.keys || raw.keys || {}) };
    const values: Record<string, string> = { ...(raw.mappings?.values || raw.values || {}) };
    const anchors: Record<string, string> = { ...(raw.mappings?.anchors || raw.anchors || {}) };

    const reverseKeys: Record<string, string> = {};
    for (const [k, v] of Object.entries(keys)) {
      if (k && v) reverseKeys[v] = k;
    }

    const reverseValues: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      if (k && v) reverseValues[v] = k;
    }

    const reverseAnchors: Record<string, string> = {};
    for (const [k, v] of Object.entries(anchors)) {
      if (k && v) reverseAnchors[v] = k;
    }

    const stats: YamlMappingStats = {
      keysCount: Object.keys(keys).length,
      valuesCount: Object.keys(values).length,
      anchorsCount: Object.keys(anchors).length,
      commentsCount: raw.stats?.commentsCount || 0,
      totalReplacements:
        raw.stats?.totalReplacements ||
        Object.keys(keys).length + Object.keys(values).length + Object.keys(anchors).length,
    };

    const config: YamlObfuscatorConfigExport = {
      format: 'devhub-yaml-obfuscator-config',
      version: 1,
      id: raw.id || `yaml-config-${Date.now()}`,
      name: raw.name || 'Imported YAML Obfuscator Configuration',
      description: raw.description || '',
      exportedAt: raw.exportedAt || new Date().toISOString(),
      options,
      mappings: {
        keys,
        values,
        anchors,
      },
      stats,
    };

    const mapping: YamlObfuscatorMapping = {
      format: 'devhub-yaml-obfuscator-config',
      version: 1,
      id: config.id,
      name: config.name,
      description: config.description,
      exportedAt: config.exportedAt,
      options,
      keys,
      values,
      anchors,
      reverseMapping: {
        keys: reverseKeys,
        values: reverseValues,
        anchors: reverseAnchors,
      },
      stats,
    };

    return { success: true, config, mapping };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to parse configuration JSON: ${err?.message || 'Invalid JSON syntax'}`,
    };
  }
}

// ==========================================
// PRESET REALISTIC YAML TEMPLATES
// ==========================================
export interface YamlPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  yaml: string;
}

export const YAML_PRESETS: YamlPreset[] = [
  {
    id: 'k8s-deployment-secret',
    name: 'Kubernetes Deployment & Secret',
    category: 'Kubernetes',
    description: 'Multi-document Kubernetes Deployment with container specs, env vars, ports & Secret credentials',
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service-deployment
  namespace: production-payments
  labels:
    app.kubernetes.io/name: payment-service
    app.kubernetes.io/version: "2.4.1"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-gateway
  template:
    metadata:
      labels:
        app: payment-gateway
    spec:
      containers:
        - name: payment-gateway-api
          image: internal-registry.company.net/fintech/payment-gateway:v2.4.1
          ports:
            - containerPort: 8443
              name: https
          env:
            - name: DATABASE_HOST
              value: "postgres-primary.internal.company.net"
            - name: DATABASE_USER
              value: "pg_fintech_user"
            - name: STRIPE_API_KEY
              valueFrom:
                secretKeyRef:
                  name: payment-credentials
                  key: stripe_live_key
            - name: ENCRYPTION_PASSPHRASE
              value: "vault-master-passphrase-9921#secure"
          resources:
            limits:
              cpu: "1000m"
              memory: "1024Mi"
            requests:
              cpu: "250m"
              memory: "256Mi"
---
apiVersion: v1
kind: Secret
metadata:
  name: payment-credentials
  namespace: production-payments
type: Opaque
stringData:
  stripe_live_key: "sk_live_51M0abcdef1234567890XYZ"
  webhook_secret: "whsec_39f08aa1b2c3d4e5f6071829"
  jwt_signing_key: "super-secure-production-jwt-key-2026"
`,
  },
  {
    id: 'docker-compose',
    name: 'Docker Compose Stack',
    category: 'Docker',
    description: 'Microservices compose stack with PostgreSQL database, Redis caching, credentials & anchors',
    yaml: `version: "3.9"

x-logging-defaults: &default-logging
  driver: "json-file"
  options:
    max-size: "20m"
    max-file: "5"

services:
  api-service:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
      DATABASE_URL: "postgresql://app_master:P@ssw0rd9988!@postgres-db:5432/finance_db"
      JWT_SECRET: "jwt-token-signing-secret-key-32chars!"
      REDIS_AUTH: "redis-cluster-auth-token-xyz"
      ADMIN_EMAIL: "devops-admin@enterprise-cloud.io"
    depends_on:
      - postgres-db
      - redis-cache
    logging: *default-logging

  postgres-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: finance_db
      POSTGRES_USER: app_master
      POSTGRES_PASSWORD: "P@ssw0rd9988!"
    volumes:
      - pgdata:/var/lib/postgresql/data
    logging: *default-logging

  redis-cache:
    image: redis:7-alpine
    command: redis-server --requirepass "redis-cluster-auth-token-xyz"
    ports:
      - "6379:6379"
    logging: *default-logging

volumes:
  pgdata:
    driver: local
`,
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions CI/CD Pipeline',
    category: 'CI/CD',
    description: 'Automated build, test and AWS cloud deployment workflow with sensitive access tokens',
    yaml: `name: Production Deployment Pipeline

on:
  push:
    branches:
      - main
      - release/*

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Authenticate to Private Registry
        run: |
          npm config set //npm.internal.company.net/:_authToken "\${{ secrets.NPM_ENTERPRISE_TOKEN }}"
        env:
          NPM_ENTERPRISE_TOKEN: "npm_sec_9941a87b6c5d4e3f210a"

      - name: Execute Tests and SonarQube Scan
        run: npm run test:coverage
        env:
          SONAR_TOKEN: "sqp_8832a89c74b1234567890abcdef"
          DATABASE_TEST_URI: "postgres://test_admin:test_secret@localhost:5432/test_db"

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: "AKIAIOSFODNN7EXAMPLE"
          aws-secret-access-key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
          aws-region: "us-east-1"

      - name: Deploy Container to ECS Cluster
        run: |
          aws ecs update-service --cluster production-ecs-cluster --service billing-api --force-new-deployment
`,
  },
  {
    id: 'spring-application',
    name: 'Spring Boot Application Config',
    category: 'Backend',
    description: 'Enterprise Spring Boot configuration with datasource, OAuth2 security, Kafka & mail endpoints',
    yaml: `spring:
  application:
    name: enterprise-order-service
  datasource:
    url: "jdbc:postgresql://db-orders.corp.internal:5432/orders_prod"
    username: "order_app_admin"
    password: "ProdSecureDatabasePassword2026!"
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  security:
    oauth2:
      client:
        registration:
          okta-auth:
            client-id: "0oa39f01ab2cd3ef4gh5"
            client-secret: "OktaClientSecret_V3_SuperKey9911"
            scope: "openid,profile,email"
  kafka:
    bootstrap-servers: "kafka-broker1.corp.internal:9092,kafka-broker2.corp.internal:9092"
    consumer:
      group-id: "order-processing-consumer-group"
    properties:
      sasl.jaas.config: "org.apache.kafka.common.security.plain.PlainLoginModule required username='kafka_admin' password='KafkaBrokerPasswordSecret!';"
  mail:
    host: "smtp.mailgun.org"
    port: 587
    username: "postmaster@mail.company-domain.com"
    password: "mailgun-api-smtp-password-secret-1234"
`,
  },
  {
    id: 'aws-cloudformation',
    name: 'AWS CloudFormation Serverless',
    category: 'Cloud',
    description: 'Serverless architecture with Lambda functions, DynamoDB tables and API Gateway endpoints',
    yaml: `AWSTemplateFormatVersion: "2010-09-09"
Description: "Production CloudFormation Template for Customer Auth & Account API"

Parameters:
  EnvironmentName:
    Type: String
    Default: "production"
  MasterDbPassword:
    Type: String
    NoEcho: true
    Default: "SuperCloudSecretDbPasswd992!"

Resources:
  CustomerAccountsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: "enterprise-customer-accounts-prod"
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: customer_id
          AttributeType: S
        - AttributeName: email_address
          AttributeType: S
      KeySchema:
        - AttributeName: customer_id
          KeyType: HASH

  CustomerAuthFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: "customer-auth-token-generator-prod"
      Runtime: nodejs20.x
      Handler: index.handler
      MemorySize: 512
      Timeout: 15
      Environment:
        Variables:
          AUTH0_DOMAIN: "enterprise-auth.us.auth0.com"
          AUTH0_CLIENT_ID: "client_id_prod_992211"
          AUTH0_CLIENT_SECRET: "auth0_secret_token_live_abc12345"
          PRIMARY_DB_PASSWORD: !Ref MasterDbPassword
`,
  },
  {
    id: 'openapi-specification',
    name: 'OpenAPI 3.0 API Specification',
    category: 'API',
    description: 'OpenAPI Swagger definition with internal routes, securitySchemes, and schema models',
    yaml: `openapi: "3.0.3"
info:
  title: "Enterprise Core Banking API"
  description: "RESTful endpoints for customer accounts, wire transfers, and card management"
  version: "1.2.0"
servers:
  - url: "https://api-banking.corp.internal/v1"
    description: "Internal Production Gateway"

paths:
  /customers/{customerId}/balance:
    get:
      summary: "Retrieve account balance and recent transactions"
      operationId: "getCustomerBalance"
      parameters:
        - name: customerId
          in: path
          required: true
          schema:
            type: string
            example: "cust-998822"
      security:
        - BearerAuth: []
        - InternalApiKey: []
      responses:
        "200":
          description: "Balance details retrieved"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AccountBalanceResponse"

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    InternalApiKey:
      type: apiKey
      in: header
      name: X-Internal-API-Key

  schemas:
    AccountBalanceResponse:
      type: object
      properties:
        account_number:
          type: string
          example: "ACC-9921-3342"
        available_balance:
          type: number
          example: 12450.75
        currency:
          type: string
          example: "USD"
`,
  },
];
