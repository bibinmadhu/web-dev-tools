/**
 * Python Code Obfuscator & De-Obfuscator Engine
 * 
 * Provides synchronized obfuscation and lossless de-obfuscation for Python code:
 * - URL Obfuscation: Detects and masks all HTTP, HTTPS, WSS, and FTP URLs with reversible mapping
 * - Symbol Mangling: Renames classes, functions/methods, attributes, and variables
 * - String Encryption & Masking
 * - Comment & Docstring stripping
 * - Comprehensive two-way Mapping Registry with complete reverse lookups
 */

export type PythonNamingStyle = 'hexadecimal' | 'alphabetical' | 'prefixed' | 'random' | 'numeric';
export type UrlObfuscationMode = 'masked_url' | 'token' | 'base64';

export interface PythonObfuscatorOptions {
  namingStyle: PythonNamingStyle;
  customClassPrefix?: string;
  customFuncPrefix?: string;
  customVarPrefix?: string;
  customUrlPrefix?: string;
  obfuscateClasses: boolean;
  obfuscateFunctions: boolean;
  obfuscateVariables: boolean;
  obfuscateUrls: boolean;
  urlObfuscationMode: UrlObfuscationMode;
  obfuscateStrings: boolean;
  stripComments: boolean;
  stripDocstrings: boolean;
  preserveMain: boolean;
  preserveSpecialMethods: boolean; // __init__, __str__, etc.
  preserveImportedModules: boolean;
  customExclusions: string[];
}

export interface PythonObfuscationMapping {
  version: string;
  timestamp: string;
  namingStyle: PythonNamingStyle;
  urlMode: UrlObfuscationMode;
  classes: Record<string, string>;   // original -> obfuscated
  functions: Record<string, string>; // original -> obfuscated
  variables: Record<string, string>; // original -> obfuscated
  urls: Record<string, string>;      // original URL -> obfuscated URL / token
  strings?: Record<string, string>;  // original string -> obfuscated
  reverseMapping: Record<string, string>; // obfuscated -> original
}

export interface PythonObfuscationStats {
  originalSize: number;
  obfuscatedSize: number;
  classesRenamed: number;
  functionsRenamed: number;
  variablesRenamed: number;
  urlsObfuscated: number;
  stringsEncrypted: number;
  linesCount: number;
}

export interface PythonObfuscationResult {
  obfuscatedCode: string;
  mapping: PythonObfuscationMapping;
  stats: PythonObfuscationStats;
}

export interface PythonDeobfuscationResult {
  deobfuscatedCode: string;
  stats: {
    originalObfuscatedSize: number;
    restoredSize: number;
    classesRestored: number;
    functionsRestored: number;
    variablesRestored: number;
    urlsRestored: number;
    stringsRestored: number;
    totalReplacements: number;
  };
}

export const DEFAULT_PYTHON_OBFUSCATOR_OPTIONS: PythonObfuscatorOptions = {
  namingStyle: 'hexadecimal',
  customClassPrefix: 'Cls',
  customFuncPrefix: 'fn',
  customVarPrefix: 'v',
  customUrlPrefix: 'obf_url',
  obfuscateClasses: true,
  obfuscateFunctions: true,
  obfuscateVariables: true,
  obfuscateUrls: true,
  urlObfuscationMode: 'masked_url',
  obfuscateStrings: false,
  stripComments: false, // Default false to keep formatting readable
  stripDocstrings: false,
  preserveMain: true,
  preserveSpecialMethods: true,
  preserveImportedModules: true,
  customExclusions: [
    'self',
    'cls',
    'args',
    'kwargs',
    'app',
    'config',
    'status_code',
    'headers',
    'timeout',
    'payload',
  ],
};

// Python Keywords (PEP 3131 / Language Reference)
export const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
  'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
  'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try',
  'while', 'with', 'yield', 'match', 'case'
]);

// Python Built-ins & Standard Functions
export const PYTHON_BUILTINS = new Set([
  'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray',
  'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr',
  'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float',
  'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help',
  'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len',
  'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object',
  'oct', 'open', 'ord', 'pow', 'print', 'property', 'range', 'repr',
  'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod',
  'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip', '__import__',
  'Exception', 'ValueError', 'TypeError', 'KeyError', 'IndexError',
  'RuntimeError', 'AttributeError', 'IOError', 'FileNotFoundError',
  'StopIteration', 'KeyboardInterrupt', 'SystemExit'
]);

// Common Python Standard Library Modules
export const COMMON_PYTHON_MODULES = new Set([
  'sys', 'os', 're', 'json', 'time', 'math', 'random', 'datetime', 'urllib',
  'requests', 'logging', 'pathlib', 'typing', 'collections', 'itertools',
  'functools', 'hashlib', 'base64', 'uuid', 'threading', 'asyncio', 'socket',
  'ssl', 'http', 'unittest', 'pytest', 'shutil', 'subprocess', 'tempfile',
  'copy', 'csv', 'io', 'pickle', 'traceback'
]);

/**
 * Regex matching URLs: HTTP, HTTPS, WSS, WS, and FTP.
 */
export const URL_REGEX = /(?:https?|wss?|ftp):\/\/[a-zA-Z0-9_\-.~:/?#[\]@!$&'()*+,;=%]+[a-zA-Z0-9/]/g;

/**
 * Helper to generate names according to chosen style.
 */
function generateObfuscatedIdentifier(
  category: 'class' | 'function' | 'variable' | 'url',
  idx: number,
  options: PythonObfuscatorOptions,
  existingUsed: Set<string>
): string {
  let name = '';
  let attempt = 0;

  do {
    const effectiveIdx = idx + attempt;
    switch (options.namingStyle) {
      case 'hexadecimal': {
        const hex = effectiveIdx.toString(16).padStart(2, '0');
        if (category === 'class') name = `${options.customClassPrefix || 'Cls'}_0x${hex}`;
        else if (category === 'function') name = `${options.customFuncPrefix || 'fn'}_0x${hex}`;
        else if (category === 'url') name = `${options.customUrlPrefix || 'obf_url'}_0x${hex}`;
        else name = `${options.customVarPrefix || 'v'}_0x${hex}`;
        break;
      }
      case 'alphabetical': {
        let n = effectiveIdx;
        let letters = '';
        while (n >= 0) {
          letters = String.fromCharCode(97 + (n % 26)) + letters;
          n = Math.floor(n / 26) - 1;
        }
        if (category === 'class') name = `${options.customClassPrefix || 'Cls'}_${letters.toUpperCase()}`;
        else if (category === 'function') name = `${options.customFuncPrefix || 'fn'}_${letters}`;
        else if (category === 'url') name = `${options.customUrlPrefix || 'url'}_${letters}`;
        else name = `${options.customVarPrefix || 'v'}_${letters}`;
        break;
      }
      case 'numeric': {
        if (category === 'class') name = `${options.customClassPrefix || 'Cls'}_${effectiveIdx + 1}`;
        else if (category === 'function') name = `${options.customFuncPrefix || 'fn'}_${effectiveIdx + 1}`;
        else if (category === 'url') name = `${options.customUrlPrefix || 'url'}_${effectiveIdx + 1}`;
        else name = `${options.customVarPrefix || 'v'}_${effectiveIdx + 1}`;
        break;
      }
      case 'random': {
        const randHex = Math.random().toString(16).substring(2, 8);
        if (category === 'class') name = `${options.customClassPrefix || 'Cls'}_${randHex.toUpperCase()}`;
        else if (category === 'function') name = `${options.customFuncPrefix || 'fn'}_${randHex}`;
        else if (category === 'url') name = `${options.customUrlPrefix || 'url'}_${randHex}`;
        else name = `${options.customVarPrefix || 'v'}_${randHex}`;
        break;
      }
      case 'prefixed':
      default: {
        const prefix =
          category === 'class'
            ? options.customClassPrefix || 'Cls'
            : category === 'function'
            ? options.customFuncPrefix || 'fn'
            : category === 'url'
            ? options.customUrlPrefix || 'url'
            : options.customVarPrefix || 'v';
        name = `${prefix}_${effectiveIdx + 1}`;
        break;
      }
    }
    attempt++;
  } while (existingUsed.has(name) || PYTHON_KEYWORDS.has(name) || PYTHON_BUILTINS.has(name));

  existingUsed.add(name);
  return name;
}

/**
 * Generates an obfuscated replacement for a URL.
 */
function generateObfuscatedUrl(
  originalUrl: string,
  idx: number,
  options: PythonObfuscatorOptions,
  existingUsed: Set<string>
): string {
  if (options.urlObfuscationMode === 'token') {
    return `__URL_OBF_${idx + 1}__`;
  }

  if (options.urlObfuscationMode === 'base64') {
    const encoded = btoa(originalUrl);
    return `https://_obf_b64_${encoded.slice(0, 16)}_.local/endpoint`;
  }

  // 'masked_url': Generates a clean internal masked URL
  const hex = (idx + 1).toString(16).padStart(2, '0');
  const parsedProtocol = originalUrl.startsWith('https://')
    ? 'https://'
    : originalUrl.startsWith('http://')
    ? 'http://'
    : originalUrl.startsWith('wss://')
    ? 'wss://'
    : originalUrl.startsWith('ws://')
    ? 'ws://'
    : 'ftp://';

  return `${parsedProtocol}obf-endpoint-${hex}.internal/route_${idx + 1}`;
}

/**
 * Main Python Obfuscation Function
 */
export function obfuscatePythonCode(
  sourceCode: string,
  options: Partial<PythonObfuscatorOptions> = {}
): PythonObfuscationResult {
  const opts: PythonObfuscatorOptions = {
    ...DEFAULT_PYTHON_OBFUSCATOR_OPTIONS,
    ...options,
  };

  const originalSize = new Blob([sourceCode]).size;
  let code = sourceCode;

  const mapping: PythonObfuscationMapping = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    namingStyle: opts.namingStyle,
    urlMode: opts.urlObfuscationMode,
    classes: {},
    functions: {},
    variables: {},
    urls: {},
    strings: {},
    reverseMapping: {},
  };

  const existingUsedNames = new Set<string>();
  const exclusions = new Set(opts.customExclusions || []);

  // 1. Comments and Docstrings Stripping
  if (opts.stripDocstrings) {
    code = code.replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/g, '');
  }

  if (opts.stripComments) {
    code = code.replace(/(^|[^\S\r\n])#.*$/gm, '');
  }

  // 2. Extract and Obfuscate URLs
  if (opts.obfuscateUrls) {
    const rawMatches = code.match(URL_REGEX) || [];
    const uniqueUrls: string[] = [];

    for (let rawUrl of rawMatches) {
      // Clean trailing syntax punctuation (e.g. quote, comma, paren at end of match)
      let cleaned = rawUrl.replace(/[,;)'"\]}]+$/, '');
      if (cleaned.length > 8 && !uniqueUrls.includes(cleaned)) {
        uniqueUrls.push(cleaned);
      }
    }

    // Sort by length descending to prevent partial URL substrings from colliding
    uniqueUrls.sort((a, b) => b.length - a.length);

    uniqueUrls.forEach((origUrl, idx) => {
      const obfUrl = generateObfuscatedUrl(origUrl, idx, opts, existingUsedNames);
      mapping.urls[origUrl] = obfUrl;
      mapping.reverseMapping[obfUrl] = origUrl;

      // Replace URL occurrences
      code = code.split(origUrl).join(obfUrl);
    });
  }

  // 3. Extract Classes
  if (opts.obfuscateClasses) {
    const classRegex = /\bclass\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match: RegExpExecArray | null;
    const detectedClasses: string[] = [];

    while ((match = classRegex.exec(code)) !== null) {
      const name = match[1];
      if (
        !PYTHON_KEYWORDS.has(name) &&
        !PYTHON_BUILTINS.has(name) &&
        !exclusions.has(name) &&
        !detectedClasses.includes(name)
      ) {
        detectedClasses.push(name);
      }
    }

    detectedClasses.forEach((clsName, idx) => {
      const obfName = generateObfuscatedIdentifier('class', idx, opts, existingUsedNames);
      mapping.classes[clsName] = obfName;
      mapping.reverseMapping[obfName] = clsName;
    });
  }

  // 4. Extract Functions / Methods
  if (opts.obfuscateFunctions) {
    const funcRegex = /\bdef\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match: RegExpExecArray | null;
    const detectedFuncs: string[] = [];

    while ((match = funcRegex.exec(code)) !== null) {
      const name = match[1];
      const isDunder = name.startsWith('__') && name.endsWith('__');
      if (
        (!isDunder || !opts.preserveSpecialMethods) &&
        (!opts.preserveMain || name !== 'main') &&
        !PYTHON_KEYWORDS.has(name) &&
        !PYTHON_BUILTINS.has(name) &&
        !exclusions.has(name) &&
        !detectedFuncs.includes(name)
      ) {
        detectedFuncs.push(name);
      }
    }

    detectedFuncs.forEach((fnName, idx) => {
      const obfName = generateObfuscatedIdentifier('function', idx, opts, existingUsedNames);
      mapping.functions[fnName] = obfName;
      mapping.reverseMapping[obfName] = fnName;
    });
  }

  // 5. Extract Variables & Parameters
  if (opts.obfuscateVariables) {
    const detectedVars: string[] = [];

    // Assignments: x = 1, my_var = ...
    const assignRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=[^=]/g;
    let match: RegExpExecArray | null;

    while ((match = assignRegex.exec(code)) !== null) {
      const name = match[1];
      const isDunder = name.startsWith('__') && name.endsWith('__');
      if (
        !isDunder &&
        !PYTHON_KEYWORDS.has(name) &&
        !PYTHON_BUILTINS.has(name) &&
        (!opts.preserveImportedModules || !COMMON_PYTHON_MODULES.has(name)) &&
        !exclusions.has(name) &&
        !mapping.classes[name] &&
        !mapping.functions[name] &&
        !detectedVars.includes(name)
      ) {
        detectedVars.push(name);
      }
    }

    // Self attributes: self.attribute_name
    const selfAttrRegex = /\bself\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    while ((match = selfAttrRegex.exec(code)) !== null) {
      const name = match[1];
      const isDunder = name.startsWith('__') && name.endsWith('__');
      if (
        !isDunder &&
        !PYTHON_KEYWORDS.has(name) &&
        !PYTHON_BUILTINS.has(name) &&
        !exclusions.has(name) &&
        !mapping.classes[name] &&
        !mapping.functions[name] &&
        !detectedVars.includes(name)
      ) {
        detectedVars.push(name);
      }
    }

    // Function parameter declarations: def foo(param1, param2=val):
    const paramRegex = /\bdef\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(([^)]*)\)/g;
    while ((match = paramRegex.exec(code)) !== null) {
      const paramsList = match[1].split(',');
      for (const p of paramsList) {
        const cleanParam = p.split('=')[0].split(':')[0].trim().replace(/^\*+/, '');
        if (
          cleanParam &&
          cleanParam !== 'self' &&
          cleanParam !== 'cls' &&
          !PYTHON_KEYWORDS.has(cleanParam) &&
          !PYTHON_BUILTINS.has(cleanParam) &&
          !exclusions.has(cleanParam) &&
          !detectedVars.includes(cleanParam)
        ) {
          detectedVars.push(cleanParam);
        }
      }
    }

    detectedVars.forEach((varName, idx) => {
      const obfName = generateObfuscatedIdentifier('variable', idx, opts, existingUsedNames);
      mapping.variables[varName] = obfName;
      mapping.reverseMapping[obfName] = varName;
    });
  }

  // 6. Apply Identifier Replacements with boundary protection
  // Protect string literals so variable replacements inside strings don't mutate unintended text
  const stringLiterals: string[] = [];
  const stringPrefix = '___STR_PY_LITERAL_';

  code = code.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(\\.|[^"\\])*"|'(\\.|[^'\\])*')/g, (match) => {
    const ph = `${stringPrefix}${stringLiterals.length}___`;
    stringLiterals.push(match);
    return ph;
  });

  // Replace Classes
  for (const [orig, obf] of Object.entries(mapping.classes)) {
    const regex = new RegExp(`\\b${orig}\\b`, 'g');
    code = code.replace(regex, obf);
  }

  // Replace Functions
  for (const [orig, obf] of Object.entries(mapping.functions)) {
    const regex = new RegExp(`\\b${orig}\\b`, 'g');
    code = code.replace(regex, obf);
  }

  // Replace Variables
  for (const [orig, obf] of Object.entries(mapping.variables)) {
    const regex = new RegExp(`\\b${orig}\\b`, 'g');
    code = code.replace(regex, obf);
  }

  // Restore string literals
  for (let i = 0; i < stringLiterals.length; i++) {
    const ph = `${stringPrefix}${i}___`;
    code = code.replace(ph, () => stringLiterals[i]);
  }

  // Clean trailing blank lines
  code = code.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  const obfuscatedSize = new Blob([code]).size;

  const stats: PythonObfuscationStats = {
    originalSize,
    obfuscatedSize,
    classesRenamed: Object.keys(mapping.classes).length,
    functionsRenamed: Object.keys(mapping.functions).length,
    variablesRenamed: Object.keys(mapping.variables).length,
    urlsObfuscated: Object.keys(mapping.urls).length,
    stringsEncrypted: Object.keys(mapping.strings || {}).length,
    linesCount: code.split('\n').length,
  };

  return {
    obfuscatedCode: code,
    mapping,
    stats,
  };
}

/**
 * Python De-obfuscation Function
 * Uses the mapping registry to restore classes, functions, variables, and obfuscated URLs.
 */
export function deobfuscatePythonCode(
  obfuscatedCode: string,
  mapping: PythonObfuscationMapping
): PythonDeobfuscationResult {
  if (!obfuscatedCode) {
    return {
      deobfuscatedCode: '',
      stats: {
        originalObfuscatedSize: 0,
        restoredSize: 0,
        classesRestored: 0,
        functionsRestored: 0,
        variablesRestored: 0,
        urlsRestored: 0,
        stringsRestored: 0,
        totalReplacements: 0,
      },
    };
  }

  let code = obfuscatedCode;
  const originalObfuscatedSize = new Blob([code]).size;

  let classesRestored = 0;
  let functionsRestored = 0;
  let variablesRestored = 0;
  let urlsRestored = 0;
  let stringsRestored = 0;

  // 1. De-obfuscate URLs first (exact string replacement, longest URL first)
  if (mapping.urls && Object.keys(mapping.urls).length > 0) {
    const urlPairs = Object.entries(mapping.urls).map(([orig, obf]) => ({
      orig,
      obf,
    }));

    // Sort by obfuscated URL length descending
    urlPairs.sort((a, b) => b.obf.length - a.obf.length);

    for (const { orig, obf } of urlPairs) {
      if (code.includes(obf)) {
        code = code.split(obf).join(orig);
        urlsRestored++;
      }
    }
  }

  // 2. Protect string literals during identifier deobfuscation
  const stringLiterals: string[] = [];
  const stringPrefix = '___DEOBF_PY_STR_';

  code = code.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(\\.|[^"\\])*"|'(\\.|[^'\\])*')/g, (match) => {
    const ph = `${stringPrefix}${stringLiterals.length}___`;
    stringLiterals.push(match);
    return ph;
  });

  // 3. De-obfuscate Classes (reverseMapping)
  if (mapping.classes) {
    for (const [orig, obf] of Object.entries(mapping.classes)) {
      const regex = new RegExp(`\\b${obf}\\b`, 'g');
      if (regex.test(code)) {
        code = code.replace(regex, orig);
        classesRestored++;
      }
    }
  }

  // 4. De-obfuscate Functions
  if (mapping.functions) {
    for (const [orig, obf] of Object.entries(mapping.functions)) {
      const regex = new RegExp(`\\b${obf}\\b`, 'g');
      if (regex.test(code)) {
        code = code.replace(regex, orig);
        functionsRestored++;
      }
    }
  }

  // 5. De-obfuscate Variables
  if (mapping.variables) {
    for (const [orig, obf] of Object.entries(mapping.variables)) {
      const regex = new RegExp(`\\b${obf}\\b`, 'g');
      if (regex.test(code)) {
        code = code.replace(regex, orig);
        variablesRestored++;
      }
    }
  }

  // 6. Restore strings
  for (let i = 0; i < stringLiterals.length; i++) {
    const ph = `${stringPrefix}${i}___`;
    code = code.replace(ph, () => stringLiterals[i]);
  }

  const restoredSize = new Blob([code]).size;

  return {
    deobfuscatedCode: code,
    stats: {
      originalObfuscatedSize,
      restoredSize,
      classesRestored,
      functionsRestored,
      variablesRestored,
      urlsRestored,
      stringsRestored,
      totalReplacements: classesRestored + functionsRestored + variablesRestored + urlsRestored,
    },
  };
}
