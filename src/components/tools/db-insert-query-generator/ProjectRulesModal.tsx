import React, { useState, useRef } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Upload,
  Layers,
  ArrowRight,
  Sliders,
  Sparkles,
  Link,
  Tag,
  AlertCircle,
  FileJson,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  DbProjectRule,
  exportProjectRulesJson,
  validateAndParseProjectRulesJson,
  DEFAULT_PROJECT_RULES,
  DEFAULT_COLUMN_MAPPINGS,
} from '../../../utils/dbProjectRules';
import { InsertColumnConfig } from '../../../utils/dbInsertQueryGenerator';

interface ProjectRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: DbProjectRule[];
  mappings: Record<string, string>;
  generalDescriptiveTextTemplate?: string;
  onUpdateRulesAndMappings: (
    rules: DbProjectRule[],
    mappings: Record<string, string>,
    generalDescriptiveTextTemplate?: string
  ) => void;
  currentTableColumns: InsertColumnConfig[];
  onApplyRulesToTable: (overwriteExisting: boolean) => void;
}

export const ProjectRulesModal: React.FC<ProjectRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  mappings,
  generalDescriptiveTextTemplate = '',
  onUpdateRulesAndMappings,
  currentTableColumns,
  onApplyRulesToTable,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'mappings' | 'import_export'>('rules');
  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id || '');
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('replace');
  const [copied, setCopied] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // New column mapping state
  const [newMapCol, setNewMapCol] = useState('');
  const [newMapTargetRule, setNewMapTargetRule] = useState(rules[0]?.name || 'product');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentRule = rules.find((r) => r.id === selectedRuleId) || rules[0];

  const handleUpdateCurrentRule = (updatedFields: Partial<DbProjectRule>) => {
    if (!currentRule) return;
    const updated = rules.map((r) => (r.id === currentRule.id ? { ...r, ...updatedFields } : r));
    onUpdateRulesAndMappings(updated, mappings, generalDescriptiveTextTemplate);
  };

  const handleAddRule = () => {
    const newIdx = rules.length + 1;
    const newRule: DbProjectRule = {
      id: `rule_custom_${Date.now().toString(36)}`,
      name: `custom_rule_${newIdx}`,
      description: 'Shared domain possible values',
      values: ['Value 1', 'Value 2', 'Value 3'],
      aliases: [`custom_field_${newIdx}`],
      defaultValueMode: 'pool',
      tags: ['Custom'],
    };
    const updated = [...rules, newRule];
    onUpdateRulesAndMappings(updated, mappings, generalDescriptiveTextTemplate);
    setSelectedRuleId(newRule.id);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (rules.length <= 1) return;
    const updated = rules.filter((r) => r.id !== ruleId);
    onUpdateRulesAndMappings(updated, mappings, generalDescriptiveTextTemplate);
    if (selectedRuleId === ruleId) {
      setSelectedRuleId(updated[0].id);
    }
  };

  const handleDuplicateRule = (rule: DbProjectRule) => {
    const duplicated: DbProjectRule = {
      ...rule,
      id: `rule_${Date.now().toString(36)}`,
      name: `${rule.name}_copy`,
      aliases: rule.aliases.map((a) => `${a}_copy`),
      values: [...rule.values],
    };
    const updated = [...rules, duplicated];
    onUpdateRulesAndMappings(updated, mappings, generalDescriptiveTextTemplate);
    setSelectedRuleId(duplicated.id);
  };

  // Add mapping
  const handleAddMapping = () => {
    if (!newMapCol.trim()) return;
    const updatedMappings = {
      ...mappings,
      [newMapCol.trim().toLowerCase()]: newMapTargetRule,
    };
    onUpdateRulesAndMappings(rules, updatedMappings, generalDescriptiveTextTemplate);
    setNewMapCol('');
  };

  const handleDeleteMapping = (colName: string) => {
    const updated = { ...mappings };
    delete updated[colName];
    onUpdateRulesAndMappings(rules, updated, generalDescriptiveTextTemplate);
  };

  // Import / Export JSON
  const exportedJson = exportProjectRulesJson(
    rules,
    mappings,
    'Default Database Project',
    generalDescriptiveTextTemplate
  );

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([exportedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database_project_rules_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) {
      setImportError('Please provide valid JSON configuration');
      return;
    }

    const {
      success,
      rules: importedRules,
      mappings: importedMappings,
      generalDescriptiveTextTemplate: importedGeneralText,
      error,
    } = validateAndParseProjectRulesJson(importJsonText);

    if (!success || !importedRules) {
      setImportError(error || 'Invalid Project Rules format');
      return;
    }

    const nextGeneralText = importedGeneralText !== undefined ? importedGeneralText : generalDescriptiveTextTemplate;

    if (importMode === 'merge') {
      const mergedRules = [...rules];
      importedRules.forEach((imp) => {
        const existingIdx = mergedRules.findIndex((r) => r.name.toLowerCase() === imp.name.toLowerCase());
        if (existingIdx >= 0) {
          mergedRules[existingIdx] = imp;
        } else {
          mergedRules.push(imp);
        }
      });
      const mergedMappings = { ...mappings, ...(importedMappings || {}) };
      onUpdateRulesAndMappings(mergedRules, mergedMappings, nextGeneralText);
    } else {
      onUpdateRulesAndMappings(importedRules, importedMappings || {}, nextGeneralText);
    }

    setImportError(null);
    setImportJsonText('');
    setActiveTab('rules');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      const res = validateAndParseProjectRulesJson(content);
      setImportError(res.error || null);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyToTableClick = () => {
    onApplyRulesToTable(true);
    setAppliedNotice('Rules scanned and applied to current table columns!');
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json,application/json,text/plain"
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Project Rules & Column Mappings
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {rules.length} Rules Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shared domain rules (e.g. product values), column mappings (product_name → product), and cross-table settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between px-4 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'rules'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Rules Dictionary ({rules.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mappings')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'mappings'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Link className="w-4 h-4" /> Column Mappings ({Object.keys(mappings).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('import_export')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'import_export'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileJson className="w-4 h-4" /> Import / Export JSON
            </button>
          </div>

          {/* Quick Apply Button */}
          <button
            type="button"
            onClick={handleApplyToTableClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs mb-1.5 transition-colors"
            title="Scan and apply matching project rules to current table columns"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Rules to Current Table</span>
          </button>
        </div>

        {/* Notification Toast if applied */}
        {appliedNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between animate-fade-in shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{appliedNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setAppliedNotice(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 flex overflow-hidden min-h-0 text-xs">
          {/* TAB 1: RULES DICTIONARY */}
          {activeTab === 'rules' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* General Descriptive Text Template Rule Banner */}
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-800/80 shrink-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-xs text-indigo-950 dark:text-indigo-100">
                      General Descriptive Text Template Rule
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium">
                      Applies to all tables &amp; columns
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Placeholders: &#123;row&#125;, &#123;col&#125;, &#123;table&#125;
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Global template for columns using <code className="font-mono text-indigo-600 dark:text-indigo-400">Sample Descriptive Text</code> across all tables. Individual columns can still override at the value level.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generalDescriptiveTextTemplate}
                    onChange={(e) => onUpdateRulesAndMappings(rules, mappings, e.target.value)}
                    placeholder="Default: Sample record entry #{row} generated for PostgreSQL integration testing."
                    className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  {generalDescriptiveTextTemplate && (
                    <button
                      type="button"
                      onClick={() => onUpdateRulesAndMappings(rules, mappings, '')}
                      className="px-2 py-1 text-[11px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                      title="Clear general rule and restore default text"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                  {[
                    'Record for {table} #{row}: {col} details',
                    'Integration test record #{row} ({col})',
                    'Audit log event #{row} for {table}',
                    'Production fixture note #{row}',
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => onUpdateRulesAndMappings(rules, mappings, preset)}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                    >
                      {preset.split(' ')[0]} {preset.split(' ')[1]}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Rules View */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left sidebar: Rules list */}
              <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                    Project Rules ({rules.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> New Rule
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {rules.map((rule) => {
                    const isSelected = rule.id === selectedRuleId;
                    return (
                      <div
                        key={rule.id}
                        onClick={() => setSelectedRuleId(rule.id)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-xs'
                            : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold font-mono text-slate-900 dark:text-slate-100 truncate text-xs">
                            {rule.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {rule.values.length} vals
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {rule.description || 'Shared rule'}
                        </p>
                        {rule.aliases && rule.aliases.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {rule.aliases.slice(0, 3).map((a, aIdx) => (
                              <span
                                key={aIdx}
                                className="text-[9px] font-mono px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              >
                                {a}
                              </span>
                            ))}
                            {rule.aliases.length > 3 && (
                              <span className="text-[9px] text-slate-400">+{rule.aliases.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right side: Selected Rule Editor */}
              {currentRule ? (
                <div className="w-2/3 flex flex-col p-4 overflow-y-auto space-y-4 bg-white dark:bg-slate-900">
                  {/* Top Bar for Rule */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          {currentRule.name}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">Edit rule definition, allowed value set, and column aliases</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicateRule(currentRule)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Duplicate rule"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(currentRule.id)}
                        disabled={rules.length <= 1}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rule Name & Description Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Rule Name / Key:
                      </label>
                      <input
                        type="text"
                        value={currentRule.name}
                        onChange={(e) => handleUpdateCurrentRule({ name: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Description / Note:
                      </label>
                      <input
                        type="text"
                        value={currentRule.description || ''}
                        onChange={(e) => handleUpdateCurrentRule({ description: e.target.value })}
                        placeholder="e.g. Allowed product inventory items"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Possible Values Set (Value Pool) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Possible Allowed Values Pool ({currentRule.values.length} values):</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">One value per line or comma-separated</span>
                    </div>

                    <textarea
                      rows={5}
                      value={currentRule.values.join('\n')}
                      onChange={(e) => {
                        const vals = e.target.value
                          .split(/[\n,]/)
                          .map((v) => v.trim())
                          .filter(Boolean);
                        handleUpdateCurrentRule({ values: vals.length > 0 ? vals : ['Default Value'] });
                      }}
                      placeholder="Widget Pro&#10;Gizmo Ultra&#10;Gadget Max&#10;Module X"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />

                    {/* Chips preview of values */}
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-100/60 dark:bg-slate-800/40 rounded-lg">
                      {currentRule.values.map((val, vIdx) => (
                        <span
                          key={vIdx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Column Aliases / Shared Mappings */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Link className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Mapped Column Aliases:</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Columns matching these names share this rule</span>
                    </div>

                    <input
                      type="text"
                      value={currentRule.aliases.join(', ')}
                      onChange={(e) => {
                        const aliases = e.target.value
                          .split(',')
                          .map((a) => a.trim().toLowerCase())
                          .filter(Boolean);
                        handleUpdateCurrentRule({ aliases });
                      }}
                      placeholder="e.g. product_name, item_name, prod_title"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />

                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      When a table column is named <span className="font-mono text-indigo-500">{currentRule.aliases.join('</span> or <span className="font-mono text-indigo-500">') || currentRule.name}</span>, it will automatically link to this rule and share its possible values!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">No rule selected</div>
              )}
            </div>
            </div>
          )}

          {/* TAB 2: COLUMN MAPPINGS */}
          {activeTab === 'mappings' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Link className="w-4 h-4 text-emerald-500" />
                    <span>Global Column to Project Rule Mappings</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Map any arbitrary column name to a shared rule (e.g. map <span className="font-mono text-indigo-500">product_name → product</span>)
                  </p>
                </div>
              </div>

              {/* Add New Mapping Form */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    When Column is Named:
                  </label>
                  <input
                    type="text"
                    value={newMapCol}
                    onChange={(e) => setNewMapCol(e.target.value)}
                    placeholder="e.g. product_name or billing_country"
                    className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center pt-5 text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-[180px]">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Map to Project Rule:
                  </label>
                  <select
                    value={newMapTargetRule}
                    onChange={(e) => setNewMapTargetRule(e.target.value)}
                    className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {rules.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.values.length} values)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={handleAddMapping}
                    disabled={!newMapCol.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Mapping</span>
                  </button>
                </div>
              </div>

              {/* Existing Mappings Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="p-2.5 pl-4">Column Name / Pattern</th>
                      <th className="p-2.5">Mapped Rule</th>
                      <th className="p-2.5">Shared Values Preview</th>
                      <th className="p-2.5 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(mappings).map(([colPattern, targetRuleName]) => {
                      const matchedRule = rules.find((r) => r.name.toLowerCase() === String(targetRuleName).toLowerCase());
                      return (
                        <tr key={colPattern} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                          <td className="p-2.5 pl-4 font-semibold text-indigo-600 dark:text-indigo-400">
                            {colPattern}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {targetRuleName}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500 truncate max-w-xs">
                            {matchedRule?.values.join(', ') || 'Rule not found'}
                          </td>
                          <td className="p-2.5 text-right pr-4">
                            <button
                              type="button"
                              onClick={() => handleDeleteMapping(colPattern)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500"
                              title="Delete mapping"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORT / EXPORT */}
          {activeTab === 'import_export' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-indigo-500" />
                    <span>Import & Export Project Rules (JSON)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Save your shared rules definition to a JSON file and import them across projects or tables
                  </p>
                </div>
              </div>

              {/* Export Panel */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Export Current Rules & Mappings:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadJson}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .json</span>
                    </button>
                  </div>
                </div>

                <textarea
                  readOnly
                  rows={4}
                  value={exportedJson}
                  className="w-full p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800"
                />
              </div>

              {/* Import Panel */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Import Rules JSON:
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                      />
                      Replace All
                    </label>
                    <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        value="merge"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                      />
                      Merge with Existing
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File...</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    setImportError(null);
                  }}
                  placeholder="Paste exported project rules JSON here..."
                  className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />

                {importError && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleImportSubmit}
                    disabled={!importJsonText.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs disabled:opacity-40"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Apply & Import Rules</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
          <span className="text-slate-500 text-xs">
            {currentTableColumns.length} columns in current table ({currentTableColumns.filter((c) => c.linkedProjectRule).length} linked to project rules)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
