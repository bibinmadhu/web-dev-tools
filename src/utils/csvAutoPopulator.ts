/**
 * CSV Auto Populator Engine
 * Generates realistic, constraint-compliant CSV datasets from user-defined headers and column rules.
 */

export type CsvGeneratorType =
  | 'auto'
  | 'sequence'
  | 'uuid'
  | 'first_name'
  | 'last_name'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'country'
  | 'city'
  | 'state'
  | 'street_address'
  | 'postal_code'
  | 'company'
  | 'job_title'
  | 'department'
  | 'integer_range'
  | 'decimal_range'
  | 'percentage'
  | 'currency'
  | 'date_range'
  | 'relative_date'
  | 'pick_list'
  | 'boolean'
  | 'pattern'
  | 'formula'
  | 'fixed'
  | 'lorem_words'
  | 'ip_address'
  | 'url'
  | 'status_code';

export interface CsvColumnRule {
  id: string;
  header: string;
  generatorType: CsvGeneratorType;
  unique?: boolean;
  nullable?: boolean;
  nullProbability?: number; // 0 to 100
  nullValueRepresentation?: string; // "", "NULL", "N/A", "-"
  prefix?: string;
  suffix?: string;
  transformCase?: 'none' | 'uppercase' | 'lowercase' | 'titlecase' | 'camelcase';

  // Sequence generator options
  startNumber?: number;
  stepNumber?: number;

  // Numeric generator options
  min?: number;
  max?: number;
  decimals?: number;
  currencySymbol?: string;

  // Date generator options
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  dateFormat?: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD HH:mm:ss' | 'timestamp';
  relativeDirection?: 'past' | 'future';
  relativeAmount?: number;
  relativeUnit?: 'days' | 'months' | 'years';

  // Categorical / Pick list options
  pickList?: string[];
  pickListMode?: 'random' | 'sequential' | 'weighted';
  pickListWeights?: Record<string, number>; // e.g. { "Active": 80, "Inactive": 20 }

  // Boolean options
  booleanFormat?: 'true/false' | 'TRUE/FALSE' | '1/0' | 'yes/no' | 'Y/N';
  trueProbability?: number; // 0 to 100

  // Pattern / Mask options (# = digit, ? = letter, * = alphanumeric)
  patternTemplate?: string;

  // Formula / Expression (e.g. `${row.first_name.toLowerCase()}@example.com`)
  formulaExpr?: string;

  // Fixed text
  fixedText?: string;

  // Contact / Email domain
  emailDomain?: string;
}

export interface CsvPopulatorOptions {
  rowCount: number;
  delimiter: ',' | ';' | '\t' | '|' | '~';
  quoteChar: '"' | "'" | '';
  quoteMode: 'needed' | 'always' | 'never';
  lineEnding: '\n' | '\r\n';
  includeHeader: boolean;
  columns: CsvColumnRule[];
  customGridRows?: Record<string, any>[];
}

export const DEFAULT_CSV_OPTIONS: CsvPopulatorOptions = {
  rowCount: 25,
  delimiter: ',',
  quoteChar: '"',
  quoteMode: 'needed',
  lineEnding: '\n',
  includeHeader: true,
  columns: [],
};

// Seed realistic data banks
const SAMPLE_FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas',
  'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael', 'Emily', 'Daniel',
  'Elizabeth', 'Matthew', 'Avery', 'Aiden', 'Sofia', 'David', 'Ella', 'Joseph',
  'Madison', 'Carter', 'Scarlett', 'Owen', 'Victoria', 'Wyatt', 'Aria', 'John',
  'Grace', 'Jack', 'Chloe', 'Luke', 'Camila', 'Jayden', 'Penelope', 'Dylan'
];

const SAMPLE_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell'
];

const SAMPLE_DEPARTMENTS = [
  'Engineering', 'Product', 'Marketing', 'Sales', 'Customer Success',
  'Human Resources', 'Finance', 'Legal', 'Operations', 'Design',
  'Security & Compliance', 'Data Science', 'Information Technology'
];

const SAMPLE_JOB_TITLES = [
  'Software Engineer', 'Senior Frontend Developer', 'Staff Backend Architect',
  'Product Manager', 'Director of Marketing', 'Account Executive',
  'Financial Analyst', 'People Operations Partner', 'DevOps Specialist',
  'Data Analyst', 'UX/UI Designer', 'Customer Success Manager',
  'Quality Assurance Engineer', 'Solutions Architect', 'Chief Technology Officer'
];

const SAMPLE_COUNTRIES = [
  { name: 'United States', code: 'US', states: ['CA', 'NY', 'TX', 'WA', 'FL', 'IL', 'MA', 'CO'], cities: ['New York', 'San Francisco', 'Austin', 'Seattle', 'Chicago', 'Los Angeles', 'Denver', 'Miami'] },
  { name: 'United Kingdom', code: 'GB', states: ['England', 'Scotland', 'Wales'], cities: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Bristol', 'Glasgow'] },
  { name: 'Germany', code: 'DE', states: ['Bavaria', 'Berlin', 'Hesse', 'Hamburg'], cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'] },
  { name: 'Canada', code: 'CA', states: ['ON', 'BC', 'QC', 'AB'], cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'] },
  { name: 'Australia', code: 'AU', states: ['NSW', 'VIC', 'QLD', 'WA'], cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
  { name: 'France', code: 'FR', states: ['Île-de-France', 'Auvergne-Rhône-Alpes'], cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux'] },
  { name: 'Japan', code: 'JP', states: ['Tokyo', 'Osaka', 'Kyoto', 'Aichi'], cities: ['Tokyo', 'Osaka', 'Kyoto', 'Nagoya', 'Fukuoka'] },
  { name: 'Singapore', code: 'SG', states: ['Central'], cities: ['Singapore'] },
  { name: 'Netherlands', code: 'NL', states: ['North Holland', 'South Holland'], cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'] },
  { name: 'Switzerland', code: 'CH', states: ['Zurich', 'Geneva', 'Vaud'], cities: ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern'] }
];

const SAMPLE_COMPANIES = [
  'Acme Corporation', 'Nexus Technologies', 'Starlight Data', 'Apex Dynamics',
  'Vanguard Global', 'Quantum Systems', 'Horizon Financial', 'Solstice Health',
  'Cyberdyne Solutions', 'Pinnacle Logistics', 'Nova Labs', 'Silverline Capital',
  'OmniCorp Industries', 'Zenith Media', 'BlueSky Networks', 'Aether Dynamics'
];

const SAMPLE_STREET_NAMES = [
  'Main St', 'Oak Ave', 'Maple Rd', 'Cedar Blvd', 'Pine St', 'Elm St',
  'Washington Ave', 'Broadway', 'Park Ave', 'Market St', 'Chestnut St',
  'Highland Ave', 'Sunset Blvd', 'Lakeview Dr', 'River Rd', 'Spring St'
];

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
  'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat',
  'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse',
  'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat',
  'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id'
];

/**
 * Parses user header input (comma, tab, semicolon, or newline delimited)
 */
export function parseHeadersInput(input: string, delimiter = ','): string[] {
  if (!input || !input.trim()) return [];

  // Check if input is multi-line
  const lines = input.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length > 1) {
    // If lines look like single headers per line
    const singleTokens = lines.map((l) => l.trim().replace(/^['"`]|['"`]$/g, ''));
    if (!singleTokens[0].includes(',') && !singleTokens[0].includes('\t')) {
      return singleTokens.filter(Boolean);
    }
    // Otherwise take first line as header row
    input = lines[0];
  }

  // Split line by delimiter or commas
  const activeDelimiter = input.includes(delimiter)
    ? delimiter
    : input.includes(',')
    ? ','
    : input.includes('\t')
    ? '\t'
    : input.includes(';')
    ? ';'
    : input.includes('|')
    ? '|'
    : ',';

  return input
    .split(activeDelimiter)
    .map((h) => h.trim().replace(/^['"`]|['"`]$/g, ''))
    .filter((h) => h.length > 0);
}

/**
 * Intelligent heuristic rule inference based on header name
 */
export function inferColumnRule(headerName: string, columnIndex: number): CsvColumnRule {
  const norm = headerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const id = `col_${columnIndex + 1}_${Date.now().toString(36)}`;

  // ID / Identifier
  if (norm === 'id' || norm.endsWith('_id') || norm === 'uuid' || norm === 'guid') {
    if (norm === 'uuid' || norm === 'guid' || norm.includes('guid')) {
      return {
        id,
        header: headerName,
        generatorType: 'uuid',
        unique: true,
      };
    }
    return {
      id,
      header: headerName,
      generatorType: 'sequence',
      startNumber: 1,
      stepNumber: 1,
      unique: true,
    };
  }

  // Sequence / Order / Number / Count
  if (norm === 'seq' || norm === 'sequence' || norm === 'rank' || norm === 'row_number' || norm === 'item_no') {
    return {
      id,
      header: headerName,
      generatorType: 'sequence',
      startNumber: 1,
      stepNumber: 1,
      unique: true,
    };
  }

  // Email
  if (norm.includes('email') || norm === 'mail') {
    return {
      id,
      header: headerName,
      generatorType: 'email',
      unique: true,
    };
  }

  // Phone
  if (norm.includes('phone') || norm.includes('mobile') || norm.includes('tel') || norm.includes('fax')) {
    return {
      id,
      header: headerName,
      generatorType: 'phone',
      patternTemplate: '(###) ###-####',
    };
  }

  // Names
  if (norm === 'first_name' || norm === 'fname' || norm === 'given_name') {
    return { id, header: headerName, generatorType: 'first_name' };
  }
  if (norm === 'last_name' || norm === 'lname' || norm === 'surname' || norm === 'family_name') {
    return { id, header: headerName, generatorType: 'last_name' };
  }
  if (norm.includes('name') && !norm.includes('file') && !norm.includes('domain')) {
    return { id, header: headerName, generatorType: 'full_name' };
  }

  // Company / Organization
  if (norm.includes('company') || norm.includes('organization') || norm.includes('vendor') || norm.includes('client')) {
    return { id, header: headerName, generatorType: 'company' };
  }

  // Department / Team
  if (norm.includes('department') || norm.includes('dept') || norm.includes('division')) {
    return { id, header: headerName, generatorType: 'department' };
  }

  // Job Title / Role / Position
  if (norm.includes('title') || norm.includes('job') || norm.includes('role') || norm.includes('position')) {
    return { id, header: headerName, generatorType: 'job_title' };
  }

  // Address components
  if (norm.includes('country') || norm === 'nation') {
    return { id, header: headerName, generatorType: 'country' };
  }
  if (norm.includes('city') || norm === 'town') {
    return { id, header: headerName, generatorType: 'city' };
  }
  if (norm.includes('state') || norm.includes('province') || norm.includes('region')) {
    return { id, header: headerName, generatorType: 'state' };
  }
  if (norm.includes('street') || norm.includes('address')) {
    return { id, header: headerName, generatorType: 'street_address' };
  }
  if (norm.includes('zip') || norm.includes('postal') || norm.includes('postcode')) {
    return { id, header: headerName, generatorType: 'postal_code' };
  }

  // Age / Year / Quantity
  if (norm === 'age') {
    return {
      id,
      header: headerName,
      generatorType: 'integer_range',
      min: 18,
      max: 65,
    };
  }
  if (norm.includes('quantity') || norm.includes('qty') || norm.includes('count') || norm.includes('stock')) {
    return {
      id,
      header: headerName,
      generatorType: 'integer_range',
      min: 1,
      max: 250,
    };
  }

  // Salary / Price / Amount / Cost / Revenue
  if (
    norm.includes('salary') ||
    norm.includes('wage') ||
    norm.includes('compensation')
  ) {
    return {
      id,
      header: headerName,
      generatorType: 'decimal_range',
      min: 50000,
      max: 160000,
      decimals: 2,
    };
  }
  if (
    norm.includes('price') ||
    norm.includes('amount') ||
    norm.includes('cost') ||
    norm.includes('revenue') ||
    norm.includes('fee') ||
    norm.includes('total')
  ) {
    return {
      id,
      header: headerName,
      generatorType: 'decimal_range',
      min: 10,
      max: 500,
      decimals: 2,
    };
  }

  // Percentage / Rate / Ratio / Score
  if (norm.includes('percent') || norm.includes('pct') || norm.includes('rate') || norm.includes('ratio')) {
    return {
      id,
      header: headerName,
      generatorType: 'percentage',
      min: 0,
      max: 100,
      decimals: 1,
    };
  }
  if (norm.includes('score') || norm.includes('rating')) {
    return {
      id,
      header: headerName,
      generatorType: 'integer_range',
      min: 1,
      max: 5,
    };
  }

  // Date / Time / Timestamp
  if (
    norm.includes('date') ||
    norm.includes('created') ||
    norm.includes('updated') ||
    norm.includes('joined') ||
    norm.includes('birth') ||
    norm.includes('hired') ||
    norm.includes('timestamp') ||
    norm === 'dob'
  ) {
    return {
      id,
      header: headerName,
      generatorType: 'date_range',
      startDate: '2023-01-01',
      endDate: '2026-12-31',
      dateFormat: 'YYYY-MM-DD',
    };
  }

  // Status / State / Category
  if (norm === 'status' || norm.endsWith('_status')) {
    return {
      id,
      header: headerName,
      generatorType: 'pick_list',
      pickList: ['Active', 'Pending', 'Inactive', 'Suspended'],
      pickListMode: 'weighted',
      pickListWeights: { Active: 70, Pending: 15, Inactive: 10, Suspended: 5 },
    };
  }
  if (norm === 'priority') {
    return {
      id,
      header: headerName,
      generatorType: 'pick_list',
      pickList: ['Low', 'Medium', 'High', 'Critical'],
      pickListMode: 'random',
    };
  }

  // Boolean flags (is_active, has_license, verified, enabled)
  if (
    norm.startsWith('is_') ||
    norm.startsWith('has_') ||
    norm.startsWith('can_') ||
    norm.includes('active') ||
    norm.includes('enabled') ||
    norm.includes('verified') ||
    norm.includes('flag')
  ) {
    return {
      id,
      header: headerName,
      generatorType: 'boolean',
      booleanFormat: 'true/false',
      trueProbability: 80,
    };
  }

  // IP Address / Network
  if (norm.includes('ip_address') || norm === 'ip' || norm.includes('client_ip')) {
    return { id, header: headerName, generatorType: 'ip_address' };
  }

  // URL / Website
  if (norm.includes('url') || norm.includes('website') || norm.includes('link')) {
    return { id, header: headerName, generatorType: 'url' };
  }

  // SKU / Code / Code pattern
  if (norm.includes('sku') || norm.includes('code') || norm.includes('part_no')) {
    return {
      id,
      header: headerName,
      generatorType: 'pattern',
      patternTemplate: 'SKU-###-???',
      unique: true,
    };
  }

  // Default fallback: descriptive lorem word or text
  return {
    id,
    header: headerName,
    generatorType: 'lorem_words',
    min: 1,
    max: 3,
  };
}

/**
 * Replaces pattern template characters:
 * # -> random digit (0-9)
 * ? -> random uppercase letter (A-Z)
 * * -> random alphanumeric char
 */
export function generatePatternValue(pattern: string): string {
  if (!pattern) return '';
  const digits = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const alphanumeric = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return pattern.replace(/[#?*]/g, (char) => {
    if (char === '#') return digits[Math.floor(Math.random() * digits.length)];
    if (char === '?') return letters[Math.floor(Math.random() * letters.length)];
    return alphanumeric[Math.floor(Math.random() * alphanumeric.length)];
  });
}

/**
 * Formats a Date object according to desired format
 */
export function formatCsvDate(
  date: Date,
  format: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD HH:mm:ss' | 'timestamp'
): string {
  if (format === 'timestamp') {
    return String(Math.floor(date.getTime() / 1000));
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'YYYY-MM-DD HH:mm:ss':
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    case 'YYYY-MM-DD':
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

/**
 * Generates a single cell value for a column rule
 */
export function generateColumnValue(
  rule: CsvColumnRule,
  rowIndex: number,
  totalRows: number,
  existingValues: Set<any>,
  currentRow?: Record<string, any>
): any {
  // Check nullable condition
  if (rule.nullable) {
    const prob = rule.nullProbability !== undefined ? rule.nullProbability : 10;
    if (Math.random() * 100 < prob) {
      return rule.nullValueRepresentation !== undefined ? rule.nullValueRepresentation : '';
    }
  }

  let value: any = '';

  const attemptGeneration = (): any => {
    switch (rule.generatorType) {
      case 'sequence': {
        const start = rule.startNumber !== undefined ? rule.startNumber : 1;
        const step = rule.stepNumber !== undefined ? rule.stepNumber : 1;
        return start + rowIndex * step;
      }

      case 'uuid': {
        // Standard random UUID v4
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }

      case 'first_name': {
        return SAMPLE_FIRST_NAMES[Math.floor(Math.random() * SAMPLE_FIRST_NAMES.length)];
      }

      case 'last_name': {
        return SAMPLE_LAST_NAMES[Math.floor(Math.random() * SAMPLE_LAST_NAMES.length)];
      }

      case 'full_name': {
        const f = SAMPLE_FIRST_NAMES[Math.floor(Math.random() * SAMPLE_FIRST_NAMES.length)];
        const l = SAMPLE_LAST_NAMES[Math.floor(Math.random() * SAMPLE_LAST_NAMES.length)];
        return `${f} ${l}`;
      }

      case 'email': {
        const domain = rule.emailDomain || 'example.com';
        const fn = SAMPLE_FIRST_NAMES[Math.floor(Math.random() * SAMPLE_FIRST_NAMES.length)].toLowerCase();
        const ln = SAMPLE_LAST_NAMES[Math.floor(Math.random() * SAMPLE_LAST_NAMES.length)].toLowerCase();
        const idSuffix = rule.unique ? (rowIndex + 1) : Math.floor(Math.random() * 900 + 100);
        return `${fn}.${ln}${idSuffix}@${domain}`;
      }

      case 'phone': {
        const template = rule.patternTemplate || '(###) ###-####';
        return generatePatternValue(template);
      }

      case 'country': {
        const c = SAMPLE_COUNTRIES[Math.floor(Math.random() * SAMPLE_COUNTRIES.length)];
        return c.name;
      }

      case 'city': {
        const c = SAMPLE_COUNTRIES[Math.floor(Math.random() * SAMPLE_COUNTRIES.length)];
        return c.cities[Math.floor(Math.random() * c.cities.length)];
      }

      case 'state': {
        const c = SAMPLE_COUNTRIES[Math.floor(Math.random() * SAMPLE_COUNTRIES.length)];
        return c.states[Math.floor(Math.random() * c.states.length)];
      }

      case 'street_address': {
        const num = Math.floor(Math.random() * 9800) + 100;
        const street = SAMPLE_STREET_NAMES[Math.floor(Math.random() * SAMPLE_STREET_NAMES.length)];
        return `${num} ${street}`;
      }

      case 'postal_code': {
        return String(Math.floor(Math.random() * 89999) + 10000);
      }

      case 'company': {
        return SAMPLE_COMPANIES[Math.floor(Math.random() * SAMPLE_COMPANIES.length)];
      }

      case 'job_title': {
        return SAMPLE_JOB_TITLES[Math.floor(Math.random() * SAMPLE_JOB_TITLES.length)];
      }

      case 'department': {
        return SAMPLE_DEPARTMENTS[Math.floor(Math.random() * SAMPLE_DEPARTMENTS.length)];
      }

      case 'integer_range': {
        const min = rule.min !== undefined ? rule.min : 1;
        const max = rule.max !== undefined ? rule.max : 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      case 'decimal_range': {
        const min = rule.min !== undefined ? rule.min : 10;
        const max = rule.max !== undefined ? rule.max : 500;
        const decimals = rule.decimals !== undefined ? rule.decimals : 2;
        const rand = Math.random() * (max - min) + min;
        return parseFloat(rand.toFixed(decimals));
      }

      case 'percentage': {
        const min = rule.min !== undefined ? rule.min : 0;
        const max = rule.max !== undefined ? rule.max : 100;
        const decimals = rule.decimals !== undefined ? rule.decimals : 1;
        const rand = Math.random() * (max - min) + min;
        return `${rand.toFixed(decimals)}%`;
      }

      case 'currency': {
        const symbol = rule.currencySymbol || '$';
        const min = rule.min !== undefined ? rule.min : 10;
        const max = rule.max !== undefined ? rule.max : 1000;
        const decimals = rule.decimals !== undefined ? rule.decimals : 2;
        const rand = Math.random() * (max - min) + min;
        return `${symbol}${rand.toFixed(decimals)}`;
      }

      case 'date_range': {
        const start = rule.startDate ? new Date(rule.startDate).getTime() : new Date('2024-01-01').getTime();
        const end = rule.endDate ? new Date(rule.endDate).getTime() : new Date('2026-12-31').getTime();
        const randTime = Math.random() * (end - start) + start;
        return formatCsvDate(new Date(randTime), rule.dateFormat || 'YYYY-MM-DD');
      }

      case 'relative_date': {
        const now = new Date();
        const amount = rule.relativeAmount || 30;
        const unit = rule.relativeUnit || 'days';
        const isPast = rule.relativeDirection !== 'future';
        const multiplier = isPast ? -1 : 1;

        const targetDate = new Date(now);
        if (unit === 'years') {
          targetDate.setFullYear(targetDate.getFullYear() + multiplier * Math.floor(Math.random() * amount));
        } else if (unit === 'months') {
          targetDate.setMonth(targetDate.getMonth() + multiplier * Math.floor(Math.random() * amount));
        } else {
          targetDate.setDate(targetDate.getDate() + multiplier * Math.floor(Math.random() * amount));
        }
        return formatCsvDate(targetDate, rule.dateFormat || 'YYYY-MM-DD');
      }

      case 'pick_list': {
        const list = rule.pickList && rule.pickList.length > 0 ? rule.pickList : ['Option A', 'Option B', 'Option C'];
        if (rule.pickListMode === 'sequential') {
          return list[rowIndex % list.length];
        }
        if (rule.pickListMode === 'weighted' && rule.pickListWeights) {
          const entries = Object.entries(rule.pickListWeights);
          const totalWeight = entries.reduce((sum, [, w]) => sum + (Number(w) || 0), 0);
          if (totalWeight > 0) {
            let threshold = Math.random() * totalWeight;
            for (const [item, weight] of entries) {
              threshold -= Number(weight);
              if (threshold <= 0) return item;
            }
          }
        }
        return list[Math.floor(Math.random() * list.length)];
      }

      case 'boolean': {
        const prob = rule.trueProbability !== undefined ? rule.trueProbability : 50;
        const isTrue = Math.random() * 100 < prob;
        const fmt = rule.booleanFormat || 'true/false';
        switch (fmt) {
          case 'TRUE/FALSE':
            return isTrue ? 'TRUE' : 'FALSE';
          case '1/0':
            return isTrue ? '1' : '0';
          case 'yes/no':
            return isTrue ? 'yes' : 'no';
          case 'Y/N':
            return isTrue ? 'Y' : 'N';
          case 'true/false':
          default:
            return isTrue ? 'true' : 'false';
        }
      }

      case 'pattern': {
        const template = rule.patternTemplate || 'SKU-###-???';
        return generatePatternValue(template);
      }

      case 'formula': {
        if (rule.formulaExpr && currentRow) {
          try {
            // Safely evaluate formula with row context
            const fn = new Function('row', 'index', `"use strict"; return (${rule.formulaExpr});`);
            return fn(currentRow, rowIndex);
          } catch {
            return `FORMULA_ERR`;
          }
        }
        return `VAL_${rowIndex + 1}`;
      }

      case 'fixed': {
        return rule.fixedText !== undefined ? rule.fixedText : 'CONSTANT';
      }

      case 'lorem_words': {
        const count = rule.min || 2;
        const words: string[] = [];
        for (let i = 0; i < count; i++) {
          words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
        }
        return words.join(' ');
      }

      case 'ip_address': {
        return `${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
      }

      case 'url': {
        const company = SAMPLE_COMPANIES[Math.floor(Math.random() * SAMPLE_COMPANIES.length)]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        return `https://${company}.io/resources/item-${rowIndex + 1}`;
      }

      case 'status_code': {
        const codes = [200, 201, 204, 301, 400, 401, 403, 404, 500, 502];
        return codes[Math.floor(Math.random() * codes.length)];
      }

      default:
        return `Value_${rowIndex + 1}`;
    }
  };

  // Enforce uniqueness constraint if requested
  if (rule.unique) {
    let attempts = 0;
    do {
      value = attemptGeneration();
      attempts++;
      if (attempts > 150) {
        // Append sequence number to break collision
        value = `${value}_${rowIndex + 1}`;
        break;
      }
    } while (existingValues.has(value));
    existingValues.add(value);
  } else {
    value = attemptGeneration();
  }

  // Text transformations
  if (typeof value === 'string') {
    if (rule.transformCase === 'uppercase') value = value.toUpperCase();
    else if (rule.transformCase === 'lowercase') value = value.toLowerCase();
    else if (rule.transformCase === 'titlecase') {
      value = value.replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (rule.transformCase === 'camelcase') {
      value = value
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[A-Z]/, (c) => c.toLowerCase());
    }
  }

  // Prefix & Suffix
  if (rule.prefix) {
    value = `${rule.prefix}${value}`;
  }
  if (rule.suffix) {
    value = `${value}${rule.suffix}`;
  }

  return value;
}

/**
 * Quotes a single CSV field value according to selected delimiter and quote mode
 */
export function quoteCsvField(
  val: any,
  delimiter: string,
  quoteChar: string,
  quoteMode: 'needed' | 'always' | 'never'
): string {
  if (val === null || val === undefined) {
    return '';
  }

  const str = String(val);

  if (quoteMode === 'never' || !quoteChar) {
    return str;
  }

  const needsQuote =
    quoteMode === 'always' ||
    str.includes(delimiter) ||
    str.includes('\n') ||
    str.includes('\r') ||
    str.includes(quoteChar);

  if (!needsQuote) {
    return str;
  }

  const escaped = str.replace(new RegExp(quoteChar, 'g'), `${quoteChar}${quoteChar}`);
  return `${quoteChar}${escaped}${quoteChar}`;
}

/**
 * Main CSV generation function
 */
export function generateCsvDataset(options: CsvPopulatorOptions): {
  csv: string;
  rows: Record<string, any>[];
  columnStats: Record<string, { uniqueCount: number; nullCount: number; sampleValues: string[] }>;
} {
  const opts: CsvPopulatorOptions = {
    ...DEFAULT_CSV_OPTIONS,
    ...options,
  };

  const columns = opts.columns || [];
  if (columns.length === 0) {
    return {
      csv: '',
      rows: [],
      columnStats: {},
    };
  }

  const totalRows = Math.max(1, Math.min(opts.rowCount || 25, 20000));
  const delimiter = opts.delimiter || ',';
  const quoteChar = opts.quoteChar !== undefined ? opts.quoteChar : '"';
  const quoteMode = opts.quoteMode || 'needed';
  const lineEnding = opts.lineEnding || '\n';

  // Track unique sets per column for uniqueness constraint
  const columnUniqueSets: Map<string, Set<any>> = new Map();
  columns.forEach((c) => columnUniqueSets.set(c.id, new Set()));

  const generatedRows: Record<string, any>[] = [];

  for (let r = 0; r < totalRows; r++) {
    // Check if user manually edited this cell in Resultant Data Grid
    const customRow = opts.customGridRows && opts.customGridRows[r] ? opts.customGridRows[r] : null;

    const rowObj: Record<string, any> = {};

    for (const col of columns) {
      if (customRow && customRow[col.header] !== undefined) {
        rowObj[col.header] = customRow[col.header];
        continue;
      }

      const uniqueSet = columnUniqueSets.get(col.id)!;
      const cellVal = generateColumnValue(col, r, totalRows, uniqueSet, rowObj);
      rowObj[col.header] = cellVal;
    }

    generatedRows.push(rowObj);
  }

  // Format into CSV lines
  const csvLines: string[] = [];

  if (opts.includeHeader) {
    const headerRow = columns
      .map((c) => quoteCsvField(c.header, delimiter, quoteChar, quoteMode))
      .join(delimiter);
    csvLines.push(headerRow);
  }

  generatedRows.forEach((row) => {
    const rowLine = columns
      .map((col) => quoteCsvField(row[col.header], delimiter, quoteChar, quoteMode))
      .join(delimiter);
    csvLines.push(rowLine);
  });

  const finalCsv = csvLines.join(lineEnding);

  // Compute column statistics
  const columnStats: Record<string, { uniqueCount: number; nullCount: number; sampleValues: string[] }> = {};
  columns.forEach((col) => {
    const values = generatedRows.map((r) => r[col.header]);
    const uniqueValues = new Set(values);
    const nullValues = values.filter((v) => v === '' || v === null || v === undefined || v === 'NULL' || v === 'N/A');
    const samples = Array.from(uniqueValues).slice(0, 5).map(String);

    columnStats[col.header] = {
      uniqueCount: uniqueValues.size,
      nullCount: nullValues.length,
      sampleValues: samples,
    };
  });

  return {
    csv: finalCsv,
    rows: generatedRows,
    columnStats,
  };
}

/**
 * Extracts headers and attempts automatic column rule inference from existing CSV text
 */
export function extractHeadersAndInferRulesFromCsv(csvText: string): {
  headers: string[];
  rules: CsvColumnRule[];
  detectedRowCount: number;
} {
  const trimmed = csvText.trim();
  if (!trimmed) {
    return { headers: [], rules: [], detectedRowCount: 0 };
  }

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rules: [], detectedRowCount: 0 };
  }

  // Detect delimiter
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';')) delimiter = ';';
  else if (firstLine.includes('|')) delimiter = '|';

  const headers = parseHeadersInput(firstLine, delimiter);
  const sampleDataRows = lines.slice(1);

  const rules = headers.map((h, idx) => {
    const inferred = inferColumnRule(h, idx);

    // If sample rows exist, inspect sample values to refine rule
    if (sampleDataRows.length > 0) {
      const sampleVals = sampleDataRows
        .slice(0, 20)
        .map((l) => {
          const parts = l.split(delimiter);
          return parts[idx] !== undefined ? parts[idx].trim().replace(/^["']|["']$/g, '') : '';
        })
        .filter(Boolean);

      // Check if all samples are integers
      if (sampleVals.length >= 3 && sampleVals.every((v) => /^-?\d+$/.test(v))) {
        const nums = sampleVals.map(Number);
        inferred.generatorType = 'integer_range';
        inferred.min = Math.min(...nums);
        inferred.max = Math.max(...nums);
      }
      // Check if all samples are dates
      else if (sampleVals.length >= 3 && sampleVals.every((v) => !isNaN(Date.parse(v)) && (v.includes('-') || v.includes('/')))) {
        inferred.generatorType = 'date_range';
        inferred.dateFormat = sampleVals[0].includes('/') ? 'MM/DD/YYYY' : 'YYYY-MM-DD';
      }
    }

    return inferred;
  });

  return {
    headers,
    rules,
    detectedRowCount: sampleDataRows.length,
  };
}

/**
 * Converts generated CSV rows to SQL INSERT statements
 */
export function csvToSqlInsert(
  tableName: string,
  rows: Record<string, any>[],
  headers: string[]
): string {
  if (rows.length === 0 || headers.length === 0) return '-- No rows to export';

  const safeTableName = tableName.trim().replace(/[^a-zA-Z0-9_]/g, '_') || 'generated_records';
  const columnsList = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(', ');

  const valueStatements = rows.map((row) => {
    const vals = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined || val === 'NULL') {
        return 'NULL';
      }
      if (typeof val === 'number') {
        return String(val);
      }
      if (typeof val === 'boolean') {
        return val ? 'TRUE' : 'FALSE';
      }
      const escaped = String(val).replace(/'/g, "''");
      return `'${escaped}'`;
    });
    return `  (${vals.join(', ')})`;
  });

  return `-- PostgreSQL / MySQL / SQLite INSERT Statements\nINSERT INTO "${safeTableName}" (${columnsList})\nVALUES\n${valueStatements.join(',\n')};`;
}

/**
 * Exports CSV Populator configuration to JSON string
 */
export function exportCsvPopulatorConfig(options: CsvPopulatorOptions): string {
  const exportPayload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    tool: 'csv-auto-populator',
    options: {
      rowCount: options.rowCount,
      delimiter: options.delimiter,
      quoteChar: options.quoteChar,
      quoteMode: options.quoteMode,
      lineEnding: options.lineEnding,
      includeHeader: options.includeHeader,
      columns: options.columns,
    },
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Validates and parses imported CSV Populator configuration JSON
 */
export function validateAndParseCsvPopulatorConfig(jsonStr: string): {
  config: CsvPopulatorOptions | null;
  error: string | null;
} {
  try {
    const parsed = JSON.parse(jsonStr);
    const opts = parsed.options || parsed;

    if (!Array.isArray(opts.columns)) {
      return { config: null, error: 'Configuration must contain a valid "columns" array' };
    }

    const sanitizedColumns: CsvColumnRule[] = opts.columns.map((c: any, idx: number) => ({
      id: c.id || `col_${idx + 1}_${Date.now().toString(36)}`,
      header: String(c.header || `Column_${idx + 1}`),
      generatorType: c.generatorType || 'lorem_words',
      unique: Boolean(c.unique),
      nullable: Boolean(c.nullable),
      nullProbability: typeof c.nullProbability === 'number' ? c.nullProbability : 10,
      nullValueRepresentation: c.nullValueRepresentation || '',
      prefix: c.prefix || '',
      suffix: c.suffix || '',
      transformCase: c.transformCase || 'none',
      startNumber: c.startNumber,
      stepNumber: c.stepNumber,
      min: c.min,
      max: c.max,
      decimals: c.decimals,
      currencySymbol: c.currencySymbol,
      startDate: c.startDate,
      endDate: c.endDate,
      dateFormat: c.dateFormat,
      pickList: Array.isArray(c.pickList) ? c.pickList : undefined,
      pickListMode: c.pickListMode,
      pickListWeights: c.pickListWeights,
      booleanFormat: c.booleanFormat,
      trueProbability: c.trueProbability,
      patternTemplate: c.patternTemplate,
      formulaExpr: c.formulaExpr,
      fixedText: c.fixedText,
      emailDomain: c.emailDomain,
    }));

    const config: CsvPopulatorOptions = {
      rowCount: typeof opts.rowCount === 'number' ? opts.rowCount : 25,
      delimiter: opts.delimiter || ',',
      quoteChar: opts.quoteChar !== undefined ? opts.quoteChar : '"',
      quoteMode: opts.quoteMode || 'needed',
      lineEnding: opts.lineEnding || '\n',
      includeHeader: opts.includeHeader !== undefined ? Boolean(opts.includeHeader) : true,
      columns: sanitizedColumns,
    };

    return { config, error: null };
  } catch (err: any) {
    return { config: null, error: `Invalid JSON format: ${err?.message || 'Parse error'}` };
  }
}

/**
 * Built-in domain presets for rapid testing and demonstrations
 */
export const CSV_POPULATOR_PRESETS = [
  {
    id: 'employee-directory',
    name: 'Corporate Employee Directory',
    description: 'Staff records with employee codes, emails, departments, titles, salaries, and hire dates',
    headers: 'emp_id,emp_code,first_name,last_name,email,department,job_title,salary,hire_date,is_remote,status',
    options: {
      rowCount: 30,
      delimiter: ',' as const,
      quoteChar: '"' as const,
      quoteMode: 'needed' as const,
      lineEnding: '\n' as const,
      includeHeader: true,
      columns: [
        { id: 'c1', header: 'emp_id', generatorType: 'sequence' as const, startNumber: 1001, stepNumber: 1, unique: true },
        { id: 'c2', header: 'emp_code', generatorType: 'pattern' as const, patternTemplate: 'EMP-###', unique: true },
        { id: 'c3', header: 'first_name', generatorType: 'first_name' as const },
        { id: 'c4', header: 'last_name', generatorType: 'last_name' as const },
        { id: 'c5', header: 'email', generatorType: 'email' as const, emailDomain: 'techcorp.io', unique: true },
        { id: 'c6', header: 'department', generatorType: 'department' as const },
        { id: 'c7', header: 'job_title', generatorType: 'job_title' as const },
        { id: 'c8', header: 'salary', generatorType: 'decimal_range' as const, min: 65000, max: 155000, decimals: 2 },
        { id: 'c9', header: 'hire_date', generatorType: 'date_range' as const, startDate: '2021-01-01', endDate: '2026-06-30' },
        { id: 'c10', header: 'is_remote', generatorType: 'boolean' as const, booleanFormat: 'true/false' as const, trueProbability: 60 },
        { id: 'c11', header: 'status', generatorType: 'pick_list' as const, pickList: ['Active', 'Onboarding', 'Leave', 'Contractor'], pickListMode: 'weighted' as const, pickListWeights: { Active: 80, Onboarding: 10, Leave: 5, Contractor: 5 } },
      ],
    },
  },
  {
    id: 'ecommerce-catalog',
    name: 'E-Commerce Product Catalog',
    description: 'Product SKUs, inventory counts, retail prices, categories, and availability',
    headers: 'sku,product_title,category,cost_price,retail_price,stock_qty,reorder_point,is_active,vendor_code',
    options: {
      rowCount: 40,
      delimiter: ',' as const,
      quoteChar: '"' as const,
      quoteMode: 'needed' as const,
      lineEnding: '\n' as const,
      includeHeader: true,
      columns: [
        { id: 'p1', header: 'sku', generatorType: 'pattern' as const, patternTemplate: 'PROD-###-???', unique: true },
        { id: 'p2', header: 'product_title', generatorType: 'lorem_words' as const, min: 2, max: 4, transformCase: 'titlecase' as const },
        { id: 'p3', header: 'category', generatorType: 'pick_list' as const, pickList: ['Electronics', 'Home & Kitchen', 'Footwear', 'Apparel', 'Sports', 'Beauty'], pickListMode: 'random' as const },
        { id: 'p4', header: 'cost_price', generatorType: 'decimal_range' as const, min: 8.5, max: 120.0, decimals: 2 },
        { id: 'p5', header: 'retail_price', generatorType: 'decimal_range' as const, min: 19.99, max: 249.99, decimals: 2 },
        { id: 'p6', header: 'stock_qty', generatorType: 'integer_range' as const, min: 0, max: 450 },
        { id: 'p7', header: 'reorder_point', generatorType: 'integer_range' as const, min: 15, max: 50 },
        { id: 'p8', header: 'is_active', generatorType: 'boolean' as const, booleanFormat: 'TRUE/FALSE' as const, trueProbability: 85 },
        { id: 'p9', header: 'vendor_code', generatorType: 'pattern' as const, patternTemplate: 'VEND-??##' },
      ],
    },
  },
  {
    id: 'customer-orders',
    name: 'Customer Orders & Transactions',
    description: 'Transaction IDs, customer names, emails, billing countries, total amounts, and payment methods',
    headers: 'order_id,transaction_uuid,customer_name,email,billing_country,order_total,currency,payment_method,order_status,created_at',
    options: {
      rowCount: 25,
      delimiter: ',' as const,
      quoteChar: '"' as const,
      quoteMode: 'needed' as const,
      lineEnding: '\n' as const,
      includeHeader: true,
      columns: [
        { id: 'o1', header: 'order_id', generatorType: 'sequence' as const, startNumber: 50001, stepNumber: 1, prefix: 'ORD-', unique: true },
        { id: 'o2', header: 'transaction_uuid', generatorType: 'uuid' as const, unique: true },
        { id: 'o3', header: 'customer_name', generatorType: 'full_name' as const },
        { id: 'o4', header: 'email', generatorType: 'email' as const, unique: true },
        { id: 'o5', header: 'billing_country', generatorType: 'country' as const },
        { id: 'o6', header: 'order_total', generatorType: 'decimal_range' as const, min: 14.5, max: 890.0, decimals: 2 },
        { id: 'o7', header: 'currency', generatorType: 'fixed' as const, fixedText: 'USD' },
        { id: 'o8', header: 'payment_method', generatorType: 'pick_list' as const, pickList: ['Credit Card', 'Apple Pay', 'PayPal', 'Wire Transfer'], pickListMode: 'weighted' as const, pickListWeights: { 'Credit Card': 65, 'Apple Pay': 20, PayPal: 10, 'Wire Transfer': 5 } },
        { id: 'o9', header: 'order_status', generatorType: 'pick_list' as const, pickList: ['Completed', 'Processing', 'Shipped', 'Refunded'], pickListMode: 'weighted' as const, pickListWeights: { Completed: 75, Processing: 15, Shipped: 8, Refunded: 2 } },
        { id: 'o10', header: 'created_at', generatorType: 'date_range' as const, startDate: '2026-01-01', endDate: '2026-09-30', dateFormat: 'YYYY-MM-DD HH:mm:ss' as const },
      ],
    },
  },
  {
    id: 'iot-telemetry',
    name: 'IoT Sensor Telemetry',
    description: 'Device serials, IP addresses, battery levels, temperatures, and status codes',
    headers: 'device_id,ip_address,battery_pct,temperature_c,humidity_pct,firmware_version,status_code,timestamp',
    options: {
      rowCount: 50,
      delimiter: ',' as const,
      quoteChar: '"' as const,
      quoteMode: 'needed' as const,
      lineEnding: '\n' as const,
      includeHeader: true,
      columns: [
        { id: 'i1', header: 'device_id', generatorType: 'pattern' as const, patternTemplate: 'IOT-NODE-???-###', unique: true },
        { id: 'i2', header: 'ip_address', generatorType: 'ip_address' as const },
        { id: 'i3', header: 'battery_pct', generatorType: 'integer_range' as const, min: 15, max: 100 },
        { id: 'i4', header: 'temperature_c', generatorType: 'decimal_range' as const, min: 18.0, max: 42.5, decimals: 1 },
        { id: 'i5', header: 'humidity_pct', generatorType: 'decimal_range' as const, min: 30.0, max: 85.0, decimals: 1 },
        { id: 'i6', header: 'firmware_version', generatorType: 'pick_list' as const, pickList: ['v2.4.1', 'v2.4.2', 'v2.5.0-rc1'], pickListMode: 'random' as const },
        { id: 'i7', header: 'status_code', generatorType: 'status_code' as const },
        { id: 'i8', header: 'timestamp', generatorType: 'date_range' as const, startDate: '2026-09-01', endDate: '2026-09-30', dateFormat: 'timestamp' as const },
      ],
    },
  },
];
