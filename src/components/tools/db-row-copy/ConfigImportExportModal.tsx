import React, { useState } from 'react';
import {
  Download,
  Upload,
  Copy,
  Check,
  FileJson,
  Bookmark,
  Sparkles,
  Trash2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  DbRowCopyConfig,
  DB_ROW_COPY_PRESETS,
} from '../../../utils/dbRowCopyGenerator';

interface ConfigImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: DbRowCopyConfig;
  onLoadConfig: (config: DbRowCopyConfig) => void;
}

const STORAGE_KEY_SAVED_CONFIGS = 'devhub_db_row_copy_saved_configs';

export const ConfigImportExportModal: React.FC<ConfigImportExportModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onLoadConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'presets' | 'saved'>('presets');
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  const [savedConfigs, setSavedConfigs] = useState<DbRowCopyConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_CONFIGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  const currentJsonString = JSON.stringify(currentConfig, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(currentJsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([currentJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentConfig.tableName}_row_copy_config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJsonText(text);
      setImportError(null);
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.tableName || !Array.isArray(parsed.columns)) {
        throw new Error('Invalid config schema: missing tableName or columns array.');
      }
      onLoadConfig(parsed);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON configuration.');
    }
  };

  const handleSaveCurrentProfile = () => {
    const name = newConfigName.trim() || `${currentConfig.tableName} Config`;
    const toSave: DbRowCopyConfig = {
      ...currentConfig,
      id: `saved_${Date.now()}`,
      name,
      updatedAt: new Date().toISOString(),
    };
    const updated = [toSave, ...savedConfigs.filter((c) => c.name !== name)];
    setSavedConfigs(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_CONFIGS, JSON.stringify(updated));
    } catch {}
    setNewConfigName('');
    setActiveTab('saved');
  };

  const handleDeleteSavedProfile = (id: string) => {
    const updated = savedConfigs.filter((c) => c.id !== id);
    setSavedConfigs(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_CONFIGS, JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-5 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-indigo-500" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Row Copy Configurations & Presets
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded"
          >
            Close
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'presets'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Built-in Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Import JSON
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Saved Profiles ({savedConfigs.length})
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Load ready-to-use production scenarios with preconfigured table schemas, lookup IDs, and column override rules.
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {DB_ROW_COPY_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    onLoadConfig(preset);
                    onClose();
                  }}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/80 bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {preset.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {preset.tableName} · {preset.columns.length} cols
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Export JSON */}
        {activeTab === 'export' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete JSON serialization containing table schemas, lookup columns, column overrides, and options.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            <textarea
              value={currentJsonString}
              readOnly
              rows={12}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-950 text-slate-200 focus:outline-hidden"
            />
          </div>
        )}

        {/* Tab 3: Import JSON */}
        {activeTab === 'import' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste JSON or upload a previously exported configuration file.
              </p>
              <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer border border-slate-200 dark:border-slate-700">
                <Upload className="w-3.5 h-3.5 text-indigo-500" />
                <span>Choose File</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON configuration here..."
              rows={10}
              className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            {importError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                {importError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleApplyImport}
                disabled={!importJsonText.trim()}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-xs"
              >
                Validate & Load Configuration
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Saved Profiles in LocalStorage */}
        {activeTab === 'saved' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                placeholder="Profile name (e.g. Orders Table QA Clone)"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleSaveCurrentProfile}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Current</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {savedConfigs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No saved profiles yet. Save your current table and override configuration above.
                </div>
              ) : (
                savedConfigs.map((cfg) => (
                  <div
                    key={cfg.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                  >
                    <div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block">
                        {cfg.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Table: {cfg.tableName} · {cfg.columns.length} columns · {Object.keys(cfg.overrides || {}).length} overrides
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadConfig(cfg);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs rounded font-medium bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedProfile(cfg.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                        title="Delete saved configuration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
