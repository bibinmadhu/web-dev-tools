import React, { useState } from 'react';
import {
  SlidersHorizontal,
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
} from 'lucide-react';
import {
  TableColumn,
  SharedPropertyRule,
  OverrideMode,
  RandomMockType,
  RowCopyOptions,
  ENTERPRISE_SHARED_PROPERTY_TEMPLATES,
  findMatchingSharedProperty,
} from '../../../utils/dbRowCopyGenerator';

interface SharedPropertiesEditorProps {
  columns: TableColumn[];
  sharedProperties: Record<string, SharedPropertyRule>;
  options: RowCopyOptions;
  onUpdateSharedProperty: (key: string, rule: Partial<SharedPropertyRule> | null) => void;
  onBatchUpdateSharedProperties: (rules: Record<string, SharedPropertyRule>) => void;
  onUpdateOptions: (opts: Partial<RowCopyOptions>) => void;
  onApplyToTableOverrides: () => void;
}

export const SharedPropertiesEditor: React.FC<SharedPropertiesEditorProps> = ({
  columns,
  sharedProperties = {},
  options,
  onUpdateSharedProperty,
  onBatchUpdateSharedProperties,
  onUpdateOptions,
  onApplyToTableOverrides,
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
  const [customMode, setCustomMode] = useState<OverrideMode>('constant');
  const [customValue, setCustomValue] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const rulesList: SharedPropertyRule[] = (Object.values(sharedProperties || {}) as SharedPropertyRule[]).filter(Boolean);
  const isAutoInheritEnabled = options.applySharedProperties !== false;

  // Schema matching map
  const schemaColMap = new Map<string, TableColumn>();
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
      const existing = (Object.values(updated) as SharedPropertyRule[]).find(
        (r) => r && r.columnName && r.columnName.toLowerCase() === col.name.toLowerCase()
      );
      if (!existing) {
        // Smart default based on column name & type
        let mode: OverrideMode = 'constant';
        let val = '';
        let expr = '';
        let desc = `Populated from column ${col.name} (${col.type})`;

        const lower = col.name.toLowerCase();
        if (lower.includes('status')) {
          val = 'DRAFT';
          desc = 'Default initial status for clones';
        } else if (lower.includes('tenant') || lower.includes('org')) {
          val = 'tenant_default_01';
          desc = 'Shared tenant partition identifier';
        } else if (lower.includes('created_by') || lower.includes('updated_by')) {
          val = 'system_clone_job';
          desc = 'Shared audit user for duplicate actions';
        } else if (lower.includes('at') && (col.type === 'TIMESTAMP' || col.type === 'TIMESTAMPTZ')) {
          mode = 'expression';
          expr = 'CURRENT_TIMESTAMP';
          desc = 'Automatic touch timestamp';
        } else if (col.type === 'UUID') {
          mode = 'mock_random';
          desc = 'Auto-generate distinct UUID';
        } else if (col.isPrimaryKey || col.isIdentity) {
          mode = 'exclude';
          desc = 'Omit primary key / identity for DB auto-generation';
        }

        const ruleId = `sp_${col.name}_${Date.now()}`;
        updated[col.name] = {
          id: ruleId,
          columnName: col.name,
          mode,
          constantValue: val,
          expression: expr,
          randomType: col.type === 'UUID' ? 'uuid' : undefined,
          active: true,
          description: desc,
          isCustom: false,
          matchCaseInsensitive: true,
        };
        addedCount++;
      }
    });

    onBatchUpdateSharedProperties(updated);
    setSyncNotice(`Populated ${addedCount} columns from current schema!`);
    setTimeout(() => setSyncNotice(null), 3500);
  };

  // Add Enterprise Standard Templates
  const handleAddEnterpriseTemplates = () => {
    const updated = { ...sharedProperties };
    let addedCount = 0;

    ENTERPRISE_SHARED_PROPERTY_TEMPLATES.forEach((tmpl) => {
      if (!updated[tmpl.columnName]) {
        updated[tmpl.columnName] = { ...tmpl, id: `sp_${tmpl.columnName}_${Date.now()}` };
        addedCount++;
      }
    });

    onBatchUpdateSharedProperties(updated);
    setSyncNotice(`Added ${addedCount} enterprise standard columns (audit, tenant, status)!`);
    setTimeout(() => setSyncNotice(null), 3500);
  };

  // Handle Add Custom Property
  const handleAddCustomProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = customColName.trim();
    if (!cleanName) return;

    const ruleId = `sp_${cleanName}_${Date.now()}`;
    const newRule: SharedPropertyRule = {
      id: ruleId,
      columnName: cleanName,
      mode: customMode,
      constantValue: customMode === 'constant' ? customValue : undefined,
      expression: customMode === 'expression' ? customValue : undefined,
      prefix: customMode === 'prefix_suffix' ? customValue : undefined,
      suffix: customMode === 'prefix_suffix' ? ' (Clone)' : undefined,
      active: true,
      description: customDesc.trim() || 'Custom shared property',
      isCustom: true,
      matchCaseInsensitive: true,
    };

    onUpdateSharedProperty(cleanName, newRule);
    setCustomColName('');
    setCustomValue('');
    setCustomDesc('');
    setIsAddingCustom(false);
    setSyncNotice(`Added custom shared property "${cleanName}"!`);
    setTimeout(() => setSyncNotice(null), 3000);
  };

  // Filter rules
  const filteredRules = rulesList.filter((r) => {
    const isMatched = schemaColMap.has(r.columnName.toLowerCase());
    if (activeFilter === 'matched' && !isMatched) return false;
    if (activeFilter === 'custom' && !r.isCustom && isMatched) return false;
    if (activeFilter === 'active' && !r.active) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.columnName.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.constantValue && r.constantValue.toLowerCase().includes(q)) ||
        (r.expression && r.expression.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export JSON string
  const sharedJsonString = JSON.stringify(sharedProperties, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(sharedJsonString);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([sharedJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shared_row_copy_properties.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid JSON: expected an object of shared properties.');
      }
      // Validate or adapt
      const merged = { ...sharedProperties };
      let count = 0;
      Object.entries(parsed).forEach(([key, val]: [string, any]) => {
        if (val && typeof val === 'object') {
          merged[key] = {
            id: val.id || `sp_${key}_${Date.now()}`,
            columnName: val.columnName || key,
            mode: val.mode || 'constant',
            constantValue: val.constantValue,
            expression: val.expression,
            prefix: val.prefix,
            suffix: val.suffix,
            sequenceStep: val.sequenceStep,
            randomType: val.randomType,
            active: val.active !== false,
            description: val.description || '',
            isCustom: val.isCustom ?? true,
            matchCaseInsensitive: val.matchCaseInsensitive ?? true,
          };
          count++;
        }
      });
      onBatchUpdateSharedProperties(merged);
      setIsImportExportOpen(false);
      setImportJsonText('');
      setSyncNotice(`Successfully imported ${count} shared properties!`);
      setTimeout(() => setSyncNotice(null), 3500);
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Strategy Info */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  General Shared Properties & Global Defaults
                </h3>
                <span className="text-[11px] font-mono bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-semibold border border-purple-200 dark:border-purple-500/20">
                  {rulesList.length} Rules Configured
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reusable column values applied across multiple tables and row-copy runs. If a table column matches a shared property, it automatically inherits this value unless explicitly overridden.
              </p>
            </div>
          </div>

          {/* Master Auto-Inherit Toggle */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoInheritEnabled}
                onChange={(e) => onUpdateOptions({ applySharedProperties: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Auto-Inherit Shared Properties
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isAutoInheritEnabled ? 'Active (Matches apply to SQL & Diff)' : 'Paused (Verbatim copy fallback)'}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Sync / Notification Alert */}
        {syncNotice && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{syncNotice}</span>
          </div>
        )}

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Total Shared Rules</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              {rulesList.length}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
            <span className="text-emerald-700 dark:text-emerald-400 block mb-0.5 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Matched In Current Table</span>
            </span>
            <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {matchedRules.length} / {columns.length} columns
            </span>
          </div>
          <div className="p-3 rounded-lg bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 text-xs">
            <span className="text-purple-700 dark:text-purple-400 block mb-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Active Enabled Rules</span>
            </span>
            <span className="text-base font-bold text-purple-700 dark:text-purple-400 font-mono">
              {activeRules.length}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 text-xs">
            <span className="text-indigo-700 dark:text-indigo-400 block mb-0.5 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Custom / Cross-Table</span>
            </span>
            <span className="text-base font-bold text-indigo-700 dark:text-indigo-400 font-mono">
              {customRules.length}
            </span>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePopulateFromSchema}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition-colors shadow-xs"
              title="Add all columns from current schema as shared properties"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Populate from Current Schema ({columns.length})</span>
            </button>

            <button
              type="button"
              onClick={handleAddEnterpriseTemplates}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-colors shadow-xs"
              title="Add enterprise standard columns like tenant_id, created_by, updated_at, status"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Add Enterprise Standards</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>{isAddingCustom ? 'Close Custom Form' : 'Add Custom Property'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onApplyToTableOverrides}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
              title="Bake matching shared properties directly into this table's explicit overrides"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Apply Matched to Table Overrides</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            >
              <FileJson className="w-3.5 h-3.5 text-purple-500" />
              <span>Import / Export Shared JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Property Drawer / Form */}
      {isAddingCustom && (
        <form
          onSubmit={handleAddCustomProperty}
          className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded-xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Add Custom Shared Property
              </h4>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Can apply across any table that contains this column
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-4">
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Column / Property Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customColName}
                onChange={(e) => setCustomColName(e.target.value)}
                placeholder="e.g. tenant_id, audit_user, is_active"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Override Mode
              </label>
              <select
                value={customMode}
                onChange={(e) => setCustomMode(e.target.value as OverrideMode)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 outline-hidden font-medium"
              >
                <option value="constant">Constant Value</option>
                <option value="expression">SQL Expression</option>
                <option value="prefix_suffix">Prefix / Suffix</option>
                <option value="mock_random">Random / Mock Data</option>
                <option value="null">Set NULL</option>
                <option value="exclude">Exclude / DB Default</option>
              </select>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                {customMode === 'expression'
                  ? 'SQL Expression'
                  : customMode === 'prefix_suffix'
                  ? 'Prefix'
                  : 'Constant Value'}
              </label>
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder={
                  customMode === 'expression'
                    ? 'e.g. CURRENT_TIMESTAMP or gen_random_uuid()'
                    : 'e.g. DRAFT or tenant_101'
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>

            <div className="sm:col-span-12">
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Description & Usage Note (Optional)
              </label>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="e.g. Default tenant partition key for multi-tenant enterprise data"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
            >
              Add Shared Property
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            All ({rulesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('matched')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeFilter === 'matched'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Schema Matched ({matchedRules.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('custom')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeFilter === 'custom'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Custom / Cross-table ({customRules.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeFilter === 'active'
                ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Active ({activeRules.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search column or rule..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 outline-hidden"
          />
        </div>
      </div>

      {/* Rules List Cards */}
      {filteredRules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
          <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No shared properties found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Click &quot;Populate from Current Schema&quot; or &quot;Add Enterprise Standards&quot; to quickly configure reusable defaults!
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handlePopulateFromSchema}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
            >
              Populate Current Schema
            </button>
            <button
              type="button"
              onClick={handleAddEnterpriseTemplates}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
            >
              Add Enterprise Standards
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredRules.map((rule) => {
            const matchedSchemaCol = schemaColMap.get(rule.columnName.toLowerCase());
            const isMatched = Boolean(matchedSchemaCol);

            return (
              <div
                key={rule.id || rule.columnName}
                className={`bg-white dark:bg-[#0F172A] border rounded-xl p-4 transition-all shadow-xs ${
                  rule.active
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-slate-200/60 dark:border-slate-800/60 opacity-60 bg-slate-50/30 dark:bg-slate-900/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                  {/* Left: Checkbox + Column Name + Schema Matched Badge */}
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      onChange={(e) =>
                        onUpdateSharedProperty(rule.columnName, { active: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                      title={rule.active ? 'Disable rule' : 'Enable rule'}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                          {rule.columnName}
                        </span>

                        {isMatched ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            <Check className="w-2.5 h-2.5" />
                            <span>Matches Table ({matchedSchemaCol?.type})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <Globe className="w-2.5 h-2.5" />
                            <span>Custom / Cross-Table Ready</span>
                          </span>
                        )}

                        {rule.isCustom && isMatched && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                            Custom
                          </span>
                        )}
                      </div>
                      {rule.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                      {rule.mode.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateSharedProperty(rule.columnName, null)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete shared property rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Rule Configuration Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-3 pt-1 text-xs">
                  {/* Mode Selector */}
                  <div className="sm:col-span-3">
                    <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-medium">
                      Mode
                    </label>
                    <select
                      value={rule.mode}
                      onChange={(e) =>
                        onUpdateSharedProperty(rule.columnName, {
                          mode: e.target.value as OverrideMode,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                    >
                      <option value="constant">Constant Value</option>
                      <option value="expression">SQL Expression</option>
                      <option value="prefix_suffix">Prefix / Suffix</option>
                      <option value="sequence_increment">Sequence Increment (+1)</option>
                      <option value="mock_random">Random / Mock Data</option>
                      <option value="null">Set NULL</option>
                      <option value="exclude">Exclude Column</option>
                    </select>
                  </div>

                  {/* Mode-specific Value Editor */}
                  <div className="sm:col-span-5">
                    <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-medium">
                      Value / Expression
                    </label>

                    {rule.mode === 'constant' && (
                      <input
                        type="text"
                        value={rule.constantValue || ''}
                        onChange={(e) =>
                          onUpdateSharedProperty(rule.columnName, { constantValue: e.target.value })
                        }
                        placeholder="Constant value (e.g. DRAFT, tenant_01)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
                      />
                    )}

                    {rule.mode === 'expression' && (
                      <input
                        type="text"
                        value={rule.expression || ''}
                        onChange={(e) =>
                          onUpdateSharedProperty(rule.columnName, { expression: e.target.value })
                        }
                        placeholder="SQL Expression (e.g. CURRENT_TIMESTAMP)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
                      />
                    )}

                    {rule.mode === 'prefix_suffix' && (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={rule.prefix || ''}
                          onChange={(e) =>
                            onUpdateSharedProperty(rule.columnName, { prefix: e.target.value })
                          }
                          placeholder="Prefix"
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
                        />
                        <span className="text-slate-400">+val+</span>
                        <input
                          type="text"
                          value={rule.suffix || ''}
                          onChange={(e) =>
                            onUpdateSharedProperty(rule.columnName, { suffix: e.target.value })
                          }
                          placeholder="Suffix"
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
                        />
                      </div>
                    )}

                    {rule.mode === 'sequence_increment' && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400">Step increment:</span>
                        <input
                          type="number"
                          value={rule.sequenceStep || 1}
                          onChange={(e) =>
                            onUpdateSharedProperty(rule.columnName, {
                              sequenceStep: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
                        />
                      </div>
                    )}

                    {rule.mode === 'mock_random' && (
                      <select
                        value={rule.randomType || 'uuid'}
                        onChange={(e) =>
                          onUpdateSharedProperty(rule.columnName, {
                            randomType: e.target.value as RandomMockType,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                      >
                        <option value="uuid">Fresh Random UUID</option>
                        <option value="email">Mock Email Address</option>
                        <option value="timestamp_now">Current Timestamp</option>
                        <option value="timestamp_future">Future Expiry (+30 days)</option>
                        <option value="numeric_code">6-digit Verification Code</option>
                        <option value="name_copy">Name + &quot; (Clone)&quot;</option>
                      </select>
                    )}

                    {rule.mode === 'null' && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-xs">
                        NULL literal inserted
                      </div>
                    )}

                    {rule.mode === 'exclude' && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-mono text-xs">
                        Omitted from INSERT (DB sequence / default)
                      </div>
                    )}
                  </div>

                  {/* Description / Note */}
                  <div className="sm:col-span-4">
                    <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1 font-medium">
                      Description / Usage Note
                    </label>
                    <input
                      type="text"
                      value={rule.description || ''}
                      onChange={(e) =>
                        onUpdateSharedProperty(rule.columnName, { description: e.target.value })
                      }
                      placeholder="e.g. Audit trail author"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Import / Export JSON Modal */}
      {isImportExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Import / Export Shared Properties Config
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportExportOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export this shared properties dictionary to reuse across different projects and environments, or paste a JSON snippet to import.
            </p>

            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Shared Properties JSON
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {copiedExport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedExport ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={8}
                value={importJsonText || sharedJsonString}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Paste shared properties JSON here..."
                className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              {importError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{importError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportExportOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              {importJsonText && (
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                >
                  Merge / Import JSON
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
