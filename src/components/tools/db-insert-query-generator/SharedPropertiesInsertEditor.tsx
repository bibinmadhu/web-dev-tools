import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Upload,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  Search,
  Filter,
  Info,
  RotateCcw,
  Tag,
  Zap,
  Globe,
  Settings,
  HelpCircle,
  FileJson,
  X,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  InsertColumnConfig,
  InsertSharedPropertyRule,
  InsertSharedMode,
  GeneratorType,
  ENTERPRISE_INSERT_SHARED_TEMPLATES,
  findMatchingInsertSharedProperty,
  COMMON_POSTGRES_TYPES,
} from '../../../utils/dbInsertQueryGenerator';

interface SharedPropertiesInsertEditorProps {
  columns: InsertColumnConfig[];
  sharedProperties: Record<string, InsertSharedPropertyRule>;
  applySharedProperties: boolean;
  onUpdateSharedProperty: (key: string, rule: Partial<InsertSharedPropertyRule> | null) => void;
  onBatchUpdateSharedProperties: (rules: Record<string, InsertSharedPropertyRule>) => void;
  onToggleApplySharedProperties: (apply: boolean) => void;
  onApplySharedToColumns: () => void;
}

export const SharedPropertiesInsertEditor: React.FC<SharedPropertiesInsertEditorProps> = ({
  columns,
  sharedProperties = {},
  applySharedProperties = true,
  onUpdateSharedProperty,
  onBatchUpdateSharedProperties,
  onToggleApplySharedProperties,
  onApplySharedToColumns,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'matched' | 'custom' | 'active'>('all');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // New Custom Property Form State
  const [customColName, setCustomColName] = useState('');
  const [customMode, setCustomMode] = useState<InsertSharedMode>('constant');
  const [customValue, setCustomValue] = useState('');
  const [customExpression, setCustomExpression] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customGenType, setCustomGenType] = useState<GeneratorType>('uuid');

  // Match test input state
  const [testColInput, setTestColInput] = useState('');

  const rulesList: InsertSharedPropertyRule[] = (Object.values(sharedProperties || {}) as InsertSharedPropertyRule[]).filter(Boolean);

  // Schema matching map
  const schemaColMap = new Map<string, InsertColumnConfig>();
  columns.forEach((c) => {
    schemaColMap.set(c.name.toLowerCase(), c);
  });

  const matchedRules = rulesList.filter((r) => schemaColMap.has(r.columnName.toLowerCase()));
  const activeRules = rulesList.filter((r) => r.active);
  const customRules = rulesList.filter((r) => !schemaColMap.has(r.columnName.toLowerCase()) || r.isCustom);

  // Populate from Current Schema
  const handlePopulateFromSchema = () => {
    const updated = { ...sharedProperties };
    let addedCount = 0;

    columns.forEach((col) => {
      // Find if already exists exact or lower
      const existing = (Object.values(updated) as InsertSharedPropertyRule[]).find(
        (r) => r && r.columnName && r.columnName.toLowerCase() === col.name.toLowerCase()
      );
      if (!existing) {
        // Smart default based on column name & type
        let mode: InsertSharedMode = 'constant';
        let val = '';
        let expr = '';
        let desc = `Populated from schema column ${col.name} (${col.type})`;
        let genType: GeneratorType = 'sequential_int';

        const lower = col.name.toLowerCase();
        if (lower.includes('tenant') || lower.includes('org_') || lower.includes('organization')) {
          mode = 'constant';
          val = 'tenant_demo_101';
          desc = 'Multi-tenant organization partition key';
        } else if (lower.includes('created_by') || lower.includes('createdby') || lower.includes('updated_by')) {
          mode = 'constant';
          val = 'system_batch_loader';
          desc = 'Audit user identity';
        } else if (lower.includes('created_at') || lower.includes('updated_at') || lower.includes('timestamp')) {
          mode = 'expression';
          expr = 'CURRENT_TIMESTAMP';
          desc = 'Current system timestamp expression';
        } else if (lower.includes('status') || lower.includes('state')) {
          mode = 'constant';
          val = 'ACTIVE';
          desc = 'Initial record lifecycle status';
        } else if (lower === 'is_active' || lower === 'active' || lower === 'enabled') {
          mode = 'constant';
          val = 'true';
          desc = 'Active state flag';
        } else if (lower === 'version' || lower === 'lock_version') {
          mode = 'constant';
          val = '1';
          desc = 'Optimistic lock version';
        } else if (col.type === 'uuid' || lower.endsWith('_uuid') || (col.isPrimaryKey && col.type === 'uuid')) {
          mode = 'generator';
          genType = 'uuid';
          desc = 'Unique random UUID';
        } else if (col.type === 'boolean') {
          mode = 'constant';
          val = 'true';
        } else if (col.type === 'date') {
          mode = 'expression';
          expr = 'CURRENT_DATE';
        } else if (col.type === 'timestamp' || col.type === 'timestamptz') {
          mode = 'expression';
          expr = 'CURRENT_TIMESTAMP';
        } else if (col.valueMode === 'fixed' && col.fixedValue) {
          mode = 'constant';
          val = col.fixedValue;
        } else if (col.valueMode === 'pool' && col.valuePool && col.valuePool.length > 0) {
          mode = 'pool';
          val = col.valuePool.join(', ');
        } else {
          mode = 'constant';
          val = `default_${col.name}`;
        }

        updated[col.name] = {
          id: `sp_schema_${col.name}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          columnName: col.name,
          mode,
          constantValue: val,
          expression: expr,
          generatorType: genType,
          valuePool: mode === 'pool' ? col.valuePool : undefined,
          active: true,
          description: desc,
          isCustom: false,
          matchCaseInsensitive: true,
        };
        addedCount++;
      }
    });

    onBatchUpdateSharedProperties(updated);
    setSyncNotice(
      addedCount > 0
        ? `Added ${addedCount} property rules from table schema!`
        : 'All table columns are already mapped in Shared Properties.'
    );
    setTimeout(() => setSyncNotice(null), 3000);
  };

  // Add Custom Property Submit
  const handleAddCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = customColName.trim();
    if (!cleanName) return;

    const newRule: InsertSharedPropertyRule = {
      id: `sp_custom_${cleanName}_${Date.now()}`,
      columnName: cleanName,
      mode: customMode,
      constantValue: customMode === 'constant' ? customValue : undefined,
      expression: customMode === 'expression' ? (customExpression || 'CURRENT_TIMESTAMP') : undefined,
      valuePool: customMode === 'pool' ? customValue.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      generatorType: customMode === 'generator' ? customGenType : undefined,
      active: true,
      description: customDesc || 'Custom shared property',
      isCustom: true,
      matchCaseInsensitive: true,
    };

    onUpdateSharedProperty(cleanName, newRule);
    setCustomColName('');
    setCustomValue('');
    setCustomExpression('');
    setCustomDesc('');
    setIsAddingCustom(false);
    setSyncNotice(`Added custom shared property "${cleanName}".`);
    setTimeout(() => setSyncNotice(null), 3000);
  };

  // Load Enterprise Template
  const handleLoadEnterpriseTemplate = (tmpl: InsertSharedPropertyRule) => {
    const updated = { ...sharedProperties };
    updated[tmpl.columnName] = {
      ...tmpl,
      id: `sp_tmpl_${tmpl.columnName}_${Date.now()}`,
    };
    onBatchUpdateSharedProperties(updated);
    setSyncNotice(`Added template "${tmpl.columnName}"!`);
    setTimeout(() => setSyncNotice(null), 3000);
  };

  // Bulk enable / disable
  const handleToggleAll = (active: boolean) => {
    const updated: Record<string, InsertSharedPropertyRule> = {};
    Object.entries(sharedProperties).forEach(([key, rule]) => {
      updated[key] = { ...rule, active };
    });
    onBatchUpdateSharedProperties(updated);
    setSyncNotice(active ? 'Activated all shared rules.' : 'Deactivated all shared rules.');
    setTimeout(() => setSyncNotice(null), 2500);
  };

  // Remove Inactive Rules
  const handleClearInactive = () => {
    const updated: Record<string, InsertSharedPropertyRule> = {};
    let removed = 0;
    Object.entries(sharedProperties).forEach(([key, rule]) => {
      if (rule.active) {
        updated[key] = rule;
      } else {
        removed++;
      }
    });
    onBatchUpdateSharedProperties(updated);
    setSyncNotice(`Removed ${removed} inactive rules.`);
    setTimeout(() => setSyncNotice(null), 2500);
  };

  // Reset to default templates
  const handleResetToEnterprise = () => {
    const updated: Record<string, InsertSharedPropertyRule> = {};
    ENTERPRISE_INSERT_SHARED_TEMPLATES.forEach((tmpl) => {
      updated[tmpl.columnName] = { ...tmpl };
    });
    onBatchUpdateSharedProperties(updated);
    setSyncNotice('Reset to standard Enterprise shared properties!');
    setTimeout(() => setSyncNotice(null), 3000);
  };

  // Filtered rules
  const filteredRules = rulesList.filter((r) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = r.columnName.toLowerCase().includes(q);
      const descMatch = (r.description || '').toLowerCase().includes(q);
      const valMatch = (r.constantValue || r.expression || '').toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !valMatch) return false;
    }

    // Filter Tab
    if (activeFilter === 'matched') {
      return schemaColMap.has(r.columnName.toLowerCase());
    }
    if (activeFilter === 'custom') {
      return !schemaColMap.has(r.columnName.toLowerCase()) || r.isCustom;
    }
    if (activeFilter === 'active') {
      return r.active;
    }
    return true;
  });

  // Interactive match test feedback
  const matchTestResult = testColInput.trim()
    ? findMatchingInsertSharedProperty(testColInput.trim(), sharedProperties)
    : undefined;

  // JSON Export payload
  const exportJsonString = JSON.stringify(
    {
      app: 'DevHub',
      tool: 'db-insert-query-generator',
      type: 'shared-properties-config',
      exportedAt: new Date().toISOString(),
      sharedProperties,
      applySharedProperties,
    },
    null,
    2
  );

  const handleCopyExportJson = async () => {
    try {
      await navigator.clipboard.writeText(exportJsonString);
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
    } catch {}
  };

  const handleDownloadExportJson = () => {
    const blob = new Blob([exportJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shared_insert_properties_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    setImportError(null);
    if (!importJsonText.trim()) {
      setImportError('Please paste valid JSON.');
      return;
    }
    try {
      const parsed = JSON.parse(importJsonText);
      const importedRules = parsed.sharedProperties || parsed.rules || parsed;
      if (!importedRules || typeof importedRules !== 'object') {
        setImportError('Invalid JSON structure: Expected a "sharedProperties" object.');
        return;
      }
      onBatchUpdateSharedProperties(importedRules);
      setIsImportExportOpen(false);
      setImportJsonText('');
      setSyncNotice('Imported shared properties configuration successfully!');
      setTimeout(() => setSyncNotice(null), 3000);
    } catch (err: any) {
      setImportError(err?.message || 'Invalid JSON syntax.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Notice Pill */}
      {syncNotice && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
            <span>{syncNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncNotice(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            &times;
          </button>
        </div>
      )}

      {/* Top Banner & Context Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50/80 to-indigo-50/60 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200/70 dark:border-purple-800/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  General Shared Properties
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                  {activeRules.length} Active Rules
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define reusable property rules (e.g. <code className="text-purple-600 dark:text-purple-400 font-mono">tenant_id</code>, <code className="text-purple-600 dark:text-purple-400 font-mono">created_by</code>, <code className="text-purple-600 dark:text-purple-400 font-mono">status</code>). Matching table columns automatically inherit these values during INSERT generation.
              </p>
            </div>
          </div>

          {/* Auto-Inherit Master Switch */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 shadow-2xs">
            <label htmlFor="master-auto-inherit" className="text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
              Auto-Inherit in Queries:
            </label>
            <input
              id="master-auto-inherit"
              type="checkbox"
              checked={applySharedProperties}
              onChange={(e) => onToggleApplySharedProperties(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
            <span className={`text-[11px] font-mono font-bold ${applySharedProperties ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {applySharedProperties ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
          <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40">
            <span className="text-slate-400 text-[10px] block">TOTAL RULES</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{rulesList.length}</span>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40">
            <span className="text-slate-400 text-[10px] block">MATCHED IN SCHEMA</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">{matchedRules.length} / {columns.length} cols</span>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40">
            <span className="text-slate-400 text-[10px] block">CUSTOM RULES</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{customRules.length}</span>
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40">
            <span className="text-slate-400 text-[10px] block">PERSISTENCE</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Export Ready</span>
          </div>
        </div>
      </div>

      {/* Main Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Populate from current schema */}
          <button
            type="button"
            onClick={handlePopulateFromSchema}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Inspect table schema and auto-generate shared property rules for all unmapped columns"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Populate from Schema ({columns.length} Cols)</span>
          </button>

          {/* Add custom property toggle */}
          <button
            type="button"
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:text-purple-600 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-purple-500" />
            <span>Add Custom Rule</span>
          </button>

          {/* Bake / Apply to Column Definitions */}
          <button
            type="button"
            onClick={onApplySharedToColumns}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Write matching shared property values permanently into current table column configurations"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>Bake into Columns</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Shared JSON Export / Import */}
          <button
            type="button"
            onClick={() => setIsImportExportOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-slate-400 flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Export or Import Shared Properties configuration as JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-purple-500" />
            <span>Shared JSON</span>
          </button>

          {/* Quick toggle all */}
          <button
            type="button"
            onClick={() => handleToggleAll(true)}
            className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Enable all rules"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={() => handleToggleAll(false)}
            className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Disable all rules"
          >
            Disable All
          </button>
          <button
            type="button"
            onClick={handleClearInactive}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Remove inactive rules"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add Custom Property Drawer / Form */}
      {isAddingCustom && (
        <form
          onSubmit={handleAddCustomSubmit}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-purple-500/40 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Define New Shared Property Rule</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Column Name to Match *
              </label>
              <input
                type="text"
                required
                value={customColName}
                onChange={(e) => setCustomColName(e.target.value)}
                placeholder="e.g. tenant_id, client_code"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Value Mode
              </label>
              <select
                value={customMode}
                onChange={(e) => setCustomMode(e.target.value as InsertSharedMode)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium"
              >
                <option value="constant">Constant / Literal Value</option>
                <option value="expression">SQL Function / Expression (e.g. NOW())</option>
                <option value="pool">Preferred Values Pool (Cycles)</option>
                <option value="generator">Generator (UUID, Sequential, etc.)</option>
                <option value="default">PostgreSQL DEFAULT</option>
                <option value="null">SQL NULL</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {customMode === 'constant' && 'Constant Value'}
                {customMode === 'expression' && 'SQL Expression'}
                {customMode === 'pool' && 'Pool Items (comma-separated)'}
                {customMode === 'generator' && 'Generator Type'}
                {(customMode === 'default' || customMode === 'null') && 'Value Preview'}
              </label>

              {customMode === 'constant' && (
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="e.g. tenant_demo_101"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                />
              )}

              {customMode === 'expression' && (
                <input
                  type="text"
                  value={customExpression}
                  onChange={(e) => setCustomExpression(e.target.value)}
                  placeholder="e.g. CURRENT_TIMESTAMP, gen_random_uuid()"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-400"
                />
              )}

              {customMode === 'pool' && (
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="US, EU, APAC, LATAM"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                />
              )}

              {customMode === 'generator' && (
                <select
                  value={customGenType}
                  onChange={(e) => setCustomGenType(e.target.value as GeneratorType)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                >
                  <option value="uuid">UUID (v4 string / gen_random_uuid)</option>
                  <option value="sequential_int">Sequential Integer (1, 2, 3...)</option>
                  <option value="current_timestamp">Current Timestamp</option>
                  <option value="company">Company / Business Name</option>
                  <option value="email">Email Address</option>
                  <option value="name">Person Name</option>
                  <option value="random_boolean">Random Boolean</option>
                  <option value="lorem">Sample Descriptive Text</option>
                </select>
              )}

              {(customMode === 'default' || customMode === 'null') && (
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500 font-bold">
                  {customMode.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <input
              type="text"
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Description or audit note (optional)..."
              className="flex-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
            >
              Add Property
            </button>
          </div>
        </form>
      )}

      {/* Enterprise Templates Quick Injector Pill Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 px-1">
          <BookOpen className="w-3 h-3 text-purple-500" />
          <span>Quick Enterprise Templates:</span>
        </span>
        {ENTERPRISE_INSERT_SHARED_TEMPLATES.map((tmpl) => {
          const isAdded = rulesList.some((r) => r.columnName.toLowerCase() === tmpl.columnName.toLowerCase());
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleLoadEnterpriseTemplate(tmpl)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors flex items-center gap-1 ${
                isAdded
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-semibold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-400 border border-slate-200 dark:border-slate-700'
              }`}
              title={`${tmpl.description || ''} (${tmpl.mode}: ${tmpl.constantValue || tmpl.expression})`}
            >
              <span>+{tmpl.columnName}</span>
              {isAdded && <Check className="w-2.5 h-2.5 text-purple-500" />}
            </button>
          );
        })}
        <button
          type="button"
          onClick={handleResetToEnterprise}
          className="ml-auto text-[11px] text-purple-600 dark:text-purple-400 hover:underline px-2 font-medium"
        >
          Reset All to Templates
        </button>
      </div>

      {/* Search, Filter Tabs & Live Match Tester */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Filter segment tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All ({rulesList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('matched')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'matched'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Matched Schema ({matchedRules.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('custom')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeFilter === 'custom'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Custom ({customRules.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('active')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeFilter === 'active'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Active ({activeRules.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search property or value..."
              className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            />
          </div>
        </div>

        {/* Live Match Tester Input Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400 shrink-0">
            Test Column Match:
          </span>
          <input
            type="text"
            value={testColInput}
            onChange={(e) => setTestColInput(e.target.value)}
            placeholder="Type e.g. 'tenant_id', 'status', 'created_by'..."
            className="flex-1 min-w-[180px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
          />
          {testColInput.trim() && (
            <div className="shrink-0">
              {matchTestResult ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Matches: "{matchTestResult.columnName}" ({matchTestResult.mode} {matchTestResult.constantValue || matchTestResult.expression || ''})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-mono font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>No active matching rule found</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rules List / Cards */}
      <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
        {filteredRules.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 space-y-2">
            <Sliders className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-medium">No shared property rules matched the current filter.</p>
            <button
              type="button"
              onClick={handlePopulateFromSchema}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Populate from Schema</span>
            </button>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const matchedSchemaCol = schemaColMap.get(rule.columnName.toLowerCase());
            return (
              <div
                key={rule.id || rule.columnName}
                className={`p-3 rounded-xl border transition-all text-xs ${
                  rule.active
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                    : 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800/70">
                  {/* Left: Active Toggle + Column Name + Match Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      onChange={(e) => onUpdateSharedProperty(rule.columnName, { active: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                      title="Toggle active status for this shared rule"
                    />

                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {rule.columnName}
                    </span>

                    {/* Matched with Schema Badge */}
                    {matchedSchemaCol ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Schema ({matchedSchemaCol.type})</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        Generic
                      </span>
                    )}

                    {/* Case-insensitive indicator */}
                    <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.matchCaseInsensitive !== false}
                        onChange={(e) => onUpdateSharedProperty(rule.columnName, { matchCaseInsensitive: e.target.checked })}
                        className="w-3 h-3 text-purple-600 rounded"
                      />
                      <span>Case-Insensitive</span>
                    </label>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onUpdateSharedProperty(rule.columnName, null)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete this shared rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body: Mode + Value Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  {/* Mode Selector */}
                  <div className="sm:col-span-4">
                    <select
                      value={rule.mode}
                      onChange={(e) => onUpdateSharedProperty(rule.columnName, { mode: e.target.value as InsertSharedMode })}
                      className="w-full px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-purple-700 dark:text-purple-300"
                    >
                      <option value="constant">Constant Literal</option>
                      <option value="expression">SQL Expression</option>
                      <option value="pool">Preferred Pool</option>
                      <option value="generator">Generator</option>
                      <option value="default">DEFAULT</option>
                      <option value="null">NULL</option>
                    </select>
                  </div>

                  {/* Value / Expression / Generator Editor */}
                  <div className="sm:col-span-8">
                    {rule.mode === 'constant' && (
                      <input
                        type="text"
                        value={rule.constantValue !== undefined ? rule.constantValue : ''}
                        onChange={(e) => onUpdateSharedProperty(rule.columnName, { constantValue: e.target.value })}
                        placeholder="Constant value (e.g. tenant_101, ACTIVE)..."
                        className="w-full px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:ring-1 focus:ring-purple-500"
                      />
                    )}

                    {rule.mode === 'expression' && (
                      <input
                        type="text"
                        value={rule.expression || ''}
                        onChange={(e) => onUpdateSharedProperty(rule.columnName, { expression: e.target.value })}
                        placeholder="Raw SQL function (e.g. CURRENT_TIMESTAMP, NOW())..."
                        className="w-full px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold focus:ring-1 focus:ring-indigo-500"
                      />
                    )}

                    {rule.mode === 'pool' && (
                      <input
                        type="text"
                        value={(rule.valuePool || []).join(', ')}
                        onChange={(e) =>
                          onUpdateSharedProperty(rule.columnName, {
                            valuePool: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder="Comma-separated items: Option A, Option B..."
                        className="w-full px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                      />
                    )}

                    {rule.mode === 'generator' && (
                      <select
                        value={rule.generatorType || 'uuid'}
                        onChange={(e) => onUpdateSharedProperty(rule.columnName, { generatorType: e.target.value as GeneratorType })}
                        className="w-full px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200"
                      >
                        <option value="uuid">UUID (v4)</option>
                        <option value="sequential_int">Sequential Integer</option>
                        <option value="current_timestamp">Current Timestamp</option>
                        <option value="company">Company Name</option>
                        <option value="email">Email</option>
                        <option value="name">Person Name</option>
                        <option value="random_boolean">Random Boolean</option>
                        <option value="lorem">Sample Text</option>
                      </select>
                    )}

                    {(rule.mode === 'default' || rule.mode === 'null') && (
                      <div className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-500">
                        PostgreSQL keyword: {rule.mode.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description input */}
                <div className="mt-2 pt-1 border-t border-slate-50 dark:border-slate-800/40">
                  <input
                    type="text"
                    value={rule.description || ''}
                    onChange={(e) => onUpdateSharedProperty(rule.columnName, { description: e.target.value })}
                    placeholder="Audit description or purpose note..."
                    className="w-full text-[11px] text-slate-500 dark:text-slate-400 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dedicated Shared Properties Import / Export Modal */}
      {isImportExportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsImportExportOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Shared Properties Configuration (JSON)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsImportExportOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Export or paste Shared Properties JSON:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyExportJson}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 font-medium transition-colors"
                  >
                    {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedExport ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadExportJson}
                    className="px-2.5 py-1 text-xs rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <textarea
                value={importJsonText || exportJsonString}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  setImportError(null);
                }}
                className="w-full h-64 p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 select-all"
                placeholder="Paste sharedProperties JSON here..."
              />

              {importError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportExportOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Close
              </button>
              {importJsonText && (
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Import &amp; Overwrite Rules
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
