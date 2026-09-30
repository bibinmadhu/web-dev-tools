/**
 * Database Insert Query Generator for PostgreSQL
 * 
 * Generates production-grade PostgreSQL INSERT statements, bulk multi-row VALUES batches,
 * UPSERT (ON CONFLICT DO NOTHING / DO UPDATE) clauses, RETURNING clauses, transactions,
 * and parameterized query formats.
 * 
 * Supports parsing DDL schemas (CREATE TABLE), JSON schemas, preferred values pools,
 * and realistic mock data generators.
 */

export type PostgresInsertType =
  | 'integer'
  | 'bigint'
  | 'smallint'
  | 'serial'
  | 'bigserial'
  | 'numeric'
  | 'decimal'
  | 'real'
  | 'double precision'
  | 'varchar'
  | 'character'
  | 'character varying'
  | 'text'
  | 'boolean'
  | 'date'
  | 'timestamp'
  | 'timestamptz'
  | 'time'
  | 'interval'
  | 'json'
  | 'jsonb'
  | 'uuid'
  | 'bytea'
  | 'inet'
  | 'cidr'
  | 'raw';

export type ValueGenerationMode =
  | 'fixed'
  | 'pool'
  | 'generator'
  | 'default'
  | 'null';

export type GeneratorType =
  | 'sequential_int'
  | 'random_int'
  | 'random_decimal'
  | 'uuid'
  | 'current_timestamp'
  | 'random_date'
  | 'random_boolean'
  | 'name'
  | 'email'
  | 'username'
  | 'company'
  | 'phone'
  | 'city'
  | 'country_code'
  | 'json_object'
  | 'lorem';

export interface GeneratorOptions {
  min?: number;
  max?: number;
  start?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  isSqlFunction?: boolean;
}

export interface InsertColumnConfig {
  id: string;
  name: string;
  type: PostgresInsertType;
  maxLength?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  hasDefault: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  excludeFromInsert: boolean;
  valueMode: ValueGenerationMode;
  fixedValue: string;
  valuePool: string[];
  generatorType: GeneratorType;
  generatorOptions?: GeneratorOptions;
}

export type ConflictStrategy = 'none' | 'do_nothing' | 'do_update';

export type InsertStrategy =
  | 'bulk_single_statement'
  | 'individual_statements'
  | 'cte_values'
  | 'parameterized';

export interface InsertQueryOptions {
  tableName: string;
  schema: string;
  columns: InsertColumnConfig[];
  rowCount: number;
  insertStrategy: InsertStrategy;
  batchSize: number;
  conflictStrategy: ConflictStrategy;
  conflictTargetColumns: string[];
  conflictUpdateColumns: string[];
  returningClause: string;
  wrapInTransaction: boolean;
  includeTypeCasts: boolean;
  includeComments: boolean;
}

export interface GeneratedInsertResult {
  sql: string;
  rowCount: number;
  columnsIncluded: string[];
  columnsExcluded: string[];
  parameterValues?: any[][];
  parametersJson?: string;
  previewRows?: Record<string, any>[];
  previewCsv?: string;
}

export const COMMON_POSTGRES_TYPES: { type: PostgresInsertType; label: string; defaultCast: string }[] = [
  { type: 'integer', label: 'INTEGER / INT', defaultCast: 'integer' },
  { type: 'bigint', label: 'BIGINT', defaultCast: 'bigint' },
  { type: 'smallint', label: 'SMALLINT', defaultCast: 'smallint' },
  { type: 'varchar', label: 'VARCHAR(255)', defaultCast: 'varchar' },
  { type: 'character varying', label: 'CHARACTER VARYING', defaultCast: 'character varying' },
  { type: 'character', label: 'CHARACTER(n) / CHAR', defaultCast: 'character' },
  { type: 'text', label: 'TEXT', defaultCast: 'text' },
  { type: 'numeric', label: 'NUMERIC / DECIMAL', defaultCast: 'numeric' },
  { type: 'boolean', label: 'BOOLEAN', defaultCast: 'boolean' },
  { type: 'timestamp', label: 'TIMESTAMP', defaultCast: 'timestamp' },
  { type: 'timestamptz', label: 'TIMESTAMPTZ', defaultCast: 'timestamptz' },
  { type: 'date', label: 'DATE', defaultCast: 'date' },
  { type: 'uuid', label: 'UUID', defaultCast: 'uuid' },
  { type: 'jsonb', label: 'JSONB', defaultCast: 'jsonb' },
  { type: 'json', label: 'JSON', defaultCast: 'json' },
  { type: 'real', label: 'REAL / FLOAT4', defaultCast: 'real' },
  { type: 'double precision', label: 'DOUBLE PRECISION', defaultCast: 'double precision' },
  { type: 'bytea', label: 'BYTEA', defaultCast: 'bytea' },
  { type: 'inet', label: 'INET', defaultCast: 'inet' },
  { type: 'raw', label: 'RAW / SQL Expression', defaultCast: '' },
];

export const DEFAULT_INSERT_OPTIONS: InsertQueryOptions = {
  tableName: 'business_entities',
  schema: 'public',
  columns: [
    {
      id: 'col_1',
      name: 'id',
      type: 'serial',
      nullable: false,
      hasDefault: true,
      isPrimaryKey: true,
      isUnique: true,
      excludeFromInsert: true,
      valueMode: 'generator',
      fixedValue: '',
      valuePool: [],
      generatorType: 'sequential_int',
      generatorOptions: { start: 1, step: 1 },
    },
    {
      id: 'col_2',
      name: 'business_name',
      type: 'varchar',
      maxLength: 255,
      nullable: false,
      hasDefault: false,
      isPrimaryKey: false,
      isUnique: false,
      excludeFromInsert: false,
      valueMode: 'generator',
      fixedValue: '',
      valuePool: ['Acme Corp', 'Apex Logistics', 'Starlight Tech', 'Beacon Media', 'Zenith Retail'],
      generatorType: 'company',
    },
    {
      id: 'col_3',
      name: 'current_category',
      type: 'varchar',
      maxLength: 50,
      nullable: false,
      hasDefault: false,
      isPrimaryKey: false,
      isUnique: false,
      excludeFromInsert: false,
      valueMode: 'pool',
      fixedValue: 'SME',
      valuePool: ['Micro SME', 'SME', 'Small Midcap', 'Large Enterprise'],
      generatorType: 'name',
    },
    {
      id: 'col_4',
      name: 'no_of_employees',
      type: 'integer',
      nullable: true,
      hasDefault: false,
      isPrimaryKey: false,
      isUnique: false,
      excludeFromInsert: false,
      valueMode: 'generator',
      fixedValue: '45',
      valuePool: [10, 45, 120, 350, 750].map(String),
      generatorType: 'random_int',
      generatorOptions: { min: 5, max: 500 },
    },
    {
      id: 'col_5',
      name: 'annual_turnover',
      type: 'numeric',
      precision: 12,
      scale: 2,
      nullable: true,
      hasDefault: false,
      isPrimaryKey: false,
      isUnique: false,
      excludeFromInsert: false,
      valueMode: 'generator',
      fixedValue: '2500000',
      valuePool: ['500000', '1500000', '4200000', '12000000'],
      generatorType: 'random_decimal',
      generatorOptions: { min: 100000, max: 10000000, decimals: 2 },
    },
    {
      id: 'col_6',
      name: 'is_active',
      type: 'boolean',
      nullable: false,
      hasDefault: true,
      isPrimaryKey: false,
      isUnique: false,
      excludeFromInsert: false,
      valueMode: 'fixed',
      fixedValue: 'true',
      valuePool: ['true', 'false'],
      generatorType: 'random_boolean',
    },
    {
      id: 'col_7',
      name: 'created_at',
      type: 'timestamptz',
      nullable: false,
      hasDefault: true,
      isPrimaryKey: false,
      isUnique: false,
      excludeFromInsert: false,
      valueMode: 'generator',
      fixedValue: 'CURRENT_TIMESTAMP',
      valuePool: [],
      generatorType: 'current_timestamp',
      generatorOptions: { isSqlFunction: true },
    },
  ],
  rowCount: 5,
  insertStrategy: 'bulk_single_statement',
  batchSize: 100,
  conflictStrategy: 'none',
  conflictTargetColumns: ['id'],
  conflictUpdateColumns: ['current_category', 'annual_turnover', 'no_of_employees'],
  returningClause: '*',
  wrapInTransaction: false,
  includeTypeCasts: false,
  includeComments: true,
};

// Seeded mock data dictionaries for realistic mock generation
const SAMPLE_FIRST_NAMES = ['Alexander', 'Emma', 'Liam', 'Olivia', 'Noah', 'Sophia', 'Elijah', 'Isabella', 'James', 'Mia', 'Lucas', 'Charlotte', 'Benjamin', 'Amelia', 'Henry', 'Harper'];
const SAMPLE_LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
const SAMPLE_COMPANIES = ['Acme Industries', 'Vanguard Dynamics', 'Quantum Solutions', 'Apex Global', 'Horizon Cloud', 'Solstice Labs', 'Nexus Innovations', 'Summit Financial', 'Echo Logistics', 'Crestview Capital'];
const SAMPLE_CITIES = ['New York', 'London', 'Berlin', 'Tokyo', 'San Francisco', 'Toronto', 'Singapore', 'Sydney', 'Paris', 'Zurich'];
const SAMPLE_COUNTRIES = ['US', 'GB', 'DE', 'FR', 'JP', 'CA', 'AU', 'SG', 'CH', 'NL'];

/**
 * Clamps or fits a string value to a maximum length constraint (e.g. character varying(25) -> max 25 chars)
 */
export function clampStringToMaxLength(str: string, maxLength?: number): string {
  if (maxLength !== undefined && maxLength > 0 && str.length > maxLength) {
    return str.slice(0, maxLength);
  }
  return str;
}

/**
 * Constrains a numeric value or string to PostgreSQL NUMERIC(precision, scale) bounds.
 * Example: numeric(2) -> precision=2, scale=0 -> max value 99, 0 decimal places.
 * Example: numeric(10, 2) -> precision=10, scale=2 -> max value 99999999.99, 2 decimal places.
 */
export function clampNumericToPrecisionScale(
  val: any,
  precision?: number,
  scale = 0,
  rowIndex = 0
): { formatted: string; num: number } {
  if (precision === undefined || precision <= 0) {
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    const n = isNaN(num) ? 0 : num;
    return { formatted: isNaN(num) ? '0.00' : String(n), num: n };
  }

  const s = Math.max(0, scale);
  const intDigits = Math.max(0, precision - s);

  // Maximum allowed value in Postgres: 10^(precision - scale) - 10^(-scale)
  const maxAllowed = intDigits > 0
    ? Math.pow(10, intDigits) - (s > 0 ? Math.pow(10, -s) : 1)
    : 1 - Math.pow(10, -s);
  const minAllowed = -maxAllowed;

  let cleaned = String(val).replace(/[^0-9.-]/g, '');
  let num = parseFloat(cleaned);

  if (isNaN(num)) {
    const maxInt = intDigits > 0 ? Math.pow(10, intDigits) - 1 : 0;
    const base = intDigits > 0 ? ((rowIndex % Math.max(1, maxInt)) + 1) : 0;
    const frac = s > 0 ? Math.pow(10, -s) : 0;
    num = base + frac;
  }

  // Strictly clamp within allowed Postgres bounds
  if (num > maxAllowed) {
    num = maxAllowed;
  } else if (num < minAllowed) {
    num = minAllowed;
  }

  const formatted = num.toFixed(s);
  return { formatted, num: parseFloat(formatted) };
}

/**
 * Formats a PostgreSQL value with proper literal quoting and escaping
 */
export function formatPostgresInsertValue(
  rawVal: any,
  type: PostgresInsertType,
  includeCast = false,
  colConstraints?: { maxLength?: number; precision?: number; scale?: number }
): string {
  if (rawVal === null || rawVal === undefined) {
    return 'NULL';
  }

  const strVal = String(rawVal).trim();

  // Keyword check: DEFAULT or NULL
  if (strVal.toUpperCase() === 'DEFAULT') return 'DEFAULT';
  if (strVal.toUpperCase() === 'NULL') return 'NULL';

  // Function expressions (e.g. CURRENT_TIMESTAMP, NOW(), gen_random_uuid())
  if (
    /^(CURRENT_TIMESTAMP|CURRENT_DATE|CURRENT_TIME|LOCALTIMESTAMP|LOCALTIME|NOW\(\)|GEN_RANDOM_UUID\(\)|UUID_GENERATE_V4\(\))$/i.test(strVal)
  ) {
    return strVal;
  }

  // Type-specific formatting
  switch (type) {
    case 'boolean': {
      const lower = strVal.toLowerCase();
      if (['true', 't', '1', 'yes'].includes(lower)) return 'TRUE';
      if (['false', 'f', '0', 'no'].includes(lower)) return 'FALSE';
      return strVal ? 'TRUE' : 'FALSE';
    }

    case 'integer':
    case 'bigint':
    case 'smallint':
    case 'serial':
    case 'bigserial': {
      const cleaned = strVal.replace(/[^0-9-]/g, '');
      let num = parseInt(cleaned, 10);
      if (isNaN(num)) num = 0;
      if (type === 'smallint') {
        if (num > 32767) num = 32767;
        if (num < -32768) num = -32768;
      }
      return includeCast ? `${num}::${type}` : String(num);
    }

    case 'numeric':
    case 'decimal': {
      const { formatted } = clampNumericToPrecisionScale(
        strVal,
        colConstraints?.precision,
        colConstraints?.scale ?? 0
      );
      const castType = colConstraints?.precision
        ? (colConstraints.scale !== undefined && colConstraints.scale > 0
            ? `${type}(${colConstraints.precision}, ${colConstraints.scale})`
            : `${type}(${colConstraints.precision})`)
        : type;
      return includeCast ? `${formatted}::${castType}` : formatted;
    }

    case 'real':
    case 'double precision': {
      const cleaned = strVal.replace(/[^0-9.-]/g, '');
      const num = parseFloat(cleaned);
      if (isNaN(num)) return '0.00';
      return includeCast ? `${cleaned}::${type}` : cleaned;
    }

    case 'json':
    case 'jsonb': {
      let jsonStr = strVal;
      try {
        // Validate if valid JSON
        JSON.parse(strVal);
      } catch {
        jsonStr = JSON.stringify({ data: strVal });
      }
      const escaped = jsonStr.replace(/'/g, "''");
      return includeCast ? `'${escaped}'::${type}` : `'${escaped}'`;
    }

    case 'raw':
      return strVal;

    case 'uuid': {
      const cleanUuid = strVal.replace(/[^a-fA-F0-9-]/g, '');
      const escaped = cleanUuid.replace(/'/g, "''");
      return includeCast ? `'${escaped}'::uuid` : `'${escaped}'`;
    }

    case 'date':
      return includeCast ? `'${strVal.replace(/'/g, "''")}'::date` : `'${strVal.replace(/'/g, "''")}'`;

    case 'timestamp':
    case 'timestamptz':
    case 'time':
    case 'interval':
    case 'varchar':
    case 'character':
    case 'character varying':
    case 'text':
    default: {
      let constrained = strVal;
      if (colConstraints?.maxLength !== undefined && colConstraints.maxLength > 0) {
        constrained = clampStringToMaxLength(constrained, colConstraints.maxLength);
      }
      const escaped = constrained.replace(/'/g, "''");
      const castType = colConstraints?.maxLength
        ? `${type}(${colConstraints.maxLength})`
        : type;
      return includeCast ? `'${escaped}'::${castType}` : `'${escaped}'`;
    }
  }
}

/**
 * Generates mock or preferred value for a column at a given row index (0-based)
 */
export function generateColumnValue(
  col: InsertColumnConfig,
  rowIndex: number,
  totalRows: number
): { formatted: string; raw: any } {
  // 1. Explicit DEFAULT mode
  if (col.valueMode === 'default') {
    return { formatted: 'DEFAULT', raw: 'DEFAULT' };
  }

  // 2. Explicit NULL mode
  if (col.valueMode === 'null') {
    return { formatted: 'NULL', raw: null };
  }

  // 3. Fixed value mode
  if (col.valueMode === 'fixed') {
    let val = col.fixedValue !== undefined ? col.fixedValue : '';
    if ((col.type === 'character varying' || col.type === 'varchar' || col.type === 'character' || col.type === 'text') && col.maxLength) {
      val = clampStringToMaxLength(String(val), col.maxLength);
      return { formatted: formatPostgresInsertValue(val, col.type, false, col), raw: val };
    }
    if ((col.type === 'numeric' || col.type === 'decimal') && col.precision) {
      const { formatted, num } = clampNumericToPrecisionScale(val, col.precision, col.scale ?? 0, rowIndex);
      return { formatted: formatPostgresInsertValue(formatted, col.type, false, col), raw: num };
    }
    return { formatted: formatPostgresInsertValue(val, col.type, false, col), raw: val };
  }

  // 4. Value pool mode (cycles through list)
  if (col.valueMode === 'pool' && col.valuePool && col.valuePool.length > 0) {
    let poolVal = col.valuePool[rowIndex % col.valuePool.length];
    if ((col.type === 'character varying' || col.type === 'varchar' || col.type === 'character' || col.type === 'text') && col.maxLength) {
      poolVal = clampStringToMaxLength(String(poolVal), col.maxLength);
      return { formatted: formatPostgresInsertValue(poolVal, col.type, false, col), raw: poolVal };
    }
    if ((col.type === 'numeric' || col.type === 'decimal') && col.precision) {
      const { formatted, num } = clampNumericToPrecisionScale(poolVal, col.precision, col.scale ?? 0, rowIndex);
      return { formatted: formatPostgresInsertValue(formatted, col.type, false, col), raw: num };
    }
    return { formatted: formatPostgresInsertValue(poolVal, col.type, false, col), raw: poolVal };
  }

  // 5. Generator mode
  const genType = col.generatorType || 'sequential_int';
  const opts = col.generatorOptions || {};

  switch (genType) {
    case 'sequential_int': {
      const start = opts.start !== undefined ? opts.start : 1;
      const step = opts.step !== undefined ? opts.step : 1;
      let num = start + rowIndex * step;
      if ((col.type === 'numeric' || col.type === 'decimal') && col.precision) {
        const { formatted, num: constrainedNum } = clampNumericToPrecisionScale(num, col.precision, col.scale ?? 0, rowIndex);
        return { formatted: formatPostgresInsertValue(formatted, col.type, false, col), raw: constrainedNum };
      }
      return { formatted: String(num), raw: num };
    }

    case 'random_int': {
      let min = opts.min !== undefined ? opts.min : 1;
      let max = opts.max !== undefined ? opts.max : 1000;
      if ((col.type === 'numeric' || col.type === 'decimal') && col.precision) {
        const s = col.scale ?? 0;
        const intDigits = Math.max(0, col.precision - s);
        const maxAllowed = intDigits > 0 ? Math.pow(10, intDigits) - 1 : 0;
        max = Math.min(max, maxAllowed);
        if (min > max) min = 1;
      }
      // Deterministic pseudo-random seed per row index to keep output stable
      const seed = Math.sin(rowIndex + 1) * 10000;
      const rand = Math.floor((seed - Math.floor(seed)) * (max - min + 1)) + min;
      if ((col.type === 'numeric' || col.type === 'decimal') && col.precision) {
        const { formatted, num } = clampNumericToPrecisionScale(rand, col.precision, col.scale ?? 0, rowIndex);
        return { formatted: formatPostgresInsertValue(formatted, col.type, false, col), raw: num };
      }
      return { formatted: String(rand), raw: rand };
    }

    case 'random_decimal': {
      let dec = opts.decimals !== undefined ? opts.decimals : (col.scale !== undefined ? col.scale : 2);
      let min = opts.min !== undefined ? opts.min : 10;
      let max = opts.max !== undefined ? opts.max : 10000;

      if ((col.type === 'numeric' || col.type === 'decimal') && col.precision) {
        const s = col.scale !== undefined ? col.scale : 0;
        dec = s;
        const intDigits = Math.max(0, col.precision - s);
        const maxAllowed = intDigits > 0
          ? Math.pow(10, intDigits) - (s > 0 ? Math.pow(10, -s) : 1)
          : 1 - Math.pow(10, -s);
        max = Math.min(max, maxAllowed);
        if (min >= max) {
          min = intDigits === 1 && s === 0 ? 1 : Math.max(1, Math.min(10, max / 2));
        }
      }

      const seed = Math.cos(rowIndex + 1) * 10000;
      const rand = (seed - Math.floor(seed)) * (max - min) + min;
      const str = rand.toFixed(dec);
      const parsed = parseFloat(str);
      return { formatted: str, raw: parsed };
    }

    case 'uuid': {
      if (opts.isSqlFunction) {
        return { formatted: 'gen_random_uuid()', raw: 'gen_random_uuid()' };
      }
      // Generate deterministic UUID v4 string
      const hex = (rowIndex * 99991 + 123456789).toString(16).padStart(12, '0');
      let uuidStr = `a0000000-0000-4000-8000-${hex.slice(0, 12)}`;
      if (col.maxLength) uuidStr = clampStringToMaxLength(uuidStr, col.maxLength);
      return { formatted: `'${uuidStr}'`, raw: uuidStr };
    }

    case 'current_timestamp': {
      if (opts.isSqlFunction) {
        return { formatted: 'CURRENT_TIMESTAMP', raw: 'CURRENT_TIMESTAMP' };
      }
      // Formatted ISO timestamp shifted by rowIndex hours
      const baseDate = new Date('2026-09-30T10:00:00Z');
      baseDate.setHours(baseDate.getHours() + rowIndex);
      let iso = baseDate.toISOString().replace('T', ' ').replace('Z', '+00');
      if (col.maxLength) iso = clampStringToMaxLength(iso, col.maxLength);
      return { formatted: `'${iso}'`, raw: iso };
    }

    case 'random_date': {
      const baseDate = new Date('2026-01-01');
      baseDate.setDate(baseDate.getDate() + (rowIndex * 17) % 365);
      let dateStr = baseDate.toISOString().slice(0, 10);
      if (col.maxLength) dateStr = clampStringToMaxLength(dateStr, col.maxLength);
      return { formatted: `'${dateStr}'`, raw: dateStr };
    }

    case 'random_boolean': {
      const val = rowIndex % 2 === 0;
      return { formatted: val ? 'TRUE' : 'FALSE', raw: val };
    }

    case 'name': {
      const fn = SAMPLE_FIRST_NAMES[rowIndex % SAMPLE_FIRST_NAMES.length];
      const ln = SAMPLE_LAST_NAMES[(rowIndex * 3) % SAMPLE_LAST_NAMES.length];
      let fullName = `${fn} ${ln}`;
      if (col.maxLength) fullName = clampStringToMaxLength(fullName, col.maxLength);
      return { formatted: `'${fullName.replace(/'/g, "''")}'`, raw: fullName };
    }

    case 'company': {
      const comp = SAMPLE_COMPANIES[rowIndex % SAMPLE_COMPANIES.length];
      let suffixed = totalRows > SAMPLE_COMPANIES.length ? `${comp} #${rowIndex + 1}` : comp;
      if (col.maxLength) suffixed = clampStringToMaxLength(suffixed, col.maxLength);
      return { formatted: `'${suffixed.replace(/'/g, "''")}'`, raw: suffixed };
    }

    case 'email': {
      const fn = SAMPLE_FIRST_NAMES[rowIndex % SAMPLE_FIRST_NAMES.length].toLowerCase();
      const ln = SAMPLE_LAST_NAMES[(rowIndex * 3) % SAMPLE_LAST_NAMES.length].toLowerCase();
      const numSuffix = Math.floor(rowIndex / SAMPLE_FIRST_NAMES.length) > 0 ? `${Math.floor(rowIndex / SAMPLE_FIRST_NAMES.length) + 1}` : '';
      let email = `${fn}.${ln}${numSuffix}@example.com`;
      if (col.maxLength) email = clampStringToMaxLength(email, col.maxLength);
      return { formatted: `'${email.replace(/'/g, "''")}'`, raw: email };
    }

    case 'username': {
      const fn = SAMPLE_FIRST_NAMES[rowIndex % SAMPLE_FIRST_NAMES.length].toLowerCase();
      let u = `${fn}_${String(rowIndex + 1).padStart(3, '0')}`;
      if (col.maxLength) u = clampStringToMaxLength(u, col.maxLength);
      return { formatted: `'${u.replace(/'/g, "''")}'`, raw: u };
    }

    case 'phone': {
      let phone = `+1-555-${String(100 + rowIndex).padStart(3, '0')}-${String(1000 + rowIndex * 7).slice(0, 4)}`;
      if (col.maxLength) phone = clampStringToMaxLength(phone, col.maxLength);
      return { formatted: `'${phone.replace(/'/g, "''")}'`, raw: phone };
    }

    case 'city': {
      let city = SAMPLE_CITIES[rowIndex % SAMPLE_CITIES.length];
      if (col.maxLength) city = clampStringToMaxLength(city, col.maxLength);
      return { formatted: `'${city.replace(/'/g, "''")}'`, raw: city };
    }

    case 'country_code': {
      let code = SAMPLE_COUNTRIES[rowIndex % SAMPLE_COUNTRIES.length];
      if (col.maxLength) code = clampStringToMaxLength(code, col.maxLength);
      return { formatted: `'${code.replace(/'/g, "''")}'`, raw: code };
    }

    case 'json_object': {
      const obj = {
        row_id: rowIndex + 1,
        active: rowIndex % 2 === 0,
        tier: rowIndex % 3 === 0 ? 'premium' : 'standard',
        tags: ['test', `batch_${Math.floor(rowIndex / 10) + 1}`],
      };
      const jsonStr = JSON.stringify(obj).replace(/'/g, "''");
      return { formatted: `'${jsonStr}'::jsonb`, raw: obj };
    }

    case 'lorem': {
      let lorem = `Sample record entry #${rowIndex + 1} generated for PostgreSQL integration testing.`;
      if (col.maxLength) lorem = clampStringToMaxLength(lorem, col.maxLength);
      return { formatted: `'${lorem.replace(/'/g, "''")}'`, raw: lorem };
    }

    default: {
      let fallback = `Record_${rowIndex + 1}`;
      if (col.maxLength) fallback = clampStringToMaxLength(fallback, col.maxLength);
      return { formatted: `'${fallback.replace(/'/g, "''")}'`, raw: fallback };
    }
  }
}

/**
 * Builds the ON CONFLICT clause for PostgreSQL
 */
export function buildConflictClause(
  conflictStrategy: ConflictStrategy,
  conflictTargetColumns: string[],
  conflictUpdateColumns: string[]
): string {
  if (conflictStrategy === 'none') {
    return '';
  }

  const targetPart = conflictTargetColumns.length > 0
    ? ` (${conflictTargetColumns.map((c) => `"${c}"`).join(', ')})`
    : '';

  if (conflictStrategy === 'do_nothing') {
    return `\nON CONFLICT${targetPart} DO NOTHING`;
  }

  if (conflictStrategy === 'do_update') {
    if (conflictUpdateColumns.length === 0) {
      return `\nON CONFLICT${targetPart} DO NOTHING`;
    }
    const assignments = conflictUpdateColumns.map(
      (c) => `  "${c}" = EXCLUDED."${c}"`
    );
    return `\nON CONFLICT${targetPart} DO UPDATE SET\n${assignments.join(',\n')}`;
  }

  return '';
}

/**
 * Builds the RETURNING clause
 */
export function buildReturningClause(clause: string): string {
  const trimmed = clause.trim();
  if (!trimmed) return '';
  return `\nRETURNING ${trimmed}`;
}

/**
 * Core query generator function for PostgreSQL INSERT statements
 */
export function generatePostgresInsertQuery(options: InsertQueryOptions): GeneratedInsertResult {
  const opts: InsertQueryOptions = {
    ...DEFAULT_INSERT_OPTIONS,
    ...options,
  };

  const activeColumns = opts.columns.filter((col) => !col.excludeFromInsert);
  const excludedColumns = opts.columns.filter((col) => col.excludeFromInsert);

  const columnsIncludedNames = activeColumns.map((c) => c.name);
  const columnsExcludedNames = excludedColumns.map((c) => c.name);

  if (activeColumns.length === 0) {
    return {
      sql: '-- Warning: All columns have been excluded from the INSERT statement.\n-- Please uncheck "Exclude" on at least one column to generate an INSERT query.',
      rowCount: 0,
      columnsIncluded: [],
      columnsExcluded: columnsExcludedNames,
    };
  }

  const tableIdentifier = opts.schema && opts.schema !== 'public'
    ? `"${opts.schema}"."${opts.tableName}"`
    : `"${opts.tableName}"`;

  const columnHeadersSql = `(${activeColumns.map((c) => `"${c.name}"`).join(', ')})`;
  const conflictClause = buildConflictClause(
    opts.conflictStrategy,
    opts.conflictTargetColumns,
    opts.conflictUpdateColumns
  );
  const returningClause = buildReturningClause(opts.returningClause);

  const totalRows = Math.max(1, Math.min(opts.rowCount || 5, 2000));
  const lines: string[] = [];

  if (opts.includeComments) {
    lines.push(`-- =========================================================================`);
    lines.push(`-- PostgreSQL INSERT Generator: ${tableIdentifier}`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push(`-- Target Table: ${tableIdentifier} (${activeColumns.length} columns, ${totalRows} rows)`);
    if (excludedColumns.length > 0) {
      lines.push(`-- Excluded Columns: ${excludedColumns.map((c) => c.name).join(', ')}`);
    }
    if (opts.conflictStrategy !== 'none') {
      lines.push(`-- Upsert Strategy: ${opts.conflictStrategy.toUpperCase()}`);
    }
    lines.push(`-- =========================================================================\n`);
  }

  if (opts.wrapInTransaction) {
    lines.push('BEGIN;\n');
  }

  // Pre-generate raw row values
  const rowValues: { formatted: string; raw: any }[][] = [];
  for (let r = 0; r < totalRows; r++) {
    const row = activeColumns.map((col) => generateColumnValue(col, r, totalRows));
    rowValues.push(row);
  }

  const parameterValues: any[][] = [];

  // STRATEGY 1: Bulk Single Statement (or chunked batches)
  if (opts.insertStrategy === 'bulk_single_statement') {
    const batchSize = Math.max(1, opts.batchSize || 100);
    const totalBatches = Math.ceil(totalRows / batchSize);

    for (let b = 0; b < totalBatches; b++) {
      const startIdx = b * batchSize;
      const endIdx = Math.min(startIdx + batchSize, totalRows);
      const batchRows = rowValues.slice(startIdx, endIdx);

      const valueRowsSql = batchRows
        .map((row) => `  (${row.map((item) => item.formatted).join(', ')})`)
        .join(',\n');

      if (totalBatches > 1 && opts.includeComments) {
        lines.push(`-- Batch ${b + 1} of ${totalBatches} (${batchRows.length} rows)`);
      }

      lines.push(`INSERT INTO ${tableIdentifier} ${columnHeadersSql}\nVALUES\n${valueRowsSql}${conflictClause}${returningClause};`);
      if (b < totalBatches - 1) {
        lines.push('');
      }
    }
  }

  // STRATEGY 2: Individual INSERT Statements
  else if (opts.insertStrategy === 'individual_statements') {
    for (let r = 0; r < totalRows; r++) {
      const row = rowValues[r];
      const valuesSql = `(${row.map((item) => item.formatted).join(', ')})`;
      lines.push(`INSERT INTO ${tableIdentifier} ${columnHeadersSql} VALUES ${valuesSql}${conflictClause}${returningClause};`);
    }
  }

  // STRATEGY 3: CTE / WITH VALUES
  else if (opts.insertStrategy === 'cte_values') {
    const valueRowsSql = rowValues
      .map((row) => `    (${row.map((item) => item.formatted).join(', ')})`)
      .join(',\n');

    lines.push(`WITH source_rows ${columnHeadersSql} AS (\n  VALUES\n${valueRowsSql}\n)\nINSERT INTO ${tableIdentifier} ${columnHeadersSql}\nSELECT ${activeColumns.map((c) => `"${c.name}"`).join(', ')}\nFROM source_rows${conflictClause}${returningClause};`);
  }

  // STRATEGY 4: Parameterized ($1, $2, ...)
  else if (opts.insertStrategy === 'parameterized') {
    let paramCounter = 1;
    const valueTuples: string[] = [];

    for (let r = 0; r < totalRows; r++) {
      const rowParams: string[] = [];
      const rowRawVals: any[] = [];

      for (let c = 0; c < activeColumns.length; c++) {
        rowParams.push(`$${paramCounter++}`);
        rowRawVals.push(rowValues[r][c].raw);
      }
      valueTuples.push(`  (${rowParams.join(', ')})`);
      parameterValues.push(rowRawVals);
    }

    lines.push(`-- Parameterized Query (${activeColumns.length} columns x ${totalRows} rows = ${paramCounter - 1} parameters)`);
    lines.push(`INSERT INTO ${tableIdentifier} ${columnHeadersSql}\nVALUES\n${valueTuples.join(',\n')}${conflictClause}${returningClause};`);
  }

  if (opts.wrapInTransaction) {
    lines.push('\nCOMMIT;');
  }

  // Generate preview data grid rows & CSV export
  const previewRows: Record<string, any>[] = [];
  for (let r = 0; r < totalRows; r++) {
    const rowObj: Record<string, any> = {};
    for (let c = 0; c < activeColumns.length; c++) {
      rowObj[activeColumns[c].name] = rowValues[r][c].raw;
    }
    previewRows.push(rowObj);
  }

  const csvHeaders = activeColumns.map((c) => `"${c.name.replace(/"/g, '""')}"`).join(',');
  const csvDataLines = previewRows.map((r) =>
    activeColumns
      .map((c) => {
        const val = r[c.name];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const previewCsv = [csvHeaders, ...csvDataLines].join('\n');

  return {
    sql: lines.join('\n'),
    rowCount: totalRows,
    columnsIncluded: columnsIncludedNames,
    columnsExcluded: columnsExcludedNames,
    parameterValues: parameterValues.length > 0 ? parameterValues : undefined,
    parametersJson: parameterValues.length > 0 ? JSON.stringify(parameterValues, null, 2) : undefined,
    previewRows,
    previewCsv,
  };
}

/**
 * Parses preferred values entered by user (supports newlines from spreadsheet copy-paste, commas, tabs, semicolons)
 */
export function parsePreferredValuesInput(input: string): string[] {
  if (!input) return [];
  return input
    .split(/[\r\n,;\t]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Generates clean PostgreSQL CREATE TABLE DDL from current column options
 */
export function generateCreateTableDdl(options: InsertQueryOptions): string {
  const schemaPart = options.schema && options.schema !== 'public' ? `"${options.schema}".` : '';
  const lines: string[] = [];
  lines.push(`CREATE TABLE IF NOT EXISTS ${schemaPart}"${options.tableName || 'my_table'}" (`);

  const colLines: string[] = [];
  const pkCols: string[] = [];

  for (const col of options.columns) {
    let typeDef = col.type.toUpperCase();
    if ((col.type === 'character varying' || col.type === 'varchar' || col.type === 'character') && col.maxLength) {
      typeDef = `${col.type.toUpperCase()}(${col.maxLength})`;
    } else if ((col.type === 'numeric' || col.type === 'decimal') && col.precision) {
      typeDef = col.scale !== undefined && col.scale > 0
        ? `${col.type.toUpperCase()}(${col.precision}, ${col.scale})`
        : `${col.type.toUpperCase()}(${col.precision})`;
    }
    let def = `  "${col.name}" ${typeDef}`;
    if (col.isPrimaryKey) {
      pkCols.push(`"${col.name}"`);
    }
    if (!col.nullable) {
      def += ' NOT NULL';
    }
    if (col.isUnique && !col.isPrimaryKey) {
      def += ' UNIQUE';
    }
    if (col.hasDefault && col.fixedValue) {
      def += ` DEFAULT ${col.fixedValue}`;
    }
    colLines.push(def);
  }

  if (pkCols.length > 0) {
    colLines.push(`  PRIMARY KEY (${pkCols.join(', ')})`);
  }

  lines.push(colLines.join(',\n'));
  lines.push(');');
  return lines.join('\n');
}

/**
 * Extracts and maps raw DDL string (CREATE TABLE) to an InsertQueryOptions object
 */
export function parsePostgresSchema(ddl: string): {
  success: boolean;
  tableName: string;
  schema: string;
  columns: InsertColumnConfig[];
  error?: string;
} {
  try {
    const cleaned = ddl
      .replace(/--.*$/gm, '') // strip single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // strip block comments
      .trim();

    // Match CREATE TABLE [IF NOT EXISTS] [schema.]table_name ( ... )
    const tableMatch = cleaned.match(/CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:(?:"([^"]+)"|([a-zA-Z0-9_]+))\.)?(?:"([^"]+)"|([a-zA-Z0-9_]+))\s*\(([\s\S]+)\)/i);

    if (!tableMatch) {
      return {
        success: false,
        tableName: 'my_table',
        schema: 'public',
        columns: [],
        error: 'Could not find a valid CREATE TABLE statement in the provided DDL. Please provide valid PostgreSQL DDL syntax.',
      };
    }

    const schemaName = tableMatch[1] || tableMatch[2] || 'public';
    const tableName = tableMatch[3] || tableMatch[4] || 'my_table';
    const body = tableMatch[5];

    // Split body by commas that are NOT enclosed in parentheses
    const columnDefinitions: string[] = [];
    let parenDepth = 0;
    let currentChunk = '';

    for (let i = 0; i < body.length; i++) {
      const ch = body[i];
      if (ch === '(') parenDepth++;
      else if (ch === ')') parenDepth--;

      if (ch === ',' && parenDepth === 0) {
        if (currentChunk.trim()) columnDefinitions.push(currentChunk.trim());
        currentChunk = '';
      } else {
        currentChunk += ch;
      }
    }
    if (currentChunk.trim()) {
      columnDefinitions.push(currentChunk.trim());
    }

    const columns: InsertColumnConfig[] = [];
    const tablePrimaryKeys: string[] = [];

    // First pass: detect table-level PRIMARY KEY (col1, col2)
    for (const def of columnDefinitions) {
      const pkMatch = def.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        const pkCols = pkMatch[1].split(',').map((c) => c.replace(/["\s]/g, '').toLowerCase());
        tablePrimaryKeys.push(...pkCols);
      }
    }

    let colIndex = 1;

    for (const def of columnDefinitions) {
      // Ignore table-level constraints
      if (/^(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)\b/i.test(def)) {
        continue;
      }

      // Column pattern: "col_name" or col_name followed by data type & constraints
      const colNameMatch = def.match(/^(?:"([^"]+)"|([a-zA-Z0-9_]+))\s+([\s\S]+)$/);
      if (!colNameMatch) continue;

      const colName = colNameMatch[1] || colNameMatch[2];
      const remainder = colNameMatch[3].trim();

      const isPkColumn = /\bPRIMARY\s+KEY\b/i.test(remainder) || tablePrimaryKeys.includes(colName.toLowerCase());
      const isUnique = /\bUNIQUE\b/i.test(remainder);
      const isNotNull = /\bNOT\s+NULL\b/i.test(remainder) || isPkColumn;
      const isNullable = !isNotNull;
      const hasExplicitDefault = /\bDEFAULT\b/i.test(remainder);

      // Extract size constraints: maxLength, precision, scale
      let extractedMaxLength: number | undefined;
      let extractedPrecision: number | undefined;
      let extractedScale: number | undefined;

      // Match string length constraints e.g. character varying (25), varchar(50), character(10), char(5)
      const strLenMatch = remainder.match(/(?:character\s+varying|varchar|character|char)\s*\(\s*(\d+)\s*\)/i);
      if (strLenMatch) {
        extractedMaxLength = parseInt(strLenMatch[1], 10);
      } else if (/\b(?:character|char)\b(?!\s*varying)/i.test(remainder) && !/\(\s*\d+\s*\)/.test(remainder)) {
        // SQL standard: CHAR without length means CHAR(1)
        extractedMaxLength = 1;
      }

      // Match numeric precision and optional scale e.g. numeric(2), numeric ( 10 , 2 ), decimal(8, 3)
      const numPrecMatch = remainder.match(/(?:numeric|decimal)\s*\(\s*(\d+)(?:\s*,\s*(\d+))?\s*\)/i);
      if (numPrecMatch) {
        extractedPrecision = parseInt(numPrecMatch[1], 10);
        extractedScale = numPrecMatch[2] !== undefined ? parseInt(numPrecMatch[2], 10) : 0;
      }

      // Strip known constraint clauses to isolate data type
      const rawType = remainder
        .replace(/\bPRIMARY\s+KEY\b/gi, '')
        .replace(/\bNOT\s+NULL\b/gi, '')
        .replace(/\bNULL\b/gi, '')
        .replace(/\bUNIQUE\b/gi, '')
        .replace(/\bDEFAULT\s+[\s\S]*$/gi, '')
        .replace(/\bREFERENCES\s+[\s\S]*$/gi, '')
        .replace(/\bCHECK\s*\([\s\S]*\)/gi, '')
        .replace(/\bCOLLATE\s+[\w"]+/gi, '')
        .trim()
        .toLowerCase();

      // Map raw SQL type to PostgresInsertType
      let mappedType: PostgresInsertType = 'text';
      if (/^smallint/i.test(rawType)) mappedType = 'smallint';
      else if (/^(bigserial|serial8)/i.test(rawType)) mappedType = 'bigserial';
      else if (/^(serial|serial4)/i.test(rawType)) mappedType = 'serial';
      else if (/^bigint|int8/i.test(rawType)) mappedType = 'bigint';
      else if (/^int(eger)?|int4/i.test(rawType)) mappedType = 'integer';
      else if (/^numeric|decimal/i.test(rawType)) mappedType = 'numeric';
      else if (/^double\s+precision|float8/i.test(rawType)) mappedType = 'double precision';
      else if (/^real|float4/i.test(rawType)) mappedType = 'real';
      else if (/^bool(ean)?/i.test(rawType)) mappedType = 'boolean';
      else if (/^timestamptz|timestamp\s+with\s+time\s+zone/i.test(rawType)) mappedType = 'timestamptz';
      else if (/^timestamp/i.test(rawType)) mappedType = 'timestamp';
      else if (/^date/i.test(rawType)) mappedType = 'date';
      else if (/^jsonb/i.test(rawType)) mappedType = 'jsonb';
      else if (/^json/i.test(rawType)) mappedType = 'json';
      else if (/^uuid/i.test(rawType)) mappedType = 'uuid';
      else if (/^bytea/i.test(rawType)) mappedType = 'bytea';
      else if (/^inet/i.test(rawType)) mappedType = 'inet';
      else if (/^character\s+varying/i.test(rawType)) mappedType = 'character varying';
      else if (/^character\b/i.test(rawType)) mappedType = 'character';
      else if (/^varchar/i.test(rawType)) mappedType = 'varchar';
      else if (/^text/i.test(rawType)) mappedType = 'text';

      const hasDefault = hasExplicitDefault || mappedType === 'serial' || mappedType === 'bigserial';
      const upperRemainder = remainder.toUpperCase();

      // Smart generator selection based on type & column name
      let valMode: ValueGenerationMode = 'generator';
      let genType: GeneratorType = 'sequential_int';
      let excludeFromInsert = false;
      let fixedVal = '';
      let genOpts: GeneratorOptions = {};

      // If auto-incrementing serial primary key, exclude by default so Postgres increments it
      if (mappedType === 'serial' || mappedType === 'bigserial' || (isPkColumn && hasDefault && upperRemainder.includes('NEXTVAL'))) {
        excludeFromInsert = true;
        genType = 'sequential_int';
      } else if (mappedType === 'uuid') {
        genType = 'uuid';
        genOpts = { isSqlFunction: hasDefault && upperRemainder.includes('GEN_RANDOM_UUID') };
      } else if (mappedType === 'boolean') {
        valMode = 'fixed';
        fixedVal = 'true';
        genType = 'random_boolean';
      } else if (mappedType === 'timestamp' || mappedType === 'timestamptz') {
        genType = 'current_timestamp';
        genOpts = { isSqlFunction: true };
      } else if (mappedType === 'date') {
        genType = 'random_date';
      } else if (mappedType === 'numeric' || mappedType === 'double precision') {
        genType = 'random_decimal';
        if (extractedPrecision !== undefined) {
          const s = extractedScale ?? 0;
          const intDigits = Math.max(0, extractedPrecision - s);
          if (intDigits === 0) {
            const maxVal = 1 - Math.pow(10, -s);
            genOpts = { min: Math.pow(10, -s), max: maxVal, decimals: s };
          } else {
            const maxAllowed = Math.pow(10, intDigits) - (s > 0 ? Math.pow(10, -s) : 1);
            const maxVal = Math.min(10000, maxAllowed);
            const minVal = intDigits === 1 && s === 0 ? 1 : Math.max(1, Math.min(10, maxVal / 2));
            genOpts = { min: minVal, max: maxVal, decimals: s };
          }
        } else {
          genOpts = { min: 100, max: 10000, decimals: 2 };
        }
      } else if (mappedType === 'integer' || mappedType === 'bigint' || mappedType === 'smallint') {
        genType = 'random_int';
        genOpts = { min: 1, max: 1000 };
      } else if (mappedType === 'jsonb' || mappedType === 'json') {
        genType = 'json_object';
      } else {
        // String types: infer from column name & size constraint
        const lowerName = colName.toLowerCase();
        if (extractedMaxLength !== undefined && extractedMaxLength <= 3) {
          genType = 'country_code';
        } else if (lowerName.includes('email')) genType = 'email';
        else if (lowerName.includes('name') && !lowerName.includes('company')) genType = 'name';
        else if (lowerName.includes('company') || lowerName.includes('org')) genType = 'company';
        else if (lowerName.includes('user') || lowerName.includes('login')) genType = 'username';
        else if (lowerName.includes('phone') || lowerName.includes('mobile')) genType = 'phone';
        else if (lowerName.includes('city')) genType = 'city';
        else if (lowerName.includes('country')) genType = 'country_code';
        else genType = 'lorem';
      }

      columns.push({
        id: `col_${colIndex++}`,
        name: colName,
        type: mappedType,
        maxLength: extractedMaxLength,
        precision: extractedPrecision,
        scale: extractedScale,
        nullable: isNullable,
        hasDefault,
        isPrimaryKey: isPkColumn,
        isUnique,
        excludeFromInsert,
        valueMode: valMode,
        fixedValue: fixedVal,
        valuePool: [],
        generatorType: genType,
        generatorOptions: genOpts,
      });
    }

    return {
      success: true,
      tableName,
      schema: schemaName,
      columns,
    };
  } catch (err: any) {
    return {
      success: false,
      tableName: 'my_table',
      schema: 'public',
      columns: [],
      error: err?.message || 'Failed to parse schema DDL.',
    };
  }
}

/**
 * Creates a serialized configuration export JSON string
 */
export function createDbInsertConfigExport(options: InsertQueryOptions): string {
  const exportPayload = {
    app: 'DevHub',
    tool: 'db-insert-query-generator',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    config: options,
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Validates and restores an imported configuration JSON string
 */
export function validateAndParseDbInsertConfig(jsonString: string): {
  success: boolean;
  options?: InsertQueryOptions;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    const config = parsed.config || parsed;

    if (!config || typeof config !== 'object') {
      return { success: false, error: 'Invalid configuration: Expected a JSON object.' };
    }

    if (typeof config.tableName !== 'string' || !config.tableName.trim()) {
      return { success: false, error: 'Invalid configuration: Missing valid "tableName" property.' };
    }

    if (!Array.isArray(config.columns) || config.columns.length === 0) {
      return { success: false, error: 'Invalid configuration: "columns" must be a non-empty array.' };
    }

    const sanitizedColumns: InsertColumnConfig[] = config.columns.map((c: any, idx: number) => ({
      id: c.id || `col_${idx + 1}`,
      name: String(c.name || `column_${idx + 1}`),
      type: c.type || 'text',
      maxLength: typeof c.maxLength === 'number' ? c.maxLength : undefined,
      precision: typeof c.precision === 'number' ? c.precision : undefined,
      scale: typeof c.scale === 'number' ? c.scale : undefined,
      nullable: Boolean(c.nullable),
      hasDefault: Boolean(c.hasDefault),
      isPrimaryKey: Boolean(c.isPrimaryKey),
      isUnique: Boolean(c.isUnique),
      excludeFromInsert: Boolean(c.excludeFromInsert),
      valueMode: c.valueMode || 'generator',
      fixedValue: c.fixedValue !== undefined ? String(c.fixedValue) : '',
      valuePool: Array.isArray(c.valuePool) ? c.valuePool.map(String) : [],
      generatorType: c.generatorType || 'sequential_int',
      generatorOptions: c.generatorOptions || {},
    }));

    const sanitizedOptions: InsertQueryOptions = {
      tableName: config.tableName.trim(),
      schema: config.schema || 'public',
      columns: sanitizedColumns,
      rowCount: typeof config.rowCount === 'number' ? Math.max(1, config.rowCount) : 5,
      insertStrategy: config.insertStrategy || 'bulk_single_statement',
      batchSize: typeof config.batchSize === 'number' ? config.batchSize : 100,
      conflictStrategy: config.conflictStrategy || 'none',
      conflictTargetColumns: Array.isArray(config.conflictTargetColumns) ? config.conflictTargetColumns : [],
      conflictUpdateColumns: Array.isArray(config.conflictUpdateColumns) ? config.conflictUpdateColumns : [],
      returningClause: config.returningClause || '',
      wrapInTransaction: Boolean(config.wrapInTransaction),
      includeTypeCasts: Boolean(config.includeTypeCasts),
      includeComments: config.includeComments !== undefined ? Boolean(config.includeComments) : true,
    };

    return { success: true, options: sanitizedOptions };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Invalid JSON format.' };
  }
}

/**
 * Built-in Preset Templates for quick testing
 */
export const DB_INSERT_PRESETS: {
  id: string;
  name: string;
  description: string;
  badge: string;
  options: InsertQueryOptions;
}[] = [
  {
    id: 'ecommerce-orders',
    name: 'E-Commerce Orders & Line Items (UPSERT & JSONB)',
    description: 'Order ledger with customer UUID, JSONB metadata, total amount, status, and ON CONFLICT DO UPDATE',
    badge: 'Bulk INSERT / UPSERT',
    options: {
      tableName: 'orders',
      schema: 'public',
      columns: [
        {
          id: 'ord_1',
          name: 'order_id',
          type: 'uuid',
          nullable: false,
          hasDefault: true,
          isPrimaryKey: true,
          isUnique: true,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: '',
          valuePool: [],
          generatorType: 'uuid',
          generatorOptions: { isSqlFunction: true },
        },
        {
          id: 'ord_2',
          name: 'customer_email',
          type: 'varchar',
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: '',
          valuePool: [],
          generatorType: 'email',
        },
        {
          id: 'ord_3',
          name: 'total_amount',
          type: 'numeric',
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: '129.50',
          valuePool: ['49.99', '129.50', '299.00', '850.25'],
          generatorType: 'random_decimal',
          generatorOptions: { min: 25, max: 1200, decimals: 2 },
        },
        {
          id: 'ord_4',
          name: 'status',
          type: 'varchar',
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'pool',
          fixedValue: 'PENDING',
          valuePool: ['PENDING', 'PROCESSING', 'COMPLETED', 'SHIPPED'],
          generatorType: 'name',
        },
        {
          id: 'ord_5',
          name: 'metadata',
          type: 'jsonb',
          nullable: true,
          hasDefault: true,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: '{"channel": "web"}',
          valuePool: [],
          generatorType: 'json_object',
        },
        {
          id: 'ord_6',
          name: 'created_at',
          type: 'timestamptz',
          nullable: false,
          hasDefault: true,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: 'CURRENT_TIMESTAMP',
          valuePool: [],
          generatorType: 'current_timestamp',
          generatorOptions: { isSqlFunction: true },
        },
      ],
      rowCount: 5,
      insertStrategy: 'bulk_single_statement',
      batchSize: 100,
      conflictStrategy: 'do_update',
      conflictTargetColumns: ['order_id'],
      conflictUpdateColumns: ['total_amount', 'status', 'metadata'],
      returningClause: 'order_id, status, created_at',
      wrapInTransaction: false,
      includeTypeCasts: false,
      includeComments: true,
    },
  },
  {
    id: 'user-accounts',
    name: 'User Accounts & Credentials (SERIAL PK, RETURNING)',
    description: 'User registration schema with auto-generated serial ID, unique username, email pool, and RETURNING clause',
    badge: 'Auth / DDL Sync',
    options: {
      tableName: 'user_accounts',
      schema: 'public',
      columns: [
        {
          id: 'usr_1',
          name: 'id',
          type: 'serial',
          nullable: false,
          hasDefault: true,
          isPrimaryKey: true,
          isUnique: true,
          excludeFromInsert: true, // Let Postgres sequence handle id
          valueMode: 'generator',
          fixedValue: '',
          valuePool: [],
          generatorType: 'sequential_int',
        },
        {
          id: 'usr_2',
          name: 'username',
          type: 'varchar',
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: true,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: '',
          valuePool: [],
          generatorType: 'username',
        },
        {
          id: 'usr_3',
          name: 'email',
          type: 'varchar',
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: true,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: '',
          valuePool: [],
          generatorType: 'email',
        },
        {
          id: 'usr_4',
          name: 'role',
          type: 'varchar',
          nullable: false,
          hasDefault: true,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'pool',
          fixedValue: 'member',
          valuePool: ['admin', 'manager', 'developer', 'viewer'],
          generatorType: 'name',
        },
        {
          id: 'usr_5',
          name: 'is_verified',
          type: 'boolean',
          nullable: false,
          hasDefault: true,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'fixed',
          fixedValue: 'true',
          valuePool: ['true', 'false'],
          generatorType: 'random_boolean',
        },
        {
          id: 'usr_6',
          name: 'registered_at',
          type: 'timestamptz',
          nullable: false,
          hasDefault: true,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: 'CURRENT_TIMESTAMP',
          valuePool: [],
          generatorType: 'current_timestamp',
          generatorOptions: { isSqlFunction: true },
        },
      ],
      rowCount: 5,
      insertStrategy: 'bulk_single_statement',
      batchSize: 100,
      conflictStrategy: 'do_nothing',
      conflictTargetColumns: ['username'],
      conflictUpdateColumns: [],
      returningClause: '*',
      wrapInTransaction: true,
      includeTypeCasts: false,
      includeComments: true,
    },
  },
  {
    id: 'audit-logs',
    name: 'Security Audit Logs (High-Volume Batched VALUES)',
    description: 'High-throughput system event logs with client IP, action verbs, user ID, and timestamp',
    badge: 'Audit / Logging',
    options: {
      tableName: 'security_audit_logs',
      schema: 'public',
      columns: [
        {
          id: 'aud_1',
          name: 'log_id',
          type: 'bigserial',
          nullable: false,
          hasDefault: true,
          isPrimaryKey: true,
          isUnique: true,
          excludeFromInsert: true,
          valueMode: 'generator',
          fixedValue: '',
          valuePool: [],
          generatorType: 'sequential_int',
        },
        {
          id: 'aud_2',
          name: 'event_type',
          type: 'varchar',
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'pool',
          fixedValue: 'USER_LOGIN',
          valuePool: ['USER_LOGIN', 'TOKEN_REFRESH', 'PASSWORD_RESET', 'PERMISSION_GRANT', 'API_KEY_CREATED'],
          generatorType: 'name',
        },
        {
          id: 'aud_3',
          name: 'client_ip',
          type: 'inet',
          nullable: true,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'pool',
          fixedValue: '192.168.1.1',
          valuePool: ['192.168.1.100', '10.0.4.15', '172.16.0.42', '127.0.0.1'],
          generatorType: 'name',
        },
        {
          id: 'aud_4',
          name: 'user_agent',
          type: 'text',
          nullable: true,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'fixed',
          fixedValue: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          valuePool: [],
          generatorType: 'lorem',
        },
        {
          id: 'aud_5',
          name: 'success',
          type: 'boolean',
          nullable: false,
          hasDefault: true,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'fixed',
          fixedValue: 'true',
          valuePool: [],
          generatorType: 'random_boolean',
        },
        {
          id: 'aud_6',
          name: 'logged_at',
          type: 'timestamptz',
          nullable: false,
          hasDefault: true,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: 'CURRENT_TIMESTAMP',
          valuePool: [],
          generatorType: 'current_timestamp',
          generatorOptions: { isSqlFunction: true },
        },
      ],
      rowCount: 8,
      insertStrategy: 'bulk_single_statement',
      batchSize: 100,
      conflictStrategy: 'none',
      conflictTargetColumns: [],
      conflictUpdateColumns: [],
      returningClause: '',
      wrapInTransaction: false,
      includeTypeCasts: false,
      includeComments: true,
    },
  },
  {
    id: 'inventory-items',
    name: 'Product Inventory (VARCHAR(25), NUMERIC(2), NUMERIC(8,2))',
    description: 'Catalog items with size-constrained SKU varchar(25), rating numeric(2), price numeric(8,2), and short_desc char(25)',
    badge: 'Size Constraints Test',
    options: {
      tableName: 'product_inventory',
      schema: 'public',
      columns: [
        {
          id: 'inv_1',
          name: 'sku',
          type: 'character varying',
          maxLength: 25,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: true,
          isUnique: true,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: '',
          valuePool: [],
          generatorType: 'company',
        },
        {
          id: 'inv_2',
          name: 'category_code',
          type: 'varchar',
          maxLength: 10,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'pool',
          fixedValue: 'ELECTRONIC',
          valuePool: ['HARDWARE', 'SOFTWARE', 'OFFICE', 'MOBILE', 'APPAREL'],
          generatorType: 'name',
        },
        {
          id: 'inv_3',
          name: 'quality_rating',
          type: 'numeric',
          precision: 2,
          scale: 0,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: '9',
          valuePool: ['5', '8', '9', '10', '12'],
          generatorType: 'random_decimal',
          generatorOptions: { min: 1, max: 99, decimals: 0 },
        },
        {
          id: 'inv_4',
          name: 'unit_price',
          type: 'numeric',
          precision: 8,
          scale: 2,
          nullable: false,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: '49.99',
          valuePool: ['19.99', '49.99', '129.50', '850.00'],
          generatorType: 'random_decimal',
          generatorOptions: { min: 10, max: 2500, decimals: 2 },
        },
        {
          id: 'inv_5',
          name: 'short_desc',
          type: 'character',
          maxLength: 25,
          nullable: true,
          hasDefault: false,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'generator',
          fixedValue: 'Standard boxed inventory',
          valuePool: [],
          generatorType: 'lorem',
        },
        {
          id: 'inv_6',
          name: 'in_stock',
          type: 'boolean',
          nullable: false,
          hasDefault: true,
          isPrimaryKey: false,
          isUnique: false,
          excludeFromInsert: false,
          valueMode: 'fixed',
          fixedValue: 'true',
          valuePool: ['true', 'false'],
          generatorType: 'random_boolean',
        },
      ],
      rowCount: 5,
      insertStrategy: 'bulk_single_statement',
      batchSize: 100,
      conflictStrategy: 'none',
      conflictTargetColumns: [],
      conflictUpdateColumns: [],
      returningClause: '*',
      wrapInTransaction: false,
      includeTypeCasts: false,
      includeComments: true,
    },
  },
];
