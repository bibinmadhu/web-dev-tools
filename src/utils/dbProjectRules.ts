/**
 * Database Project Rules Engine
 * High-level project settings defining shared column rules, allowed values pools,
 * and column-to-rule alias mappings (e.g. mapping product_name to product) across tables.
 */

import { InsertColumnConfig, PostgresInsertType, ValueGenerationMode } from './dbInsertQueryGenerator';

export interface DbProjectRule {
  id: string;
  name: string; // e.g. "product"
  description?: string;
  values: string[]; // e.g. ["Widget Pro", "Gizmo Ultra", "Gadget Max", "Module X"]
  aliases: string[]; // e.g. ["product_name", "item_name", "prod_title"]
  defaultValueMode?: ValueGenerationMode;
  defaultType?: PostgresInsertType;
  maxLength?: number;
  tags?: string[];
}

export interface DbProjectRulesConfig {
  schemaVersion: number;
  appName?: string;
  tool?: string;
  projectName?: string;
  exportedAt?: string;
  rules: DbProjectRule[];
  mappings?: Record<string, string>; // e.g. { "product_name": "product", "billing_country": "country" }
  generalDescriptiveTextTemplate?: string;
}

export const STORAGE_KEY_PROJECT_RULES = 'devhub_db_project_rules';
export const STORAGE_KEY_PROJECT_MAPPINGS = 'devhub_db_project_mappings';
export const STORAGE_KEY_PROJECT_GENERAL_TEXT = 'devhub_db_project_general_text';

/**
 * Built-in default Project Rules library for out-of-the-box enterprise usage
 */
export const DEFAULT_PROJECT_RULES: DbProjectRule[] = [
  {
    id: 'rule_product',
    name: 'product',
    description: 'Catalog products & commercial line items',
    values: ['Widget Pro', 'Gizmo Ultra', 'Gadget Max', 'Module X', 'Apex Sensor', 'Quantum Core'],
    aliases: ['product_name', 'item_name', 'prod_title', 'item_title', 'product_sku_name'],
    defaultValueMode: 'pool',
    defaultType: 'varchar',
    maxLength: 100,
    tags: ['Inventory', 'Sales'],
  },
  {
    id: 'rule_category',
    name: 'category',
    description: 'Corporate business tiers and market segments',
    values: ['Micro SME', 'SME', 'Small Midcap', 'Large Enterprise', 'Public Sector'],
    aliases: ['current_category', 'prod_category', 'item_category', 'business_tier', 'segment'],
    defaultValueMode: 'pool',
    defaultType: 'varchar',
    maxLength: 50,
    tags: ['Business', 'Classification'],
  },
  {
    id: 'rule_status',
    name: 'status',
    description: 'Universal workflow lifecycle states',
    values: ['ACTIVE', 'PENDING', 'SUSPENDED', 'ARCHIVED', 'COMPLETED'],
    aliases: ['account_status', 'order_status', 'user_status', 'state', 'approval_status'],
    defaultValueMode: 'pool',
    defaultType: 'varchar',
    maxLength: 30,
    tags: ['Lifecycle', 'Core'],
  },
  {
    id: 'rule_country',
    name: 'country',
    description: 'Global countries for billing and compliance',
    values: ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Japan', 'Singapore', 'France'],
    aliases: ['billing_country', 'shipping_country', 'origin_country', 'nation', 'country_name'],
    defaultValueMode: 'pool',
    defaultType: 'varchar',
    maxLength: 80,
    tags: ['Geography', 'Location'],
  },
  {
    id: 'rule_currency',
    name: 'currency',
    description: 'ISO-4217 standard currency codes',
    values: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SGD'],
    aliases: ['curr', 'currency_code', 'billing_currency', 'settlement_currency'],
    defaultValueMode: 'pool',
    defaultType: 'varchar',
    maxLength: 3,
    tags: ['Finance', 'Trading'],
  },
  {
    id: 'rule_user_role',
    name: 'user_role',
    description: 'RBAC identity access security roles',
    values: ['ADMIN', 'MANAGER', 'OPERATOR', 'AUDITOR', 'DEVELOPER', 'VIEWER'],
    aliases: ['role', 'user_type', 'access_level', 'permission_group', 'security_role'],
    defaultValueMode: 'pool',
    defaultType: 'varchar',
    maxLength: 40,
    tags: ['Security', 'Auth'],
  },
  {
    id: 'rule_payment_method',
    name: 'payment_method',
    description: 'Supported transaction settlement gateways',
    values: ['CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'APPLE_PAY', 'WIRE_TRANSFER'],
    aliases: ['payment_type', 'pay_method', 'billing_method', 'settlement_type'],
    defaultValueMode: 'pool',
    defaultType: 'varchar',
    maxLength: 50,
    tags: ['Finance', 'Billing'],
  },
];

export const DEFAULT_COLUMN_MAPPINGS: Record<string, string> = {
  product_name: 'product',
  item_name: 'product',
  prod_title: 'product',
  billing_country: 'country',
  shipping_country: 'country',
  account_status: 'status',
  order_status: 'status',
  currency_code: 'currency',
  user_type: 'user_role',
  current_category: 'category',
};

/**
 * Normalizes an identifier string (lowercase, strips non-alphanumeric chars)
 */
export function normalizeRuleIdentifier(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '');
}

/**
 * Finds matching project rule for a given column name:
 * 1. Checks custom mapping table (e.g. "product_name" -> "product")
 * 2. Checks direct rule name match (e.g. "product")
 * 3. Checks rule aliases (e.g. "product_name" inside rule.aliases)
 */
export function findMatchingProjectRule(
  columnName: string,
  rules: DbProjectRule[],
  customMappings: Record<string, string> = {}
): DbProjectRule | null {
  if (!columnName || !columnName.trim()) return null;
  const colNorm = normalizeRuleIdentifier(columnName);

  // 1. Check customMappings
  if (customMappings[columnName]) {
    const mappedTarget = customMappings[columnName];
    const found = rules.find((r) => r.name.toLowerCase() === mappedTarget.toLowerCase());
    if (found) return found;
  }
  if (customMappings[colNorm]) {
    const mappedTarget = customMappings[colNorm];
    const found = rules.find((r) => r.name.toLowerCase() === mappedTarget.toLowerCase());
    if (found) return found;
  }

  // 2. Direct rule name match
  const directMatch = rules.find((r) => normalizeRuleIdentifier(r.name) === colNorm);
  if (directMatch) return directMatch;

  // 3. Check rule aliases
  for (const rule of rules) {
    if (rule.aliases && Array.isArray(rule.aliases)) {
      for (const alias of rule.aliases) {
        if (normalizeRuleIdentifier(alias) === colNorm) {
          return rule;
        }
      }
    }
  }

  return null;
}

/**
 * Applies project rules to a list of columns
 */
export function applyProjectRulesToColumns(
  columns: InsertColumnConfig[],
  rules: DbProjectRule[],
  customMappings: Record<string, string> = {},
  overwritePool = true
): { updatedColumns: InsertColumnConfig[]; matchedCount: number } {
  let matchedCount = 0;

  const updatedColumns = columns.map((col) => {
    // Check if column already explicitly linked to a rule
    let targetRule: DbProjectRule | null = null;
    if (col.linkedProjectRule) {
      targetRule = rules.find((r) => r.name.toLowerCase() === col.linkedProjectRule?.toLowerCase()) || null;
    }

    // Otherwise find by name / alias / mapping
    if (!targetRule) {
      targetRule = findMatchingProjectRule(col.name, rules, customMappings);
    }

    if (targetRule) {
      matchedCount++;
      return {
        ...col,
        linkedProjectRule: targetRule.name,
        valueMode: col.valueMode === 'fixed' || col.valueMode === 'generator' ? 'pool' : col.valueMode,
        valuePool: overwritePool || col.valuePool.length === 0 ? [...targetRule.values] : col.valuePool,
        maxLength: col.maxLength || targetRule.maxLength,
      };
    }

    return col;
  });

  return { updatedColumns, matchedCount };
}

/**
 * Serializes Project Rules & Mappings to JSON
 */
export function exportProjectRulesJson(
  rules: DbProjectRule[],
  mappings: Record<string, string> = {},
  projectName = 'Default Database Project',
  generalDescriptiveTextTemplate?: string
): string {
  const payload: DbProjectRulesConfig = {
    schemaVersion: 1,
    appName: 'DevHub',
    tool: 'db-insert-query-generator',
    projectName,
    exportedAt: new Date().toISOString(),
    rules,
    mappings,
    generalDescriptiveTextTemplate: generalDescriptiveTextTemplate || undefined,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Validates and restores Project Rules from JSON string
 */
export function validateAndParseProjectRulesJson(jsonString: string): {
  success: boolean;
  rules?: DbProjectRule[];
  mappings?: Record<string, string>;
  projectName?: string;
  generalDescriptiveTextTemplate?: string;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    const rulesArray = Array.isArray(parsed.rules)
      ? parsed.rules
      : Array.isArray(parsed)
      ? parsed
      : null;

    if (!rulesArray || rulesArray.length === 0) {
      return {
        success: false,
        error: 'Invalid Project Rules JSON: Expected a non-empty "rules" array.',
      };
    }

    const sanitizedRules: DbProjectRule[] = rulesArray.map((r: any, idx: number) => {
      const rawValues = Array.isArray(r.values) ? r.values : Array.isArray(r.valuePool) ? r.valuePool : [];
      const sanitizedValues = rawValues.map(String).map((v: string) => v.trim()).filter(Boolean);

      const rawAliases = Array.isArray(r.aliases) ? r.aliases : [];
      const sanitizedAliases = rawAliases.map(String).map((a: string) => a.trim()).filter(Boolean);

      return {
        id: r.id || `rule_${idx + 1}_${Date.now().toString(36)}`,
        name: String(r.name || `rule_${idx + 1}`).trim(),
        description: r.description ? String(r.description).trim() : undefined,
        values: sanitizedValues.length > 0 ? sanitizedValues : ['Default Value'],
        aliases: sanitizedAliases,
        defaultValueMode: r.defaultValueMode || 'pool',
        defaultType: r.defaultType,
        maxLength: typeof r.maxLength === 'number' ? r.maxLength : undefined,
        tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
      };
    });

    const sanitizedMappings: Record<string, string> = {};
    if (parsed.mappings && typeof parsed.mappings === 'object') {
      Object.entries(parsed.mappings).forEach(([colKey, targetRule]) => {
        if (typeof colKey === 'string' && typeof targetRule === 'string') {
          sanitizedMappings[colKey.trim()] = targetRule.trim();
        }
      });
    }

    return {
      success: true,
      rules: sanitizedRules,
      mappings: sanitizedMappings,
      projectName: parsed.projectName || 'Imported Project Rules',
      generalDescriptiveTextTemplate: typeof parsed.generalDescriptiveTextTemplate === 'string'
        ? parsed.generalDescriptiveTextTemplate
        : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `JSON Parse error: ${err?.message || 'Invalid syntax'}`,
    };
  }
}

/**
 * Loads project rules from localStorage with default fallbacks
 */
export function loadProjectRulesFromStorage(): {
  rules: DbProjectRule[];
  mappings: Record<string, string>;
  generalDescriptiveTextTemplate?: string;
} {
  try {
    const savedRulesStr = localStorage.getItem(STORAGE_KEY_PROJECT_RULES);
    const savedMappingsStr = localStorage.getItem(STORAGE_KEY_PROJECT_MAPPINGS);
    const savedGeneralText = localStorage.getItem(STORAGE_KEY_PROJECT_GENERAL_TEXT) || undefined;

    const rules: DbProjectRule[] = savedRulesStr
      ? JSON.parse(savedRulesStr)
      : DEFAULT_PROJECT_RULES;

    const mappings: Record<string, string> = savedMappingsStr
      ? JSON.parse(savedMappingsStr)
      : DEFAULT_COLUMN_MAPPINGS;

    return { rules, mappings, generalDescriptiveTextTemplate: savedGeneralText };
  } catch {
    return {
      rules: DEFAULT_PROJECT_RULES,
      mappings: DEFAULT_COLUMN_MAPPINGS,
    };
  }
}

/**
 * Saves project rules to localStorage
 */
export function saveProjectRulesToStorage(
  rules: DbProjectRule[],
  mappings: Record<string, string>,
  generalDescriptiveTextTemplate?: string
): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECT_RULES, JSON.stringify(rules));
    localStorage.setItem(STORAGE_KEY_PROJECT_MAPPINGS, JSON.stringify(mappings));
    if (generalDescriptiveTextTemplate !== undefined) {
      localStorage.setItem(STORAGE_KEY_PROJECT_GENERAL_TEXT, generalDescriptiveTextTemplate);
    }
  } catch {
    // ignore local storage errors
  }
}
