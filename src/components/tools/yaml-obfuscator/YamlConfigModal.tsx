import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  Copy,
  Check,
  FileJson,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Trash2,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Key,
  Shield,
} from 'lucide-react';
import {
  YamlObfuscatorMapping,
  YamlObfuscatorOptions,
  YamlObfuscatorConfigExport,
  createYamlConfigExport,
  validateAndParseYamlConfig,
} from '../../../utils/yamlObfuscator';

export interface YamlConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMapping: YamlObfuscatorMapping | null;
  currentOptions: YamlObfuscatorOptions;
  onApplyConfig: (config: YamlObfuscatorConfigExport, mapping: YamlObfuscatorMapping) => void;
  initialTab?: 'export' | 'import' | 'profiles';
}

const STORAGE_KEY_SAVED_PROFILES = 'devhub_yaml_obfuscator_saved_profiles';

export const YamlConfigModal: React.FC<YamlConfigModalProps> = ({
  isOpen,
  onClose,
  currentMapping,
  currentOptions,
  onApplyConfig,
  initialTab = 'export',
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'profiles'>(initialTab);

  // Export state
  const [exportName, setExportName] = useState<string>('Production YAML Obfuscation Profile');
  const [exportDesc, setExportDesc] = useState<string>('Includes keys, sensitive values, and anchor mappings');
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  // Import state
  const [importText, setImportText] = useState<string>('');
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<{
    success: boolean;
    config?: YamlObfuscatorConfigExport;
    mapping?: YamlObfuscatorMapping;
    error?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Saved profiles
  const [savedProfiles, setSavedProfiles] = useState<YamlObfuscatorConfigExport[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED_PROFILES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newProfileName, setNewProfileName] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync initial tab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCopiedExport(false);
      setImportText('');
      setImportFileName(null);
      setParseResult(null);
      setSaveSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  // Construct current export object
  const currentExportObject = React.useMemo(() => {
    if (!currentMapping) {
      return null;
    }
    return createYamlConfigExport(
      {
        ...currentMapping,
        options: currentOptions,
      },
      exportName,
      exportDesc
    );
  }, [currentMapping, currentOptions, exportName, exportDesc]);

  const currentExportJsonString = React.useMemo(() => {
    if (!currentExportObject) return '';
    return JSON.stringify(currentExportObject, null, 2);
  }, [currentExportObject]);

  if (!isOpen) return null;

  const handleCopyExport = () => {
    if (!currentExportJsonString) return;
    navigator.clipboard.writeText(currentExportJsonString);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleDownloadExport = () => {
    if (!currentExportJsonString) return;
    const blob = new Blob([currentExportJsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'yaml_obfuscator_config'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
        const res = validateAndParseYamlConfig(content);
        setParseResult(res);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleImportTextChange = (text: string) => {
    setImportText(text);
    if (!text.trim()) {
      setParseResult(null);
      return;
    }
    const res = validateAndParseYamlConfig(text);
    setParseResult(res);
  };

  const handleApplyImported = (config: YamlObfuscatorConfigExport, mapping: YamlObfuscatorMapping) => {
    onApplyConfig(config, mapping);
    onClose();
  };

  const handleSaveCurrentProfile = () => {
    if (!currentExportObject || !newProfileName.trim()) return;
    const profileToSave: YamlObfuscatorConfigExport = {
      ...currentExportObject,
      id: `profile-${Date.now()}`,
      name: newProfileName.trim(),
      exportedAt: new Date().toISOString(),
    };
    const updated = [profileToSave, ...savedProfiles.filter((p) => p.name !== newProfileName.trim())];
    setSavedProfiles(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_PROFILES, JSON.stringify(updated));
    } catch {}
    setNewProfileName('');
    setSaveSuccessMsg(`Saved profile "${profileToSave.name}" successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleDeleteProfile = (id: string) => {
    const updated = savedProfiles.filter((p) => p.id !== id);
    setSavedProfiles(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_PROFILES, JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[88vh] overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                YAML Configuration &amp; Mapping Manager
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  JSON Specification
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export, import, and backup all YAML obfuscation mappings, naming styles, and exclusions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS */}
        <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 bg-slate-100/60 dark:bg-slate-950/40 shrink-0">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'export'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Export Configuration
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import Configuration
          </button>

          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profiles'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-800'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved Profiles ({savedProfiles.length})
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 text-xs">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              {!currentMapping || Object.keys(currentMapping.keys).length === 0 ? (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3.5 text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    No active obfuscation mapping found yet. Run an obfuscation in the main editor to populate keys and values.
                  </span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Profile / Configuration Name:
                      </label>
                      <input
                        type="text"
                        value={exportName}
                        onChange={(e) => setExportName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Description (optional):
                      </label>
                      <input
                        type="text"
                        value={exportDesc}
                        onChange={(e) => setExportDesc(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Summary Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Mapped Keys:</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">
                        {currentMapping.stats.keysCount}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Masked Values:</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">
                        {currentMapping.stats.valuesCount}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Anchors / Aliases:</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">
                        {currentMapping.stats.anchorsCount}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Total Replacements:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        {currentMapping.stats.totalReplacements}
                      </strong>
                    </div>
                  </div>

                  {/* JSON Preview */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Export JSON Payload:
                    </label>
                    <textarea
                      readOnly
                      value={currentExportJsonString}
                      rows={8}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 rounded p-2.5 font-mono text-xs text-emerald-700 dark:text-emerald-300 focus:outline-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Save this JSON file or copy to clipboard to de-obfuscate files on any machine.
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyExport}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedExport ? 'Copied JSON' : 'Copy JSON'}</span>
                      </button>

                      <button
                        onClick={handleDownloadExport}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JSON File</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 space-y-2">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  Load Configuration from File or Paste JSON
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Import an exported YAML configuration JSON file to restore all mapping dictionaries (keys, values, anchors) and options.
                </p>

                {/* Upload Button */}
                <div className="pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose JSON File...</span>
                    {importFileName && <span className="text-[10px] text-slate-500">({importFileName})</span>}
                  </button>
                </div>
              </div>

              {/* Paste JSON Textarea */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Or Paste Configuration JSON Content:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => handleImportTextChange(e.target.value)}
                  placeholder={`{\n  "format": "devhub-yaml-obfuscator-config",\n  "version": 1,\n  "mappings": {\n    "keys": { "server_host": "k_1" },\n    "values": { "supersecret": "val_1" }\n  }\n}`}
                  rows={7}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 rounded p-2.5 font-mono text-xs text-slate-900 dark:text-indigo-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* PARSE RESULT STATUS */}
              {parseResult && (
                <div>
                  {parseResult.success && parseResult.config && parseResult.mapping ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-lg p-3 space-y-2.5 text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Valid Configuration: &ldquo;{parseResult.config.name}&rdquo;</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded border border-emerald-200 dark:border-emerald-500/20 text-slate-700 dark:text-slate-200 font-mono">
                        <div>
                          <span className="text-slate-400 block font-sans">Keys:</span>
                          <strong>{Object.keys(parseResult.config.mappings.keys).length}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Values:</span>
                          <strong>{Object.keys(parseResult.config.mappings.values).length}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Anchors:</span>
                          <strong>{Object.keys(parseResult.config.mappings.anchors).length}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Style:</span>
                          <strong className="capitalize">{parseResult.config.options.namingStyle}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplyImported(parseResult.config!, parseResult.mapping!)}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        Apply &amp; Load This Configuration
                      </button>
                    </div>
                  ) : (
                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded-lg p-3 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{parseResult.error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED PROFILES */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              {/* Save New Profile Form */}
              <div className="bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  Save Current Session as Profile
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Profile name (e.g. Kubernetes Staging Deployment)"
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleSaveCurrentProfile}
                    disabled={!newProfileName.trim() || !currentMapping}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    Save Profile
                  </button>
                </div>
                {saveSuccessMsg && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{saveSuccessMsg}</p>
                )}
              </div>

              {/* Profiles List */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Saved Browser Profiles ({savedProfiles.length})
                </h5>

                {savedProfiles.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-lg">
                    No saved profiles yet. Save your current mapping above for quick reuse.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedProfiles.map((prof) => (
                      <div
                        key={prof.id}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="min-w-0">
                          <h6 className="font-semibold text-slate-900 dark:text-slate-200 text-xs truncate">
                            {prof.name}
                          </h6>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{new Date(prof.exportedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-mono">
                              {Object.keys(prof.mappings.keys).length} keys,{' '}
                              {Object.keys(prof.mappings.values).length} values
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              const parsed = validateAndParseYamlConfig(prof);
                              if (parsed.success && parsed.config && parsed.mapping) {
                                handleApplyImported(parsed.config, parsed.mapping);
                              }
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ArrowRight className="w-3 h-3" />
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(prof.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                            title="Delete profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
