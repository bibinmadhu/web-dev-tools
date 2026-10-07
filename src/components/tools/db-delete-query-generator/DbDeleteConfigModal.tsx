import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  Copy,
  Check,
  FileJson,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  DeleteQueryOptions,
  TableColumn,
  createDbDeleteConfigExport,
  validateAndParseDbDeleteConfig,
  DB_DELETE_PRESETS,
  DbDeletePreset,
} from '../../../utils/dbDeleteQueryGenerator';

interface DbDeleteConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: DeleteQueryOptions;
  schemaColumns: TableColumn[];
  onImportConfig: (config: DeleteQueryOptions, schemaColumns?: TableColumn[]) => void;
  onSelectPreset: (preset: DbDeletePreset) => void;
}

export const DbDeleteConfigModal: React.FC<DbDeleteConfigModalProps> = ({
  isOpen,
  onClose,
  options,
  schemaColumns,
  onImportConfig,
  onSelectPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'presets'>('export');
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [configName, setConfigName] = useState(options.tableName || 'delete-config');

  if (!isOpen) return null;

  // Export JSON string
  const exportData = createDbDeleteConfigExport(options, schemaColumns, {
    name: configName,
    description: `Config for deleting records from ${options.tableName}`,
  });
  const exportJsonString = JSON.stringify(exportData, null, 2);

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadExport = () => {
    const filename = `db-delete-config-${options.tableName || 'table'}.json`;
    const blob = new Blob([exportJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      validateImportText(content);
    };
    reader.readAsText(file);
  };

  const validateImportText = (text: string) => {
    setImportError(null);
    setImportSuccess(null);
    if (!text.trim()) {
      setImportError('Please enter or paste JSON configuration.');
      return;
    }

    const result = validateAndParseDbDeleteConfig(text);
    if (!result.isValid || !result.config) {
      setImportError(result.error || 'Invalid configuration format.');
    } else {
      setImportSuccess(
        `Valid configuration for table "${result.config.tableName}" with ${result.config.conditions.length} conditions.`
      );
    }
  };

  const handleApplyImport = () => {
    const result = validateAndParseDbDeleteConfig(importJsonText);
    if (result.isValid && result.config) {
      onImportConfig(result.config, result.schemaColumns);
      onClose();
    } else {
      setImportError(result.error || 'Cannot apply invalid configuration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Delete Query Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Import, export, or browse pre-built query configuration templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Export Config
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Import Config
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Presets & Templates
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* EXPORT TAB */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Configuration Name
                  </label>
                  <input
                    type="text"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Inactive orders cleanup"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <button
                    onClick={handleCopyExport}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy JSON'}
                  </button>
                  <button
                    onClick={handleDownloadExport}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .json
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Configuration JSON Preview</span>
                  <span>{exportJsonString.length} characters</span>
                </div>
                <textarea
                  readOnly
                  value={exportJsonString}
                  rows={14}
                  className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-300 select-all resize-none focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* IMPORT TAB */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Upload Configuration File (.json)
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-300 hover:file:bg-indigo-100"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Or Paste JSON Directly
                </label>
                <textarea
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    validateImportText(e.target.value);
                  }}
                  rows={10}
                  placeholder={`{\n  "version": "1.0.0",\n  "tool": "db-delete-query-generator",\n  "config": {\n    "tableName": "orders",\n    "conditions": [...]\n  }\n}`}
                  className="w-full p-3 font-mono text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Status messages */}
              {importError && (
                <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{importError}</span>
                </div>
              )}
              {importSuccess && (
                <div className="flex items-center gap-2 p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>
          )}

          {/* PRESETS TAB */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Load a pre-configured scenario with table schema, single/list conditions, and delete strategy.
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {DB_DELETE_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {preset.name}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>Table: {preset.options.tableName}</span>
                        <span>·</span>
                        <span>Strategy: {preset.options.strategy}</span>
                        <span>·</span>
                        <span>Conditions: {preset.options.conditions.length}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onSelectPreset(preset);
                        onClose();
                      }}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-md transition-colors border border-indigo-200 dark:border-indigo-800"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="text-xs text-slate-500">
            {activeTab === 'export' && `${options.conditions.length} conditions configured`}
            {activeTab === 'import' && 'JSON schema 1.0.0 compatible'}
            {activeTab === 'presets' && `${DB_DELETE_PRESETS.length} templates available`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            {activeTab === 'import' && (
              <button
                onClick={handleApplyImport}
                disabled={!importSuccess}
                className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-md transition-colors shadow-sm"
              >
                Apply Configuration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
