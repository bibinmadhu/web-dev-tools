/**
 * Database Delete Query Generator for PostgreSQL
 * 
 * Supports generating high-performance PostgreSQL DELETE queries from table schemas (DDL or column definitions),
 * with single and list conditions, multiple execution strategies (USING VALUES, WHERE IN, CTE, Individual, Soft Delete, Chunked Limit),
 * safety protections against accidental full table wipes, dry-run previews, Python test scripts, and JSON config import/export.
 */

export type ColumnType =
  | 'text'
  | 'integer'
  | 'bigint'
  | 'numeric'
  | 'boolean'
  | 'timestamp'
  | 'date'
  | 'jsonb'
  | 'uuid'
  | 'raw';

export type ConditionOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'LIKE'
  | 'ILIKE'
  | 'IN'
  | 'NOT IN'
  | 'IS NULL'
  | 'IS NOT NULL'
  | 'BETWEEN';

export type ConditionMode = 'single' | 'list';

export type DeleteStrategy =
  | 'where_in'     // DELETE FROM tbl WHERE id IN (...)
  | 'using_values'  // DELETE FROM tbl USING (VALUES (...), (...)) AS v(...) WHERE tbl.id = v.id
  | 'cte'           // WITH to_delete(id) AS (VALUES (...)) DELETE FROM tbl ...
  | 'individual'    // Individual DELETE FROM tbl WHERE ...; statements
  | 'soft_delete'   // UPDATE tbl SET is_deleted = TRUE, deleted_at = NOW() WHERE ...
  | 'chunked_limit'; // Batch chunked delete using ctid LIMIT for production safely

export type TransactionMode = 'none' | 'commit' | 'rollback';

export interface TableColumn {
  id: string;
  name: string;
  type: ColumnType;
  isPrimaryKey?: boolean;
  nullable?: boolean;
  defaultValue?: string;
  comment?: string;
}

export interface DeleteCondition {
  id: string;
  column: string;
  type: ColumnType;
  mode: ConditionMode; // 'single' or 'list'
  operator: ConditionOperator;
  singleValue: string;
  values: string[]; // For list mode
  negate?: boolean; // NOT condition
  caseInsensitive?: boolean; // For text ILIKE or UPPER()
  comment?: string;
}

export interface SoftDeleteSettings {
  enabled: boolean;
  deletedAtColumn: string;
  isDeletedColumn?: string;
  deletedByColumn?: string;
  deletedByValue?: string;
  customSetClause?: string;
}

export interface DeleteQueryOptions {
  tableName: string;
  schema?: string;
  tableAlias?: string;
  useTableAlias?: boolean;
  strategy: DeleteStrategy;
  transactionMode: TransactionMode;
  conditions: DeleteCondition[];
  conditionLogic: 'AND' | 'OR';
  allowFullTableDelete?: boolean; // Safety guard!
  returningClause?: string;
  includeTypeCasts?: boolean;
  includeRowComments?: boolean;
  includeCountCheck?: boolean; // Prepend SELECT COUNT(*)
  chunkSize?: number; // For batching large lists in WHERE IN or chunked delete
  chunkLimit?: number; // e.g. LIMIT 500 in chunked CTE
  softDeleteSettings?: SoftDeleteSettings;
}

export interface DeleteQueryResult {
  sql: string;
  dryRunSelectSql: string;
  countCheckSql?: string;
  pythonSnippet: string;
  totalConditions: number;
  singleConditionsCount: number;
  listConditionsCount: number;
  totalListValuesCount: number;
  warnings: string[];
  safetyRiskLevel: 'SAFE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  strategy: DeleteStrategy;
  transactionMode: TransactionMode;
}

export interface DbDeleteConfigExport {
  version: '1.0.0';
  tool: 'db-delete-query-generator';
  exportedAt: string;
  config: DeleteQueryOptions;
  schemaColumns?: TableColumn[];
  metadata?: {
    name?: string;
    description?: string;
    author?: string;
  };
}

/**
 * Escapes PostgreSQL identifiers (table, schema, column)
 */
export function sanitizeIdentifier(identifier: string): string {
  const trimmed = identifier.trim();
  if (!trimmed) return '""';
  if (trimmed.includes('.')) {
    return trimmed
      .split('.')
      .map((part) => sanitizeIdentifier(part))
      .join('.');
  }
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed) && !isReservedPostgresKeyword(trimmed)) {
    return trimmed;
  }
  return `"${trimmed.replace(/"/g, '""')}"`;
}

/**
 * Checks if a string is a PostgreSQL reserved keyword
 */
export function isReservedPostgresKeyword(word: string): boolean {
  const keywords = new Set([
    'all', 'analyse', 'analyze', 'and', 'any', 'array', 'as', 'asc', 'asymmetric', 'authorization',
    'between', 'bigint', 'binary', 'bit', 'boolean', 'both', 'case', 'cast', 'char', 'character',
    'check', 'coalesce', 'collate', 'collation', 'column', 'concurrently', 'constraint', 'create',
    'cross', 'current_catalog', 'current_date', 'current_role', 'current_schema', 'current_time',
    'current_timestamp', 'current_user', 'default', 'deferrable', 'desc', 'distinct', 'do', 'else',
    'end', 'except', 'false', 'fetch', 'for', 'foreign', 'freeze', 'from', 'full', 'grant', 'group',
    'having', 'ilike', 'in', 'initially', 'inner', 'intersect', 'into', 'is', 'isnull', 'join',
    'leading', 'left', 'like', 'limit', 'localtime', 'localtimestamp', 'natural', 'not', 'notnull',
    'null', 'offset', 'on', 'only', 'or', 'order', 'outer', 'overlaps', 'placing', 'primary',
    'references', 'returning', 'right', 'select', 'session_user', 'similar', 'some', 'symmetric',
    'table', 'tablesample', 'then', 'to', 'trailing', 'true', 'union', 'unique', 'user', 'using',
    'variadic', 'verbose', 'when', 'where', 'window', 'with', 'order', 'user', 'group'
  ]);
  return keywords.has(word.toLowerCase());
}

/**
 * Parses raw text input into list of values (handles newlines, commas, tabs, spaces, quotes)
 */
export function parseDelimitedList(rawInput: string, deduplicate = true): string[] {
  if (!rawInput || typeof rawInput !== 'string') return [];
  const lines = rawInput.split(/\r?\n/);
  const result: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Check if line contains commas or tabs
    if (trimmedLine.includes('\t') || (trimmedLine.includes(',') && !trimmedLine.startsWith('"'))) {
      const parts = trimmedLine.includes('\t') ? trimmedLine.split('\t') : trimmedLine.split(',');
      for (const p of parts) {
        let clean = p.trim();
        // Remove surrounding single or double quotes
        if ((clean.startsWith("'") && clean.endsWith("'")) || (clean.startsWith('"') && clean.endsWith('"'))) {
          clean = clean.slice(1, -1).trim();
        }
        if (clean) result.push(clean);
      }
    } else {
      let clean = trimmedLine;
      if ((clean.startsWith("'") && clean.endsWith("'")) || (clean.startsWith('"') && clean.endsWith('"'))) {
        clean = clean.slice(1, -1).trim();
      }
      if (clean) result.push(clean);
    }
  }

  if (deduplicate) {
    return Array.from(new Set(result));
  }
  return result;
}

/**
 * Detects if a date string is in non-ISO format (e.g. DD/MM/YYYY, DD-MM-YYYY)
 */
export function isNonIsoDateFormat(rawVal: string | undefined | null): boolean {
  if (!rawVal) return false;
  const trimmed = rawVal.trim();
  return /^\d{1,2}[./-]\d{1,2}[./-]\d{4}/.test(trimmed);
}

/**
 * Normalizes non-ISO date formats (DD/MM/YYYY) to ISO (YYYY-MM-DD)
 */
export function normalizeDateToIso(dateStr: string): string {
  const trimmed = dateStr.trim();
  const match = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(.*)$/);
  if (!match) return trimmed;

  const [, part1, part2, year, timePart] = match;
  const p1 = parseInt(part1, 10);
  const p2 = parseInt(part2, 10);

  let day: string;
  let month: string;

  if (p1 > 12) {
    // Definitely DD/MM/YYYY
    day = part1.padStart(2, '0');
    month = part2.padStart(2, '0');
  } else {
    // Standard European/Commonwealth format default
    day = part1.padStart(2, '0');
    month = part2.padStart(2, '0');
  }

  const isoDate = `${year}-${month}-${day}`;
  return timePart ? `${isoDate}${timePart.trim() ? ' ' + timePart.trim() : ''}` : isoDate;
}

/**
 * Formats a value according to PostgreSQL typing rules
 */
export function formatPostgresValue(
  val: string,
  type: ColumnType,
  includeTypeCast = false
): string {
  if (val === undefined || val === null || val === '') {
    return 'NULL';
  }

  const trimmed = val.trim();
  if (trimmed.toUpperCase() === 'NULL') {
    return 'NULL';
  }

  // Raw mode or SQL functions/expressions like NOW(), CURRENT_DATE
  if (type === 'raw' || /^(NOW\(\)|CURRENT_TIMESTAMP|CURRENT_DATE|DEFAULT)$/i.test(trimmed)) {
    return trimmed;
  }

  switch (type) {
    case 'integer':
    case 'bigint': {
      const num = parseInt(trimmed.replace(/,/g, ''), 10);
      if (isNaN(num)) return 'NULL';
      const cast = includeTypeCast ? (type === 'bigint' ? '::bigint' : '::integer') : '';
      return `${num}${cast}`;
    }
    case 'numeric': {
      const num = parseFloat(trimmed.replace(/,/g, ''));
      if (isNaN(num)) return 'NULL';
      const cast = includeTypeCast ? '::numeric' : '';
      return `${num}${cast}`;
    }
    case 'boolean': {
      const lower = trimmed.toLowerCase();
      if (['true', 't', '1', 'yes', 'y'].includes(lower)) {
        return includeTypeCast ? 'TRUE::boolean' : 'TRUE';
      }
      if (['false', 'f', '0', 'no', 'n'].includes(lower)) {
        return includeTypeCast ? 'FALSE::boolean' : 'FALSE';
      }
      return includeTypeCast ? `'${trimmed.replace(/'/g, "''")}'::boolean` : `'${trimmed.replace(/'/g, "''")}'`;
    }
    case 'date': {
      let dateVal = trimmed;
      if (isNonIsoDateFormat(dateVal)) {
        dateVal = normalizeDateToIso(dateVal);
      }
      const escaped = dateVal.replace(/'/g, "''");
      return includeTypeCast ? `'${escaped}'::date` : `'${escaped}'`;
    }
    case 'timestamp': {
      let tsVal = trimmed;
      if (isNonIsoDateFormat(tsVal)) {
        tsVal = normalizeDateToIso(tsVal);
      }
      const escaped = tsVal.replace(/'/g, "''");
      return includeTypeCast ? `'${escaped}'::timestamp` : `'${escaped}'`;
    }
    case 'uuid': {
      const escaped = trimmed.replace(/'/g, "''");
      return includeTypeCast ? `'${escaped}'::uuid` : `'${escaped}'`;
    }
    case 'jsonb': {
      const escaped = trimmed.replace(/'/g, "''");
      return includeTypeCast ? `'${escaped}'::jsonb` : `'${escaped}'`;
    }
    case 'text':
    default: {
      const escaped = trimmed.replace(/'/g, "''");
      const cast = includeTypeCast ? '::text' : '';
      return `'${escaped}'${cast}`;
    }
  }
}

/**
 * Parses CREATE TABLE DDL into schema columns and table metadata
 */
export function parseCreateTableDdl(ddl: string): {
  tableName: string;
  schema: string;
  schemaName: string;
  columns: TableColumn[];
  primaryKeys: string[];
} {
  const result = {
    tableName: 'records',
    schema: 'public',
    schemaName: 'public',
    columns: [] as TableColumn[],
    primaryKeys: [] as string[],
  };

  if (!ddl || typeof ddl !== 'string') return result;

  // 1. Extract table name: CREATE TABLE [IF NOT EXISTS] [schema.]table
  const tableMatch = ddl.match(/CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:([a-zA-Z0-9_"]+)\.)?([a-zA-Z0-9_"]+)/i);
  if (tableMatch) {
    if (tableMatch[1]) {
      const cleanSchema = tableMatch[1].replace(/"/g, '');
      result.schema = cleanSchema;
      result.schemaName = cleanSchema;
    }
    result.tableName = tableMatch[2].replace(/"/g, '');
  }

  // 2. Extract column definitions inside the outer parentheses
  const firstParen = ddl.indexOf('(');
  const lastParen = ddl.lastIndexOf(')');
  if (firstParen === -1 || lastParen === -1 || lastParen <= firstParen) {
    return result;
  }

  const body = ddl.slice(firstParen + 1, lastParen);
  
  // Split columns by comma, respecting parentheses (e.g. numeric(10,2))
  const rawParts: string[] = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;

    if (char === ',' && depth === 0) {
      if (current.trim()) rawParts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) rawParts.push(current.trim());

  // 3. Process each line
  for (const part of rawParts) {
    const cleanLine = part.replace(/\s+/g, ' ').trim();
    if (!cleanLine) continue;

    // Check for table-level PRIMARY KEY (col1, col2)
    const pkMatch = cleanLine.match(/^(?:CONSTRAINT\s+\S+\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i);
    if (pkMatch) {
      const pkCols = pkMatch[1].split(',').map((c) => c.trim().replace(/"/g, ''));
      result.primaryKeys.push(...pkCols);
      continue;
    }

    // Ignore other table constraints (FOREIGN KEY, CHECK, UNIQUE)
    if (/^(?:CONSTRAINT\s+\S+\s+)?(?:FOREIGN\s+KEY|CHECK|UNIQUE)\s*\(/i.test(cleanLine)) {
      continue;
    }

    // Parse column line: name type [constraints...]
    const tokens = cleanLine.split(' ');
    if (tokens.length < 2) continue;

    const colName = tokens[0].replace(/"/g, '');
    if (!colName || isReservedPostgresKeyword(colName) && tokens.length === 2 && ['constraint', 'primary', 'foreign'].includes(colName.toLowerCase())) {
      continue;
    }

    const typeStr = tokens[1].toLowerCase();
    const inferredType = mapSqlTypeToColumnType(typeStr);

    const isPk = /PRIMARY\s+KEY/i.test(cleanLine);
    if (isPk) {
      result.primaryKeys.push(colName);
    }

    const isNotNull = /NOT\s+NULL/i.test(cleanLine);

    // Extract DEFAULT
    let defaultValue: string | undefined = undefined;
    const defaultMatch = cleanLine.match(/DEFAULT\s+([^,;]+?)(?:\s+(?:NOT\s+NULL|NULL|PRIMARY|CHECK|REFERENCES|$))/i);
    if (defaultMatch) {
      defaultValue = defaultMatch[1].trim();
    }

    result.columns.push({
      id: `col-${colName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: colName,
      type: inferredType,
      isPrimaryKey: isPk,
      nullable: !isNotNull && !isPk,
      defaultValue,
    });
  }

  // Update primary key flag if found in table-level constraint
  if (result.primaryKeys.length > 0) {
    result.columns.forEach((c) => {
      if (result.primaryKeys.includes(c.name)) {
        c.isPrimaryKey = true;
      }
    });
  }

  return result;
}

/**
 * Maps SQL type tokens to ColumnType
 */
export function mapSqlTypeToColumnType(typeStr: string): ColumnType {
  const lower = typeStr.toLowerCase();
  if (lower.includes('int8') || lower.includes('bigint') || lower.includes('bigserial')) return 'bigint';
  if (lower.includes('int') || lower.includes('serial')) return 'integer';
  if (lower.includes('numeric') || lower.includes('decimal') || lower.includes('float') || lower.includes('double') || lower.includes('real')) return 'numeric';
  if (lower.includes('bool')) return 'boolean';
  if (lower.includes('timestamp') || lower.includes('timestamptz')) return 'timestamp';
  if (lower.includes('date')) return 'date';
  if (lower.includes('json')) return 'jsonb';
  if (lower.includes('uuid')) return 'uuid';
  return 'text';
}

/**
 * Builds the WHERE expression for a single condition
 */
export function buildConditionSql(
  condition: DeleteCondition,
  tablePrefix = '',
  includeTypeCasts = false
): string {
  const colIdent = `${tablePrefix}${sanitizeIdentifier(condition.column)}`;
  const op = condition.operator;
  const isNegated = Boolean(condition.negate);

  // 1. IS NULL / IS NOT NULL
  if (op === 'IS NULL') {
    return isNegated ? `${colIdent} IS NOT NULL` : `${colIdent} IS NULL`;
  }
  if (op === 'IS NOT NULL') {
    return isNegated ? `${colIdent} IS NULL` : `${colIdent} IS NOT NULL`;
  }

  // 2. Mode: List
  if (condition.mode === 'list') {
    const values = condition.values.filter((v) => v !== undefined && v !== null && v.trim() !== '');
    if (values.length === 0) {
      return '1 = 0 /* Empty list filter */';
    }

    const formattedValues = values.map((v) => formatPostgresValue(v, condition.type, includeTypeCasts));

    if (op === 'IN' || op === '=') {
      const expr = `${colIdent} IN (${formattedValues.join(', ')})`;
      return isNegated ? `NOT (${expr})` : expr;
    }
    if (op === 'NOT IN' || op === '!=') {
      const expr = `${colIdent} NOT IN (${formattedValues.join(', ')})`;
      return isNegated ? `${colIdent} IN (${formattedValues.join(', ')})` : expr;
    }

    // Default list fallback
    const expr = `${colIdent} IN (${formattedValues.join(', ')})`;
    return isNegated ? `NOT (${expr})` : expr;
  }

  // 3. Mode: Single
  const singleVal = condition.singleValue || '';
  const formattedVal = formatPostgresValue(singleVal, condition.type, includeTypeCasts);

  if (op === 'LIKE' || op === 'ILIKE') {
    let expr = `${colIdent} ${op} ${formattedVal}`;
    if (condition.caseInsensitive && op === 'LIKE') {
      expr = `UPPER(${colIdent}) LIKE UPPER(${formattedVal})`;
    }
    return isNegated ? `NOT (${expr})` : expr;
  }

  if (op === 'BETWEEN') {
    // Handle "val1 AND val2"
    if (singleVal.toLowerCase().includes('and')) {
      const [p1, p2] = singleVal.split(/and/i).map((s) => s.trim());
      const f1 = formatPostgresValue(p1, condition.type, includeTypeCasts);
      const f2 = formatPostgresValue(p2, condition.type, includeTypeCasts);
      const expr = `${colIdent} BETWEEN ${f1} AND ${f2}`;
      return isNegated ? `NOT (${expr})` : expr;
    }
    const expr = `${colIdent} >= ${formattedVal}`;
    return isNegated ? `NOT (${expr})` : expr;
  }

  // Comparison operators (=, !=, >, <, >=, <=)
  let expr = `${colIdent} ${op} ${formattedVal}`;
  if (condition.caseInsensitive && (condition.type === 'text' || condition.type === 'raw')) {
    expr = `UPPER(${colIdent}) ${op} UPPER(${formattedVal})`;
  }
  return isNegated ? `NOT (${expr})` : expr;
}

/**
 * Main query generator for PostgreSQL DELETE
 */
export function generatePostgresDeleteQuery(options: DeleteQueryOptions): DeleteQueryResult {
  const warnings: string[] = [];
  const fullTableName = options.schema && options.schema.trim()
    ? `${sanitizeIdentifier(options.schema)}.${sanitizeIdentifier(options.tableName)}`
    : sanitizeIdentifier(options.tableName);

  const tableAlias = options.useTableAlias && options.tableAlias && options.tableAlias.trim()
    ? sanitizeIdentifier(options.tableAlias.trim())
    : '';

  const tablePrefix = tableAlias ? `${tableAlias}.` : '';

  // Classify conditions
  const validConditions = options.conditions.filter((c) => c && c.column && c.column.trim());
  const singleConditions = validConditions.filter((c) => c.mode === 'single');
  const listConditions = validConditions.filter((c) => c.mode === 'list');
  const totalListValuesCount = listConditions.reduce((acc, c) => acc + (c.values ? c.values.length : 0), 0);

  // Safety checks
  let safetyRiskLevel: DeleteQueryResult['safetyRiskLevel'] = 'SAFE';
  if (validConditions.length === 0) {
    if (!options.allowFullTableDelete) {
      warnings.push('CRITICAL: No WHERE conditions defined! Full table deletion blocked by safety guard.');
      safetyRiskLevel = 'CRITICAL';
    } else {
      warnings.push('WARNING: Full table deletion enabled! This will delete ALL rows in the table.');
      safetyRiskLevel = 'CRITICAL';
    }
  } else if (validConditions.some((c) => c.mode === 'list' && (!c.values || c.values.length === 0))) {
    warnings.push('NOTICE: One or more list conditions have no values provided (evaluates to 1=0).');
    safetyRiskLevel = 'MODERATE';
  }

  // Pre-delete Dry Run SELECT query
  const whereClauses = validConditions.map((c) => buildConditionSql(c, tablePrefix, options.includeTypeCasts));
  const whereExpression = whereClauses.length > 0
    ? `WHERE\n  ${whereClauses.join(`\n  ${options.conditionLogic} `)}`
    : (options.allowFullTableDelete ? '-- WARNING: No WHERE clause (full table wipe)' : 'WHERE 1 = 0 /* Full table delete guard */');

  const countCheckSql = `SELECT COUNT(*) AS rows_targeted\nFROM ${fullTableName}${tableAlias ? ` AS ${tableAlias}` : ''}\n${whereExpression};`;

  const dryRunSelectSql = `-- [DRY-RUN AUDIT] Preview rows targeted for deletion\nSELECT * FROM ${fullTableName}${tableAlias ? ` AS ${tableAlias}` : ''}\n${whereExpression};`;

  // SQL Generation by Strategy
  const sqlLines: string[] = [];
  const timestamp = new Date().toISOString();

  // Header comment
  sqlLines.push(`-- =========================================================================`);
  sqlLines.push(`-- PostgreSQL Delete Query Generator`);
  sqlLines.push(`-- Target Table : ${fullTableName}`);
  sqlLines.push(`-- Strategy     : ${options.strategy.toUpperCase()}`);
  sqlLines.push(`-- Conditions   : ${singleConditions.length} single, ${listConditions.length} list (${totalListValuesCount} total values)`);
  sqlLines.push(`-- Generated At : ${timestamp}`);
  sqlLines.push(`-- =========================================================================\n`);

  // Optional Transaction wrapper
  if (options.transactionMode === 'commit') {
    sqlLines.push('BEGIN;\n');
  } else if (options.transactionMode === 'rollback') {
    sqlLines.push('-- [DRY-RUN SIMULATION] Wrapped in transaction with ROLLBACK to test without changes');
    sqlLines.push('BEGIN;\n');
  }

  // Optional Pre-delete Count Check
  if (options.includeCountCheck) {
    sqlLines.push('-- Step 1: Pre-delete row count audit');
    sqlLines.push(countCheckSql + '\n');
    sqlLines.push('-- Step 2: Delete Execution');
  }

  // 1. STRATEGY: Soft Delete (UPDATE instead of DELETE)
  if (options.strategy === 'soft_delete') {
    const soft = options.softDeleteSettings || {
      enabled: true,
      deletedAtColumn: 'deleted_at',
      isDeletedColumn: 'is_deleted',
    };

    const setClauses: string[] = [];
    if (soft.deletedAtColumn) {
      setClauses.push(`${sanitizeIdentifier(soft.deletedAtColumn)} = NOW()`);
    }
    if (soft.isDeletedColumn) {
      setClauses.push(`${sanitizeIdentifier(soft.isDeletedColumn)} = TRUE`);
    }
    if (soft.deletedByColumn && soft.deletedByValue) {
      setClauses.push(`${sanitizeIdentifier(soft.deletedByColumn)} = '${soft.deletedByValue.replace(/'/g, "''")}'`);
    }
    if (soft.customSetClause) {
      setClauses.push(soft.customSetClause);
    }
    if (setClauses.length === 0) {
      setClauses.push('is_deleted = TRUE, deleted_at = NOW()');
    }

    const returningStr = options.returningClause && options.returningClause.trim()
      ? `\nRETURNING ${options.returningClause.trim()}`
      : '';

    sqlLines.push(`UPDATE ${fullTableName}`);
    sqlLines.push(`SET\n  ${setClauses.join(',\n  ')}`);
    sqlLines.push(`${whereExpression}${returningStr};`);
  }

  // 2. STRATEGY: USING VALUES (PostgreSQL high-performance join)
  else if (options.strategy === 'using_values' && listConditions.length > 0) {
    const primaryList = listConditions[0];
    const otherConditions = validConditions.filter((c) => c.id !== primaryList.id);
    const values = primaryList.values.filter((v) => v && v.trim());

    if (values.length === 0) {
      sqlLines.push(`-- No list values provided for USING VALUES strategy`);
      sqlLines.push(`DELETE FROM ${fullTableName} WHERE 1 = 0;`);
    } else {
      const vCol = 'target_val';
      const formattedRows = values.map((v) => `  (${formatPostgresValue(v, primaryList.type, options.includeTypeCasts)})`);
      const valTypeCast = options.includeTypeCasts ? `::${primaryList.type}` : '';

      sqlLines.push(`DELETE FROM ${fullTableName}`);
      sqlLines.push(`USING (`);
      sqlLines.push(`  VALUES`);
      sqlLines.push(formattedRows.join(',\n'));
      sqlLines.push(`) AS v(${vCol})`);
      sqlLines.push(`WHERE`);
      sqlLines.push(`  ${fullTableName}.${sanitizeIdentifier(primaryList.column)} = v.${vCol}`);

      if (otherConditions.length > 0) {
        const otherClauses = otherConditions.map((c) => buildConditionSql(c, `${fullTableName}.`, options.includeTypeCasts));
        sqlLines.push(`  ${options.conditionLogic} ${otherClauses.join(`\n  ${options.conditionLogic} `)}`);
      }

      if (options.returningClause && options.returningClause.trim()) {
        sqlLines.push(`RETURNING ${options.returningClause.trim()};`);
      } else {
        sqlLines[sqlLines.length - 1] += ';';
      }
    }
  }

  // 3. STRATEGY: CTE (WITH targets(id) AS (VALUES (...)) DELETE ...)
  else if (options.strategy === 'cte' && listConditions.length > 0) {
    const primaryList = listConditions[0];
    const otherConditions = validConditions.filter((c) => c.id !== primaryList.id);
    const values = primaryList.values.filter((v) => v && v.trim());

    if (values.length === 0) {
      sqlLines.push(`-- No list values provided for CTE strategy`);
      sqlLines.push(`DELETE FROM ${fullTableName} WHERE 1 = 0;`);
    } else {
      const vCol = sanitizeIdentifier(primaryList.column);
      const formattedRows = values.map((v) => `    (${formatPostgresValue(v, primaryList.type, options.includeTypeCasts)})`);

      sqlLines.push(`WITH targets(${vCol}) AS (`);
      sqlLines.push(`  VALUES`);
      sqlLines.push(formattedRows.join(',\n'));
      sqlLines.push(`)`);
      sqlLines.push(`DELETE FROM ${fullTableName}`);
      sqlLines.push(`WHERE ${sanitizeIdentifier(primaryList.column)} IN (SELECT ${vCol} FROM targets)`);

      if (otherConditions.length > 0) {
        const otherClauses = otherConditions.map((c) => buildConditionSql(c, tablePrefix, options.includeTypeCasts));
        sqlLines.push(`  ${options.conditionLogic} ${otherClauses.join(`\n  ${options.conditionLogic} `)}`);
      }

      if (options.returningClause && options.returningClause.trim()) {
        sqlLines.push(`RETURNING ${options.returningClause.trim()};`);
      } else {
        sqlLines[sqlLines.length - 1] += ';';
      }
    }
  }

  // 4. STRATEGY: Individual Statements
  else if (options.strategy === 'individual' && listConditions.length > 0) {
    const primaryList = listConditions[0];
    const otherConditions = validConditions.filter((c) => c.id !== primaryList.id);
    const values = primaryList.values.filter((v) => v && v.trim());

    if (values.length === 0) {
      sqlLines.push(`-- No values provided for individual statements`);
      sqlLines.push(`DELETE FROM ${fullTableName} WHERE 1 = 0;`);
    } else {
      values.forEach((val, idx) => {
        if (options.includeRowComments) {
          sqlLines.push(`-- Statement #${idx + 1} (${primaryList.column} = ${val})`);
        }
        const rowCondition: DeleteCondition = {
          ...primaryList,
          mode: 'single',
          singleValue: val,
        };
        const allRowConds = [rowCondition, ...otherConditions];
        const rowWhere = allRowConds.map((c) => buildConditionSql(c, '', options.includeTypeCasts)).join(` ${options.conditionLogic} `);
        const returningStr = options.returningClause && options.returningClause.trim()
          ? ` RETURNING ${options.returningClause.trim()}`
          : '';
        sqlLines.push(`DELETE FROM ${fullTableName} WHERE ${rowWhere}${returningStr};`);
      });
    }
  }

  // 5. STRATEGY: Chunked Limit (Production high-volume safe batching)
  else if (options.strategy === 'chunked_limit') {
    const limit = options.chunkLimit || 1000;
    sqlLines.push(`-- High-Volume Batch Delete (Run iteratively until rows affected = 0 to avoid table lock)`);
    sqlLines.push(`WITH to_delete AS (`);
    sqlLines.push(`  SELECT ctid`);
    sqlLines.push(`  FROM ${fullTableName}`);
    sqlLines.push(`  ${whereExpression}`);
    sqlLines.push(`  LIMIT ${limit}`);
    sqlLines.push(`)`);
    sqlLines.push(`DELETE FROM ${fullTableName}`);
    sqlLines.push(`WHERE ctid IN (SELECT ctid FROM to_delete)`);
    if (options.returningClause && options.returningClause.trim()) {
      sqlLines.push(`RETURNING ${options.returningClause.trim()};`);
    } else {
      sqlLines[sqlLines.length - 1] += ';';
    }
  }

  // 6. DEFAULT STRATEGY: WHERE IN
  else {
    // If list conditions exceed chunkSize, chunk them
    const chunkSize = options.chunkSize || 500;
    const hasLargeList = listConditions.some((c) => c.values && c.values.length > chunkSize);

    if (hasLargeList && listConditions.length === 1 && validConditions.length === 1) {
      const listCol = listConditions[0];
      const values = listCol.values.filter((v) => v && v.trim());
      const chunks: string[][] = [];
      for (let i = 0; i < values.length; i += chunkSize) {
        chunks.push(values.slice(i, i + chunkSize));
      }

      sqlLines.push(`-- Batched into ${chunks.length} chunks of up to ${chunkSize} items`);
      chunks.forEach((chunk, chunkIdx) => {
        sqlLines.push(`-- Chunk #${chunkIdx + 1} (${chunk.length} items)`);
        const formatted = chunk.map((v) => formatPostgresValue(v, listCol.type, options.includeTypeCasts));
        const returningStr = options.returningClause && options.returningClause.trim()
          ? `\nRETURNING ${options.returningClause.trim()}`
          : '';
        sqlLines.push(`DELETE FROM ${fullTableName}`);
        sqlLines.push(`WHERE ${sanitizeIdentifier(listCol.column)} IN (${formatted.join(', ')})${returningStr};\n`);
      });
    } else {
      const returningStr = options.returningClause && options.returningClause.trim()
        ? `\nRETURNING ${options.returningClause.trim()}`
        : '';
      sqlLines.push(`DELETE FROM ${fullTableName}${tableAlias ? ` AS ${tableAlias}` : ''}`);
      sqlLines.push(`${whereExpression}${returningStr};`);
    }
  }

  // Closing transaction
  if (options.transactionMode === 'commit') {
    sqlLines.push('\nCOMMIT;');
  } else if (options.transactionMode === 'rollback') {
    sqlLines.push('\nROLLBACK;');
  }

  const generatedSql = sqlLines.join('\n');
  const pythonSnippet = generateDeletePythonScript(options, generatedSql);

  return {
    sql: generatedSql,
    dryRunSelectSql,
    countCheckSql,
    pythonSnippet,
    totalConditions: validConditions.length,
    singleConditionsCount: singleConditions.length,
    listConditionsCount: listConditions.length,
    totalListValuesCount,
    warnings,
    safetyRiskLevel,
    strategy: options.strategy,
    transactionMode: options.transactionMode,
  };
}

/**
 * Generates production-ready pg8000 Python script for running the delete operation
 */
export function generateDeletePythonScript(
  options: DeleteQueryOptions,
  rawSql: string
): string {
  const isRollback = options.transactionMode === 'rollback';
  const table = options.tableName;

  return `#!/usr/bin/env python3
"""
Automated PostgreSQL Delete Runner for table '${table}'
Generated by DevHub Testing Tools - Database Delete Query Generator

Requirements:
    pip install pg8000
"""

import os
import sys
import pg8000.native

# Database Connection Settings (configure via ENV or defaults)
DB_HOST = os.getenv("PGHOST", "localhost")
DB_PORT = int(os.getenv("PGPORT", "5432"))
DB_NAME = os.getenv("PGDATABASE", "postgres")
DB_USER = os.getenv("PGUSER", "postgres")
DB_PASSWORD = os.getenv("PGPASSWORD", "postgres")

def main():
    print(f"[*] Connecting to PostgreSQL at {DB_HOST}:{DB_PORT}/{DB_NAME} as '{DB_USER}'...")
    try:
        conn = pg8000.native.Connection(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME
        )
    except Exception as e:
        print(f"[!] Connection failed: {e}", file=sys.stderr)
        sys.exit(1)

    print("[+] Connected successfully.")

    delete_sql = """\\
${rawSql.replace(/"""/g, '\\"\\"\\"')}
"""

    try:
        print("[*] Executing DELETE operation (Strategy: ${options.strategy})...")
        conn.run("BEGIN")
        
        # Execute query
        results = conn.run(delete_sql)
        row_count = conn.row_count
        print(f"[+] Query executed. Rows affected: {row_count}")

${isRollback ? `        print("[!] DRY-RUN MODE: Rolling back transaction...")
        conn.run("ROLLBACK")
        print("[+] Rollback completed. No database state changed.")` : `        conn.run("COMMIT")
        print("[+] Transaction committed successfully.")`}

    except Exception as err:
        print(f"[!] Error executing delete statement: {err}", file=sys.stderr)
        try:
            conn.run("ROLLBACK")
            print("[*] Rolled back transaction safely.")
        except Exception:
            pass
        sys.exit(1)
    finally:
        conn.close()
        print("[*] Database connection closed.")

if __name__ == "__main__":
    main()
`;
}

/**
 * Creates configuration export object
 */
export function createDbDeleteConfigExport(
  options: DeleteQueryOptions,
  schemaColumns: TableColumn[] = [],
  metadata?: DbDeleteConfigExport['metadata']
): DbDeleteConfigExport {
  return {
    version: '1.0.0',
    tool: 'db-delete-query-generator',
    exportedAt: new Date().toISOString(),
    config: options,
    schemaColumns,
    metadata: {
      name: metadata?.name || `Delete config for ${options.tableName}`,
      description: metadata?.description || `Exported delete criteria with ${options.conditions.length} conditions`,
      author: metadata?.author || 'DevHub User',
    },
  };
}

/**
 * Validates and parses JSON configuration import
 */
export function validateAndParseDbDeleteConfig(rawInput: unknown): {
  isValid: boolean;
  config?: DeleteQueryOptions;
  schemaColumns?: TableColumn[];
  error?: string;
} {
  try {
    let parsed: any = rawInput;
    if (typeof rawInput === 'string') {
      parsed = JSON.parse(rawInput);
    }

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'Input must be a valid JSON object' };
    }

    // Handle full export object vs naked options
    const targetConfig = parsed.tool === 'db-delete-query-generator' && parsed.config ? parsed.config : parsed;

    if (!targetConfig.tableName || typeof targetConfig.tableName !== 'string') {
      return { isValid: false, error: 'Missing or invalid tableName in configuration' };
    }

    // Sanitize conditions
    const conditions: DeleteCondition[] = [];
    if (Array.isArray(targetConfig.conditions)) {
      for (const c of targetConfig.conditions) {
        if (!c || typeof c !== 'object' || !c.column) continue;
        conditions.push({
          id: c.id || `cond-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          column: String(c.column).trim(),
          type: (c.type as ColumnType) || 'text',
          mode: c.mode === 'list' ? 'list' : 'single',
          operator: (c.operator as ConditionOperator) || '=',
          singleValue: c.singleValue !== undefined ? String(c.singleValue) : '',
          values: Array.isArray(c.values) ? c.values.map(String) : [],
          negate: Boolean(c.negate),
          caseInsensitive: Boolean(c.caseInsensitive),
          comment: c.comment ? String(c.comment) : undefined,
        });
      }
    }

    // Sanitize schemaColumns if provided
    const schemaColumns: TableColumn[] = [];
    if (Array.isArray(parsed.schemaColumns)) {
      for (const col of parsed.schemaColumns) {
        if (!col || typeof col !== 'object' || !col.name) continue;
        schemaColumns.push({
          id: col.id || `col-${col.name}`,
          name: String(col.name).trim(),
          type: (col.type as ColumnType) || 'text',
          isPrimaryKey: Boolean(col.isPrimaryKey),
          nullable: col.nullable !== false,
          defaultValue: col.defaultValue ? String(col.defaultValue) : undefined,
          comment: col.comment ? String(col.comment) : undefined,
        });
      }
    }

    const sanitizedOptions: DeleteQueryOptions = {
      tableName: targetConfig.tableName.trim(),
      schema: targetConfig.schema ? String(targetConfig.schema).trim() : 'public',
      tableAlias: targetConfig.tableAlias ? String(targetConfig.tableAlias).trim() : '',
      useTableAlias: Boolean(targetConfig.useTableAlias),
      strategy: ['where_in', 'using_values', 'cte', 'individual', 'soft_delete', 'chunked_limit'].includes(targetConfig.strategy)
        ? targetConfig.strategy
        : 'where_in',
      transactionMode: ['none', 'commit', 'rollback'].includes(targetConfig.transactionMode)
        ? targetConfig.transactionMode
        : 'none',
      conditions,
      conditionLogic: targetConfig.conditionLogic === 'OR' ? 'OR' : 'AND',
      allowFullTableDelete: Boolean(targetConfig.allowFullTableDelete),
      returningClause: targetConfig.returningClause ? String(targetConfig.returningClause) : undefined,
      includeTypeCasts: Boolean(targetConfig.includeTypeCasts),
      includeRowComments: Boolean(targetConfig.includeRowComments),
      includeCountCheck: Boolean(targetConfig.includeCountCheck),
      chunkSize: typeof targetConfig.chunkSize === 'number' ? targetConfig.chunkSize : 500,
      chunkLimit: typeof targetConfig.chunkLimit === 'number' ? targetConfig.chunkLimit : 1000,
      softDeleteSettings: targetConfig.softDeleteSettings ? {
        enabled: Boolean(targetConfig.softDeleteSettings.enabled),
        deletedAtColumn: String(targetConfig.softDeleteSettings.deletedAtColumn || 'deleted_at'),
        isDeletedColumn: targetConfig.softDeleteSettings.isDeletedColumn ? String(targetConfig.softDeleteSettings.isDeletedColumn) : undefined,
        deletedByColumn: targetConfig.softDeleteSettings.deletedByColumn ? String(targetConfig.softDeleteSettings.deletedByColumn) : undefined,
        deletedByValue: targetConfig.softDeleteSettings.deletedByValue ? String(targetConfig.softDeleteSettings.deletedByValue) : undefined,
        customSetClause: targetConfig.softDeleteSettings.customSetClause ? String(targetConfig.softDeleteSettings.customSetClause) : undefined,
      } : undefined,
    };

    return {
      isValid: true,
      config: sanitizedOptions,
      schemaColumns: schemaColumns.length > 0 ? schemaColumns : undefined,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Failed to parse JSON configuration: ${err.message || String(err)}`,
    };
  }
}

/**
 * Built-in real-world Presets for quick loading
 */
export interface DbDeletePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  sampleDdl: string;
  options: DeleteQueryOptions;
}

export const DB_DELETE_PRESETS: DbDeletePreset[] = [
  {
    id: 'preset-expired-sessions',
    name: 'Expired User Sessions & Auth Tokens',
    description: 'Clean up expired or revoked authentication sessions with age cutoff and batch token list',
    category: 'Security & Auth',
    sampleDdl: `CREATE TABLE public.user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,
    options: {
      tableName: 'user_sessions',
      schema: 'public',
      tableAlias: 's',
      useTableAlias: true,
      strategy: 'where_in',
      transactionMode: 'rollback',
      conditionLogic: 'AND',
      allowFullTableDelete: false,
      returningClause: 'session_id, user_id, expires_at',
      includeTypeCasts: false,
      includeRowComments: true,
      includeCountCheck: true,
      chunkSize: 200,
      conditions: [
        {
          id: 'c-tenant',
          column: 'tenant_id',
          type: 'text',
          mode: 'single',
          operator: '=',
          singleValue: 'org-acme-corp',
          values: [],
        },
        {
          id: 'c-status',
          column: 'status',
          type: 'text',
          mode: 'single',
          operator: '=',
          singleValue: 'REVOKED',
          values: [],
        },
        {
          id: 'c-token-list',
          column: 'session_id',
          type: 'uuid',
          mode: 'list',
          operator: 'IN',
          singleValue: '',
          values: [
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            'b1ffcd88-8d1c-4fe9-aa5e-5cc8ac291b22',
            'c2eedd77-7e2d-4ef0-994f-4dd7bd182c33',
            'd3eecc66-6f3e-4fe1-883e-3ee6ce073d44',
          ],
        },
      ],
    },
  },
  {
    id: 'preset-cancelled-orders',
    name: 'Cancelled Staging Orders (USING VALUES)',
    description: 'High-performance bulk deletion of cancelled staging orders using PostgreSQL USING VALUES join',
    category: 'E-Commerce',
    sampleDdl: `CREATE TABLE public.orders (
    order_id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);`,
    options: {
      tableName: 'orders',
      schema: 'public',
      tableAlias: '',
      useTableAlias: false,
      strategy: 'using_values',
      transactionMode: 'commit',
      conditionLogic: 'AND',
      allowFullTableDelete: false,
      returningClause: 'order_id, status, total_amount',
      includeTypeCasts: true,
      includeRowComments: false,
      includeCountCheck: false,
      conditions: [
        {
          id: 'c-order-ids',
          column: 'order_id',
          type: 'text',
          mode: 'list',
          operator: 'IN',
          singleValue: '',
          values: [
            'ORD-2026-901',
            'ORD-2026-902',
            'ORD-2026-903',
            'ORD-2026-904',
            'ORD-2026-905',
          ],
        },
        {
          id: 'c-status',
          column: 'status',
          type: 'text',
          mode: 'single',
          operator: '=',
          singleValue: 'CANCELLED',
          values: [],
        },
      ],
    },
  },
  {
    id: 'preset-soft-delete-users',
    name: 'Soft-Delete User Accounts Archive',
    description: 'Safe soft-delete setting is_deleted=TRUE and deleted_at=NOW() for deactivated accounts',
    category: 'User Management',
    sampleDdl: `CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);`,
    options: {
      tableName: 'users',
      schema: 'public',
      tableAlias: '',
      useTableAlias: false,
      strategy: 'soft_delete',
      transactionMode: 'commit',
      conditionLogic: 'AND',
      allowFullTableDelete: false,
      returningClause: 'id, username, is_deleted, deleted_at',
      includeTypeCasts: false,
      includeRowComments: false,
      includeCountCheck: true,
      softDeleteSettings: {
        enabled: true,
        deletedAtColumn: 'deleted_at',
        isDeletedColumn: 'is_deleted',
        deletedByColumn: 'deleted_by',
        deletedByValue: 'admin-purge-script',
      },
      conditions: [
        {
          id: 'c-role',
          column: 'role',
          type: 'text',
          mode: 'single',
          operator: '=',
          singleValue: 'guest',
          values: [],
        },
        {
          id: 'c-is-deleted',
          column: 'is_deleted',
          type: 'boolean',
          mode: 'single',
          operator: '=',
          singleValue: 'false',
          values: [],
        },
        {
          id: 'c-usernames',
          column: 'username',
          type: 'text',
          mode: 'list',
          operator: 'IN',
          singleValue: '',
          values: ['temp_user_1', 'temp_user_2', 'guest_demo_test'],
        },
      ],
    },
  },
  {
    id: 'preset-chunked-audit-logs',
    name: 'High-Volume Audit Logs Purge (Chunked CTE)',
    description: 'Safely purge millions of obsolete audit logs in batches of 1,000 without locking active writes',
    category: 'Database Maintenance',
    sampleDdl: `CREATE TABLE public.audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    action VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64),
    ip_address INET,
    severity VARCHAR(16) DEFAULT 'INFO',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);`,
    options: {
      tableName: 'audit_logs',
      schema: 'public',
      tableAlias: '',
      useTableAlias: false,
      strategy: 'chunked_limit',
      transactionMode: 'none',
      conditionLogic: 'AND',
      allowFullTableDelete: false,
      returningClause: '',
      includeTypeCasts: false,
      includeRowComments: true,
      chunkLimit: 1000,
      conditions: [
        {
          id: 'c-severity',
          column: 'severity',
          type: 'text',
          mode: 'single',
          operator: '=',
          singleValue: 'DEBUG',
          values: [],
        },
        {
          id: 'c-created-at',
          column: 'created_at',
          type: 'raw',
          mode: 'single',
          operator: '<',
          singleValue: "NOW() - INTERVAL '90 days'",
          values: [],
        },
      ],
    },
  },
];
