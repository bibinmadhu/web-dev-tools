import YAML from 'yaml';

export interface JsonStats {
  byteSize: number;
  charCount: number;
  lines: number;
  nodeCount: number;
  maxDepth: number;
  keyCount: number;
  arrayItemCount: number;
}

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  inKeys: boolean;
  inValues: boolean;
}

export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  caseSensitive: false,
  wholeWord: false,
  useRegex: false,
  inKeys: true,
  inValues: true,
};

/**
 * Safely parses JSON text and computes line & column if an error occurs
 */
export function parseJsonSafe(text: string): {
  data: any;
  error: string | null;
  line?: number;
  column?: number;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { data: null, error: null };
  }

  try {
    const data = JSON.parse(text);
    return { data, error: null };
  } catch (err: any) {
    const errMsg = err?.message || 'Invalid JSON syntax';
    let line: number | undefined;
    let column: number | undefined;

    // Extract line/column from standard error formats (e.g., "at line 3 column 5")
    const match = errMsg.match(/line\s+(\d+)\s+column\s+(\d+)/i) || errMsg.match(/position\s+(\d+)/i);
    if (match) {
      if (match.length >= 3) {
        line = parseInt(match[1], 10);
        column = parseInt(match[2], 10);
      } else if (match[1]) {
        const pos = parseInt(match[1], 10);
        const upToPos = text.slice(0, pos);
        const lines = upToPos.split('\n');
        line = lines.length;
        column = (lines[lines.length - 1]?.length || 0) + 1;
      }
    }

    return { data: null, error: errMsg, line, column };
  }
}

/**
 * Attempts to automatically fix common non-standard JSON mistakes:
 * 1. Single quotes to double quotes
 * 2. Unquoted object keys (e.g. { foo: "bar" } -> { "foo": "bar" })
 * 3. Trailing commas before } or ]
 * 4. Python boolean/None values (True -> true, False -> false, None -> null)
 * 5. JavaScript comments (// ... and /* ... *\/)
 */
export function tryFixCommonJsonErrors(text: string): {
  fixed: string;
  modified: boolean;
  fixes: string[];
} {
  const fixes: string[] = [];
  let current = text;

  // 1. Remove single-line comments
  if (/\/\/.*$/m.test(current)) {
    current = current.replace(/\/\/.*$/gm, '');
    fixes.push('Removed single-line comments (//)');
  }

  // 2. Remove multi-line comments
  if (/\/\*[\s\S]*?\*\//.test(current)) {
    current = current.replace(/\/\*[\s\S]*?\*\//g, '');
    fixes.push('Removed multi-line comments (/* ... */)');
  }

  // 3. Replace Python constants
  if (/\b(True|False|None)\b/.test(current)) {
    current = current
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null');
    fixes.push('Converted Python True/False/None to true/false/null');
  }

  // 4. Replace single quoted strings with double quotes (outside existing double strings)
  if (/'([^'\\]*(?:\\.[^'\\]*)*)'/.test(current)) {
    current = current.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_match, inner) => {
      const escapedInner = inner.replace(/"/g, '\\"');
      return `"${escapedInner}"`;
    });
    fixes.push('Converted single quotes to double quotes');
  }

  // 5. Unquoted object keys: { key: ... } or , key: ...
  const unquotedKeyRegex = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)(\s*:)/g;
  if (unquotedKeyRegex.test(current)) {
    current = current.replace(unquotedKeyRegex, '$1"$2"$3');
    fixes.push('Added double quotes around unquoted object keys');
  }

  // 6. Trailing commas before } or ]
  if (/,\s*([}\]])/.test(current)) {
    current = current.replace(/,\s*([}\]])/g, '$1');
    fixes.push('Removed trailing commas');
  }

  // Test if fixed string is now valid JSON
  try {
    JSON.parse(current);
    return {
      fixed: current,
      modified: fixes.length > 0 && current !== text,
      fixes,
    };
  } catch (e) {
    // If still failing, return attempt with fixes applied
    return {
      fixed: current,
      modified: fixes.length > 0 && current !== text,
      fixes,
    };
  }
}

/**
 * Builds a regex pattern based on search options
 */
function createSearchMatcher(
  search: string,
  options: SearchOptions
): RegExp | null {
  if (!search) return null;

  let pattern = search;
  if (!options.useRegex) {
    pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  if (options.wholeWord) {
    pattern = `\\b${pattern}\\b`;
  }

  const flags = options.caseSensitive ? 'g' : 'gi';
  try {
    return new RegExp(pattern, flags);
  } catch (e) {
    return null;
  }
}

/**
 * Counts total matches of search query across JSON structure
 */
export function countMatches(data: any, search: string, options: SearchOptions): number {
  if (data === undefined || !search) return 0;
  const regex = createSearchMatcher(search, options);
  if (!regex) return 0;

  let count = 0;

  function traverse(node: any) {
    if (node === null || node === undefined) return;

    if (typeof node === 'string') {
      if (options.inValues) {
        const matches = node.match(regex);
        if (matches) count += matches.length;
      }
      return;
    }

    if (typeof node === 'number' || typeof node === 'boolean') {
      if (options.inValues) {
        const str = String(node);
        const matches = str.match(regex);
        if (matches) count += matches.length;
      }
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        traverse(item);
      }
      return;
    }

    if (typeof node === 'object') {
      for (const key of Object.keys(node)) {
        if (options.inKeys) {
          const matches = key.match(regex);
          if (matches) count += matches.length;
        }
        traverse(node[key]);
      }
    }
  }

  traverse(data);
  return count;
}

/**
 * Deeply search and replace in keys and/or values
 */
export function searchAndReplaceJson(
  data: any,
  search: string,
  replace: string,
  options: SearchOptions
): { result: any; replaceCount: number } {
  if (!search) {
    return { result: data, replaceCount: 0 };
  }

  const regex = createSearchMatcher(search, options);
  if (!regex) {
    return { result: data, replaceCount: 0 };
  }

  let replaceCount = 0;

  function traverse(node: any): any {
    if (node === null || node === undefined) {
      return node;
    }

    if (typeof node === 'string') {
      if (options.inValues) {
        const replaced = node.replace(regex, (match) => {
          replaceCount++;
          return replace;
        });
        return replaced;
      }
      return node;
    }

    if (typeof node === 'number') {
      if (options.inValues) {
        const str = String(node);
        if (regex.test(str)) {
          const replacedStr = str.replace(regex, () => {
            replaceCount++;
            return replace;
          });
          const parsed = Number(replacedStr);
          return isNaN(parsed) ? replacedStr : parsed;
        }
      }
      return node;
    }

    if (typeof node === 'boolean') {
      if (options.inValues) {
        const str = String(node);
        if (regex.test(str)) {
          const replacedStr = str.replace(regex, () => {
            replaceCount++;
            return replace;
          });
          if (replacedStr === 'true') return true;
          if (replacedStr === 'false') return false;
          return replacedStr;
        }
      }
      return node;
    }

    if (Array.isArray(node)) {
      return node.map((item) => traverse(item));
    }

    if (typeof node === 'object') {
      const newObj: Record<string, any> = {};
      for (const key of Object.keys(node)) {
        let newKey = key;
        if (options.inKeys) {
          newKey = key.replace(regex, () => {
            replaceCount++;
            return replace;
          });
        }
        newObj[newKey] = traverse(node[key]);
      }
      return newObj;
    }

    return node;
  }

  const cloned = JSON.parse(JSON.stringify(data));
  const result = traverse(cloned);
  return { result, replaceCount };
}

/**
 * Updates a value at a specific path immutably
 */
export function updateNodeAtPath(
  data: any,
  path: (string | number)[],
  newValue: any
): any {
  if (path.length === 0) {
    return newValue;
  }

  const [currentHead, ...tail] = path;

  if (Array.isArray(data)) {
    const idx = Number(currentHead);
    const newArr = [...data];
    if (tail.length === 0) {
      newArr[idx] = newValue;
    } else {
      newArr[idx] = updateNodeAtPath(newArr[idx], tail, newValue);
    }
    return newArr;
  }

  if (data && typeof data === 'object') {
    const key = String(currentHead);
    const newObj = { ...data };
    if (tail.length === 0) {
      newObj[key] = newValue;
    } else {
      newObj[key] = updateNodeAtPath(newObj[key], tail, newValue);
    }
    return newObj;
  }

  return data;
}

/**
 * Renames an object key at a specific path
 */
export function renameKeyAtPath(
  data: any,
  parentPath: (string | number)[],
  oldKey: string,
  newKey: string
): any {
  if (!newKey || oldKey === newKey) return data;

  const target = parentPath.length === 0 ? data : getNodeAtPath(data, parentPath);
  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return data;
  }

  const newObj: Record<string, any> = {};
  for (const k of Object.keys(target)) {
    if (k === oldKey) {
      newObj[newKey] = target[k];
    } else {
      newObj[k] = target[k];
    }
  }

  if (parentPath.length === 0) {
    return newObj;
  }

  return updateNodeAtPath(data, parentPath, newObj);
}

/**
 * Gets the node at a specific path
 */
export function getNodeAtPath(data: any, path: (string | number)[]): any {
  let curr = data;
  for (const step of path) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[step];
  }
  return curr;
}

/**
 * Deletes a key or array index at a specific path
 */
export function deleteNodeAtPath(data: any, path: (string | number)[]): any {
  if (path.length === 0) {
    return null;
  }

  const parentPath = path.slice(0, -1);
  const targetKey = path[path.length - 1];

  const parent = parentPath.length === 0 ? data : getNodeAtPath(data, parentPath);
  if (!parent) return data;

  if (Array.isArray(parent)) {
    const idx = Number(targetKey);
    const newArr = parent.filter((_, i) => i !== idx);
    if (parentPath.length === 0) return newArr;
    return updateNodeAtPath(data, parentPath, newArr);
  }

  if (typeof parent === 'object') {
    const key = String(targetKey);
    const { [key]: _deleted, ...rest } = parent;
    if (parentPath.length === 0) return rest;
    return updateNodeAtPath(data, parentPath, rest);
  }

  return data;
}

/**
 * Inserts a child node into an object or array at a specific path
 */
export function insertChildAtPath(
  data: any,
  targetPath: (string | number)[],
  keyOrIndex: string | number,
  value: any
): any {
  const target = targetPath.length === 0 ? data : getNodeAtPath(data, targetPath);
  if (!target) return data;

  if (Array.isArray(target)) {
    const newArr = [...target];
    if (typeof keyOrIndex === 'number' && keyOrIndex >= 0 && keyOrIndex <= newArr.length) {
      newArr.splice(keyOrIndex, 0, value);
    } else {
      newArr.push(value);
    }
    if (targetPath.length === 0) return newArr;
    return updateNodeAtPath(data, targetPath, newArr);
  }

  if (typeof target === 'object') {
    const key = String(keyOrIndex);
    const newObj = { ...target, [key]: value };
    if (targetPath.length === 0) return newObj;
    return updateNodeAtPath(data, targetPath, newObj);
  }

  return data;
}

/**
 * Duplicates a node at a path
 */
export function duplicateNodeAtPath(data: any, path: (string | number)[]): any {
  if (path.length === 0) return data;

  const parentPath = path.slice(0, -1);
  const targetKey = path[path.length - 1];
  const parent = parentPath.length === 0 ? data : getNodeAtPath(data, parentPath);
  if (!parent) return data;

  const valToDuplicate = JSON.parse(JSON.stringify(parent[targetKey]));

  if (Array.isArray(parent)) {
    const idx = Number(targetKey);
    const newArr = [...parent];
    newArr.splice(idx + 1, 0, valToDuplicate);
    if (parentPath.length === 0) return newArr;
    return updateNodeAtPath(data, parentPath, newArr);
  }

  if (typeof parent === 'object') {
    const origKey = String(targetKey);
    let newKey = `${origKey}_copy`;
    let counter = 1;
    while (newKey in parent) {
      counter++;
      newKey = `${origKey}_copy${counter}`;
    }
    const newObj = { ...parent, [newKey]: valToDuplicate };
    if (parentPath.length === 0) return newObj;
    return updateNodeAtPath(data, parentPath, newObj);
  }

  return data;
}

/**
 * Formats a path array into a readable JSONPath (e.g. `users[0].address.city`)
 */
export function formatJsonPath(path: (string | number)[]): string {
  if (path.length === 0) return '$';
  let result = '$';
  for (const seg of path) {
    if (typeof seg === 'number' || /^\d+$/.test(String(seg))) {
      result += `[${seg}]`;
    } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(String(seg))) {
      result += `.${seg}`;
    } else {
      result += `["${String(seg).replace(/"/g, '\\"')}"]`;
    }
  }
  return result;
}

/**
 * Sorts object keys alphabetically
 */
export function sortJsonKeys(
  data: any,
  direction: 'asc' | 'desc' = 'asc',
  recursive = true
): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    if (!recursive) return data;
    return data.map((item) => sortJsonKeys(item, direction, recursive));
  }

  const sortedKeys = Object.keys(data).sort((a, b) => {
    return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
  });

  const sortedObj: Record<string, any> = {};
  for (const k of sortedKeys) {
    sortedObj[k] = recursive ? sortJsonKeys(data[k], direction, recursive) : data[k];
  }
  return sortedObj;
}

/**
 * Flattens a nested JSON object into dot-separated keys
 */
export function flattenJson(data: any, separator = '.'): Record<string, any> {
  const result: Record<string, any> = {};

  function recurse(cur: any, prop: string) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      if (cur.length === 0) {
        result[prop] = [];
      } else {
        for (let i = 0; i < cur.length; i++) {
          recurse(cur[i], prop ? `${prop}[${i}]` : `[${i}]`);
        }
      }
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? `${prop}${separator}${p}` : p);
      }
      if (isEmpty && prop) {
        result[prop] = {};
      }
    }
  }

  recurse(data, '');
  return result;
}

/**
 * Unflattens dot-separated keys back into a nested JSON structure
 */
export function unflattenJson(data: Record<string, any>, separator = '.'): any {
  if (Object(data) !== data || Array.isArray(data)) return data;

  const regex = /\.?([^.[\]]+)|\[(\d+)\]/g;
  const result: any = {};

  for (const p in data) {
    let cur = result;
    let prop = '';
    let m: RegExpExecArray | null;

    const parts: { key: string; isIndex: boolean }[] = [];
    while ((m = regex.exec(p)) !== null) {
      if (m[2] !== undefined) {
        parts.push({ key: m[2], isIndex: true });
      } else if (m[1] !== undefined) {
        parts.push({ key: m[1], isIndex: false });
      }
    }

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const nextPart = parts[i + 1];

      if (isLast) {
        cur[part.key] = data[p];
      } else {
        if (!(part.key in cur)) {
          cur[part.key] = nextPart?.isIndex ? [] : {};
        }
        cur = cur[part.key];
      }
    }
  }

  return result[''] !== undefined ? result[''] : result;
}

/**
 * Converts JSON array of objects to CSV string
 */
export function jsonToCsv(data: any): string {
  const items = Array.isArray(data) ? data : [data];
  if (items.length === 0) return '';

  // Extract all unique column keys
  const headersSet = new Set<string>();
  items.forEach((item) => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach((k) => headersSet.add(k));
    }
  });

  const headers = Array.from(headersSet);
  if (headers.length === 0) return '';

  const csvRows: string[] = [];
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  items.forEach((item) => {
    const row = headers.map((header) => {
      const val = item ? item[header] : undefined;
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Converts CSV string to JSON array of objects
 */
export function csvToJson(csv: string): any[] {
  const lines = csv.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let insideQuotes = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (insideQuotes && next === '"') {
          entry += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(entry);
        entry = '';
      } else {
        entry += char;
      }
    }
    result.push(entry);
    return result;
  };

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1);

  return rows.map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, any> = {};
    headers.forEach((header, idx) => {
      const raw = values[idx] !== undefined ? values[idx].trim() : '';
      // Try to parse numbers/booleans/JSON
      if (raw === 'true') obj[header] = true;
      else if (raw === 'false') obj[header] = false;
      else if (raw === 'null') obj[header] = null;
      else if (/^-?\d+(\.\d+)?$/.test(raw)) obj[header] = Number(raw);
      else {
        try {
          if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
            obj[header] = JSON.parse(raw);
          } else {
            obj[header] = raw;
          }
        } catch {
          obj[header] = raw;
        }
      }
    });
    return obj;
  });
}

/**
 * Converts JSON to YAML string
 */
export function jsonToYaml(data: any): string {
  try {
    return YAML.stringify(data);
  } catch (err: any) {
    return `# Error converting to YAML: ${err?.message}`;
  }
}

/**
 * Converts YAML string to JSON
 */
export function yamlToJson(yamlText: string): any {
  try {
    return YAML.parse(yamlText);
  } catch (err: any) {
    throw new Error(`YAML Parse Error: ${err?.message}`);
  }
}

/**
 * Generates TypeScript interface definitions from a JSON object
 */
export function generateTypeScriptTypes(data: any, rootName = 'RootObject'): string {
  const interfaces: string[] = [];

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getType(val: any, keyName: string): string {
    if (val === null) return 'null';
    if (val === undefined) return 'any';

    const t = typeof val;
    if (t === 'string') return 'string';
    if (t === 'number') return 'number';
    if (t === 'boolean') return 'boolean';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const sampleItem = val[0];
      const subType = getType(sampleItem, `${keyName}Item`);
      return `${subType}[]`;
    }

    if (t === 'object') {
      const interfaceName = capitalize(keyName);
      buildInterface(val, interfaceName);
      return interfaceName;
    }

    return 'any';
  }

  function buildInterface(obj: Record<string, any>, name: string) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;

    const fields: string[] = [];
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const validPropName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const typeStr = getType(val, key);
      fields.push(`  ${validPropName}: ${typeStr};`);
    }

    const iface = `export interface ${name} {\n${fields.join('\n')}\n}`;
    if (!interfaces.includes(iface)) {
      interfaces.push(iface);
    }
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      buildInterface(data[0], `${rootName}Item`);
      interfaces.push(`export type ${rootName} = ${rootName}Item[];`);
    } else {
      interfaces.push(`export type ${rootName} = any[];`);
    }
  } else if (typeof data === 'object' && data !== null) {
    buildInterface(data, rootName);
  } else {
    interfaces.push(`export type ${rootName} = ${typeof data};`);
  }

  return interfaces.join('\n\n');
}

/**
 * Calculates detailed statistics for a JSON document
 */
export function calculateJsonStats(data: any, rawText: string): JsonStats {
  const byteSize = new Blob([rawText]).size;
  const charCount = rawText.length;
  const lines = rawText ? rawText.split('\n').length : 0;

  let nodeCount = 0;
  let maxDepth = 0;
  let keyCount = 0;
  let arrayItemCount = 0;

  function traverse(node: any, depth: number) {
    nodeCount++;
    if (depth > maxDepth) maxDepth = depth;

    if (node === null || node === undefined || typeof node !== 'object') {
      return;
    }

    if (Array.isArray(node)) {
      arrayItemCount += node.length;
      for (const item of node) {
        traverse(item, depth + 1);
      }
      return;
    }

    const keys = Object.keys(node);
    keyCount += keys.length;
    for (const k of keys) {
      traverse(node[k], depth + 1);
    }
  }

  if (data !== null && data !== undefined) {
    traverse(data, 1);
  }

  return {
    byteSize,
    charCount,
    lines,
    nodeCount,
    maxDepth,
    keyCount,
    arrayItemCount,
  };
}

/**
 * Executes a JavaScript query expression against JSON data safely
 * Supported syntax examples:
 * - `data.users[0]`
 * - `users.map(u => u.name)`
 * - `filter(x => x.age > 25)`
 */
export function queryJsonWithExpression(
  data: any,
  query: string
): { result: any; error: string | null } {
  const trimmed = query.trim();
  if (!trimmed) {
    return { result: data, error: null };
  }

  try {
    let expr = trimmed;
    // If expression starts with standard filter/map/find, wrap with data
    if (/^\.(filter|map|find|slice|reduce|forEach|some|every)\b/.test(expr)) {
      expr = `data${expr}`;
    } else if (/^(filter|map|find|slice|reduce|forEach|some|every)\b/.test(expr)) {
      expr = `data.${expr}`;
    } else if (expr.startsWith('.')) {
      expr = `data${expr}`;
    } else if (!expr.startsWith('data') && !expr.startsWith('return')) {
      expr = `data.${expr}`;
    }

    // Safely evaluate via function with isolated scope
    const queryFn = new Function('data', `"use strict"; return (${expr});`);
    const result = queryFn(data);
    return { result, error: null };
  } catch (err: any) {
    return { result: null, error: err?.message || 'Query execution error' };
  }
}

/**
 * Sample JSON presets for testing & demonstrations
 */
export const JSON_EDITOR_PRESETS = [
  {
    id: 'user-management-api',
    name: 'User Management API Response',
    description: 'Realistic REST API response with pagination, status, and user objects',
    json: {
      status: 'success',
      statusCode: 200,
      timestamp: '2026-03-31T14:22:00Z',
      pagination: {
        page: 1,
        perPage: 3,
        totalRecords: 125,
        totalPages: 42,
      },
      data: [
        {
          id: 'usr_9481',
          name: 'Sarah Chen',
          email: 'sarah.chen@techcorp.io',
          role: 'Lead Architect',
          isActive: true,
          profile: {
            department: 'Engineering',
            level: 'Staff',
            skills: ['TypeScript', 'PostgreSQL', 'Go', 'Kubernetes'],
            github: 'https://github.com/schen-tech',
          },
          preferences: {
            newsletter: false,
            twoFactorAuth: true,
            theme: 'dark',
          },
        },
        {
          id: 'usr_9482',
          name: 'Marcus Vance',
          email: 'marcus.v@financeflow.com',
          role: 'Security Engineer',
          isActive: true,
          profile: {
            department: 'SecOps',
            level: 'Senior',
            skills: ['Cryptography', 'Python', 'AWS', 'SOC2'],
            github: 'https://github.com/mvance-sec',
          },
          preferences: {
            newsletter: true,
            twoFactorAuth: true,
            theme: 'system',
          },
        },
        {
          id: 'usr_9483',
          name: 'Elena Rostova',
          email: 'elena.rostova@quantumai.org',
          role: 'Data Scientist',
          isActive: false,
          profile: {
            department: 'Machine Learning',
            level: 'Principal',
            skills: ['PyTorch', 'Rust', 'DuckDB', 'CUDA'],
            github: null,
          },
          preferences: {
            newsletter: false,
            twoFactorAuth: true,
            theme: 'light',
          },
        },
      ],
    },
  },
  {
    id: 'ecommerce-order',
    name: 'E-commerce Purchase Order',
    description: 'Order invoice with items, billing/shipping addresses, tax rates, and discounts',
    json: {
      orderId: 'ORD-2026-88914',
      customer: {
        id: 'cust_7721',
        fullName: 'Jonathan Miller',
        email: 'j.miller@example.org',
        phone: '+1 (555) 321-9988',
      },
      shippingAddress: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'US',
      },
      items: [
        {
          sku: 'KB-MECH-RGB-01',
          title: 'Ergonomic Mechanical Keyboard (Linear Red)',
          unitPrice: 149.99,
          quantity: 1,
          discountPercent: 10,
        },
        {
          sku: 'CBL-USB4-2M',
          title: 'Braided 40Gbps USB-C Cable (2m)',
          unitPrice: 24.5,
          quantity: 2,
          discountPercent: 0,
        },
        {
          sku: 'HUB-TB4-7PORT',
          title: 'Thunderbolt 4 Multiport Docking Station',
          unitPrice: 229.0,
          quantity: 1,
          discountPercent: 15,
        },
      ],
      pricingSummary: {
        subtotal: 427.99,
        discountTotal: 49.35,
        shippingFee: 0.0,
        taxAmount: 30.29,
        totalPaid: 408.93,
        currency: 'USD',
      },
      paymentStatus: 'COMPLETED',
      trackingNumber: '1Z9999999999999999',
    },
  },
  {
    id: 'app-configuration',
    name: 'Production Application Config',
    description: 'Nested service configuration with database pools, caching, and rate limiters',
    json: {
      env: 'production',
      version: '3.4.12',
      server: {
        port: 8080,
        host: '0.0.0.0',
        corsOrigins: ['https://app.devhub.io', 'https://admin.devhub.io'],
        compression: true,
      },
      database: {
        pool: {
          min: 5,
          max: 50,
          idleTimeoutMs: 30000,
        },
        ssl: {
          rejectUnauthorized: true,
          caCertificate: '/etc/ssl/certs/rds-combined-ca-bundle.pem',
        },
      },
      redisCache: {
        enabled: true,
        clusterMode: true,
        ttlSeconds: 3600,
        nodes: ['redis-node-1.internal:6379', 'redis-node-2.internal:6379'],
      },
      rateLimiting: {
        enabled: true,
        windowMs: 60000,
        maxRequestsPerIp: 120,
      },
    },
  },
];
