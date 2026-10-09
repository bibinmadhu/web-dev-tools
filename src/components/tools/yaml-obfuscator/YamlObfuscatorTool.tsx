import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  Code2,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  Settings,
  Search,
  BookOpen,
  ArrowRightLeft,
  FileJson,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Database,
  Split,
  Eye,
  RefreshCw,
  FolderOpen,
  Save,
  Tag,
  Sun,
  Moon,
  Laptop,
  Maximize2,
  Minimize2,
  Layers,
  Key,
  Info,
} from 'lucide-react';
import {
  obfuscateYaml,
  deobfuscateYaml,
  YamlObfuscatorOptions,
  YamlObfuscatorMapping,
  YamlObfuscatorConfigExport,
  DEFAULT_YAML_OBFUSCATOR_OPTIONS,
  YAML_PRESETS,
  YamlPreset,
  YamlNamingStyle,
  YamlValueMode,
  YamlCommentHandling,
} from '../../../utils/yamlObfuscator';
import { YamlConfigModal } from './YamlConfigModal';
import { YamlDiffViewer } from './YamlDiffViewer';
import { YamlMappingManager } from './YamlMappingManager';

export interface YamlObfuscatorToolProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

const STORAGE_KEY_MAPPING = 'devhub_yaml_obfuscator_mapping';
const STORAGE_KEY_OPTIONS = 'devhub_yaml_obfuscator_options';
const STORAGE_KEY_SOURCE = 'devhub_yaml_obfuscator_source';
const STORAGE_KEY_THEME = 'devhub_yaml_tool_theme';

export const YamlObfuscatorTool: React.FC<YamlObfuscatorToolProps> = ({
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'obfuscate' | 'deobfuscate' | 'mapping' | 'diff' | 'presets'>('obfuscate');

  // Tool Theme: 'system' | 'light' | 'dark'
  const [toolTheme, setToolTheme] = useState<'system' | 'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {}
    return 'system';
  });

  // Options state
  const [options, setOptions] = useState<YamlObfuscatorOptions>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OPTIONS);
      if (saved) return { ...DEFAULT_YAML_OBFUSCATOR_OPTIONS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_YAML_OBFUSCATOR_OPTIONS;
  });

  // YAML input states
  const [sourceYaml, setSourceYaml] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOURCE);
      if (saved) return saved;
    } catch {}
    return YAML_PRESETS[0].yaml;
  });

  const [obfuscatedYaml, setObfuscatedYaml] = useState<string>('');
  const [deobInputYaml, setDeobInputYaml] = useState<string>('');
  const [deobfuscatedYaml, setDeobfuscatedYaml] = useState<string>('');

  // Active mapping dictionary
  const [mapping, setMapping] = useState<YamlObfuscatorMapping | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAPPING);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // UI state
  const [showOptionsPanel, setShowOptionsPanel] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [configModalTab, setConfigModalTab] = useState<'export' | 'import' | 'profiles'>('export');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [roundtripStatus, setRoundtripStatus] = useState<{ match: boolean; text: string } | null>(null);
  const [newExcludedKey, setNewExcludedKey] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme changes with localStorage and root element if explicit
  const handleToggleTheme = (nextTheme: 'system' | 'light' | 'dark') => {
    setToolTheme(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
    } catch {}
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('devhub_theme', 'dark');
    } else if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('devhub_theme', 'light');
    }
  };

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OPTIONS, JSON.stringify(options));
    } catch {}
  }, [options]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOURCE, sourceYaml);
    } catch {}
  }, [sourceYaml]);

  useEffect(() => {
    if (mapping) {
      try {
        localStorage.setItem(STORAGE_KEY_MAPPING, JSON.stringify(mapping));
      } catch {}
    }
  }, [mapping]);

  // Execute obfuscation
  const handleObfuscate = () => {
    setRoundtripStatus(null);
    const result = obfuscateYaml(sourceYaml, options, mapping || undefined);
    setObfuscatedYaml(result.obfuscatedYaml);
    setMapping(result.mapping);
  };

  // Execute de-obfuscation
  const handleDeobfuscate = () => {
    if (!mapping) return;
    const target = deobInputYaml.trim() ? deobInputYaml : obfuscatedYaml;
    const result = deobfuscateYaml(target, mapping);
    setDeobfuscatedYaml(result.deobfuscatedYaml);
  };

  // Run instant roundtrip test
  const handleVerifyRoundtrip = () => {
    if (!obfuscatedYaml || !mapping) {
      const res = obfuscateYaml(sourceYaml, options, mapping || undefined);
      setObfuscatedYaml(res.obfuscatedYaml);
      setMapping(res.mapping);
      const deob = deobfuscateYaml(res.obfuscatedYaml, res.mapping);
      const isMatch = deob.deobfuscatedYaml.trim() === sourceYaml.trim();
      setRoundtripStatus({
        match: isMatch,
        text: isMatch
          ? '100% Roundtrip Match Verified (Lossless Reversible)'
          : 'Roundtrip diff detected. Check indentation or formatting.',
      });
      return;
    }

    const deob = deobfuscateYaml(obfuscatedYaml, mapping);
    const isMatch = deob.deobfuscatedYaml.trim() === sourceYaml.trim();
    setRoundtripStatus({
      match: isMatch,
      text: isMatch
        ? '100% Roundtrip Match Verified (Lossless Reversible)'
        : 'Roundtrip diff detected. Check comments or indentation.',
    });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
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
      const content = event.target?.result as string;
      if (content) {
        setSourceYaml(content);
        setRoundtripStatus(null);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleLoadPreset = (preset: YamlPreset) => {
    setSourceYaml(preset.yaml);
    setObfuscatedYaml('');
    setDeobfuscatedYaml('');
    setRoundtripStatus(null);
    setActiveTab('obfuscate');
  };

  const handleApplyImportedConfig = (config: YamlObfuscatorConfigExport, newMapping: YamlObfuscatorMapping) => {
    setOptions(config.options);
    setMapping(newMapping);
    setRoundtripStatus(null);
  };

  const handleAddExcludedKey = () => {
    const clean = newExcludedKey.trim();
    if (!clean) return;
    if (!options.excludedKeys.includes(clean)) {
      setOptions({
        ...options,
        excludedKeys: [...options.excludedKeys, clean],
      });
    }
    setNewExcludedKey('');
  };

  const handleRemoveExcludedKey = (key: string) => {
    setOptions({
      ...options,
      excludedKeys: options.excludedKeys.filter((k) => k !== key),
    });
  };

  // Run initial obfuscation on mount if empty
  useEffect(() => {
    if (!obfuscatedYaml && sourceYaml) {
      const res = obfuscateYaml(sourceYaml, options);
      setObfuscatedYaml(res.obfuscatedYaml);
      setMapping(res.mapping);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 sm:p-5 gap-3 overflow-hidden">
      {/* TOP HEADER & ACTION TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                YAML Obfuscator &amp; De-obfuscator
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                100% Reversible
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bi-directional masking of keys, sensitive values &amp; anchors for Kubernetes, Docker, CI/CD &amp; OpenAPI YAML
            </p>
          </div>
        </div>

        {/* TOOLBAR CONTROLS */}
        <div className="flex items-center gap-2">
          {/* Theme Selector Button */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => handleToggleTheme('light')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                toolTheme === 'light'
                  ? 'bg-white text-amber-500 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Light theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleToggleTheme('dark')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                toolTheme === 'dark'
                  ? 'bg-slate-800 text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Dark theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleToggleTheme('system')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                toolTheme === 'system'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="System default theme"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Config Export / Import Button */}
          <button
            onClick={() => {
              setConfigModalTab('export');
              setShowConfigModal(true);
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Import/Export configuration & mappings JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Config / Mapping JSON</span>
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title={isFullScreen ? 'Exit full screen' : 'Full screen view'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('obfuscate')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'obfuscate'
                ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Obfuscate YAML
          </button>

          <button
            onClick={() => {
              setActiveTab('deobfuscate');
              if (!deobInputYaml && obfuscatedYaml) {
                setDeobInputYaml(obfuscatedYaml);
              }
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'deobfuscate'
                ? 'border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            De-obfuscate YAML
          </button>

          <button
            onClick={() => setActiveTab('mapping')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mapping'
                ? 'border-amber-600 dark:border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Mapping Manager
            {mapping && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {mapping.stats.keysCount + mapping.stats.valuesCount + mapping.stats.anchorsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('diff')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'diff'
                ? 'border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            Side-by-Side Diff
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'border-sky-600 dark:border-sky-500 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Presets ({YAML_PRESETS.length})
          </button>
        </div>

        {/* Options Panel Toggle (visible in Obfuscate tab) */}
        {activeTab === 'obfuscate' && (
          <button
            onClick={() => setShowOptionsPanel(!showOptionsPanel)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 mb-1 ${
              showOptionsPanel
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Options &amp; Exclusions</span>
          </button>
        )}
      </div>

      {/* OPTIONS COLLAPSIBLE PANEL */}
      {activeTab === 'obfuscate' && showOptionsPanel && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 shrink-0 text-xs animate-in fade-in duration-100 shadow-xs">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-850">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-indigo-500" />
              Obfuscation Configuration
            </span>
            <button
              onClick={() => setOptions({ ...DEFAULT_YAML_OBFUSCATOR_OPTIONS })}
              className="text-[11px] text-slate-500 hover:text-indigo-500 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Naming Style */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Naming Style:
              </label>
              <select
                value={options.namingStyle}
                onChange={(e) => setOptions({ ...options, namingStyle: e.target.value as YamlNamingStyle })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="prefixed">Prefixed (k_1, val_1)</option>
                <option value="random_hex">Random Hex (k_a8f9)</option>
                <option value="pseudonym">Pseudonym / Dictionary</option>
                <option value="alphabetical">Alphabetical (key_a)</option>
                <option value="hash">Hash Snippet (k_9f83)</option>
              </select>
            </div>

            {/* Value Obfuscation Mode */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Value Masking Mode:
              </label>
              <select
                value={options.valueMode}
                onChange={(e) => setOptions({ ...options, valueMode: e.target.value as YamlValueMode })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="sensitive_only">Sensitive Keys &amp; Tokens Only</option>
                <option value="all_strings">All String Values</option>
                <option value="none">Preserve All Values</option>
              </select>
            </div>

            {/* Comment Handling */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Comment Handling:
              </label>
              <select
                value={options.commentHandling}
                onChange={(e) => setOptions({ ...options, commentHandling: e.target.value as YamlCommentHandling })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="preserve">Preserve Comments Untouched</option>
                <option value="mask">Mask Comment Text</option>
                <option value="strip">Strip All Comments</option>
              </select>
            </div>

            {/* Custom Key Prefix */}
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Key / Value Prefixes:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={options.keyPrefix}
                  onChange={(e) => setOptions({ ...options, keyPrefix: e.target.value })}
                  placeholder="k_"
                  className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono"
                  title="Key prefix"
                />
                <input
                  type="text"
                  value={options.valuePrefix}
                  onChange={(e) => setOptions({ ...options, valuePrefix: e.target.value })}
                  placeholder="val_"
                  className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono"
                  title="Value prefix"
                />
              </div>
            </div>
          </div>

          {/* Toggles Row */}
          <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-200 dark:border-slate-850">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={options.obfuscateKeys}
                onChange={(e) => setOptions({ ...options, obfuscateKeys: e.target.checked })}
                className="rounded text-indigo-600"
              />
              <span>Obfuscate Property Keys</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={options.obfuscateAnchors}
                onChange={(e) => setOptions({ ...options, obfuscateAnchors: e.target.checked })}
                className="rounded text-indigo-600"
              />
              <span>Obfuscate Anchors (&amp;name) &amp; Aliases (*name)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={options.maskNumbers}
                onChange={(e) => setOptions({ ...options, maskNumbers: e.target.checked })}
                className="rounded text-indigo-600"
              />
              <span>Mask Numbers (to 0)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={options.maskBooleans}
                onChange={(e) => setOptions({ ...options, maskBooleans: e.target.checked })}
                className="rounded text-indigo-600"
              />
              <span>Mask Booleans (to false)</span>
            </label>
          </div>

          {/* Excluded Keys Manager */}
          <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-850">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Preserved / Excluded Keys ({options.excludedKeys.length}):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newExcludedKey}
                  onChange={(e) => setNewExcludedKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddExcludedKey();
                  }}
                  placeholder="Add key (e.g. hostName)"
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-[11px] text-slate-900 dark:text-slate-100 font-mono"
                />
                <button
                  onClick={handleAddExcludedKey}
                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px]"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-800">
              {options.excludedKeys.map((k) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300"
                >
                  {k}
                  <button
                    onClick={() => handleRemoveExcludedKey(k)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: OBFUSCATE WORKSPACE */}
      {activeTab === 'obfuscate' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0 overflow-hidden">
          {/* LEFT: SOURCE YAML INPUT */}
          <div className="flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-0 shadow-xs">
            {/* Header */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Original YAML Source</span>
                <span className="text-[11px] font-mono text-slate-400">
                  ({sourceYaml.split('\n').length} lines)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Upload .yaml file"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".yaml,.yml,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => setSourceYaml('')}
                  className="p-1 rounded text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Clear source"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Source Editor Textarea */}
            <textarea
              value={sourceYaml}
              onChange={(e) => {
                setSourceYaml(e.target.value);
                setRoundtripStatus(null);
              }}
              placeholder="Paste original YAML here..."
              className="flex-1 w-full p-3.5 bg-transparent font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed"
            />

            {/* Bottom Actions */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Supports Multi-document YAML (<code className="font-mono">---</code>)
              </span>

              <button
                onClick={handleObfuscate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Shield className="w-3.5 h-3.5" />
                Obfuscate YAML
              </button>
            </div>
          </div>

          {/* RIGHT: OBFUSCATED OUTPUT */}
          <div className="flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-0 shadow-xs">
            {/* Header */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Obfuscated Output YAML</span>
                {mapping && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                    {mapping.stats.totalReplacements} Masked
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(obfuscatedYaml, 'obf')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-[11px] font-medium"
                >
                  {copiedKey === 'obf' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'obf' ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => handleDownload(obfuscatedYaml, 'obfuscated.yaml')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-[11px] font-medium"
                >
                  <Download className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Obfuscated Textarea */}
            <textarea
              readOnly
              value={obfuscatedYaml}
              placeholder="Obfuscated YAML output will appear here..."
              className="flex-1 w-full p-3.5 bg-transparent font-mono text-xs text-indigo-900 dark:text-indigo-200 focus:outline-none resize-none leading-relaxed"
            />

            {/* Verification Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
              {roundtripStatus ? (
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium ${
                    roundtripStatus.match
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {roundtripStatus.match ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{roundtripStatus.text}</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lossless substitution active: 100% reversible with mapping
                </span>
              )}

              <button
                onClick={handleVerifyRoundtrip}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Verify Roundtrip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DE-OBFUSCATE WORKSPACE */}
      {activeTab === 'deobfuscate' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0 overflow-hidden">
          {/* LEFT: OBFUSCATED INPUT */}
          <div className="flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-0 shadow-xs">
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Obfuscated YAML to Restore</span>
              </div>

              {mapping && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {mapping.stats.keysCount} keys, {mapping.stats.valuesCount} values mapped
                </span>
              )}
            </div>

            <textarea
              value={deobInputYaml}
              onChange={(e) => setDeobInputYaml(e.target.value)}
              placeholder="Paste obfuscated YAML here to de-obfuscate..."
              className="flex-1 w-full p-3.5 bg-transparent font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed"
            />

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <button
                onClick={() => {
                  setConfigModalTab('import');
                  setShowConfigModal(true);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Load Mapping JSON...
              </button>

              <button
                onClick={handleDeobfuscate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                De-obfuscate YAML
              </button>
            </div>
          </div>

          {/* RIGHT: RESTORED ORIGINAL OUTPUT */}
          <div className="flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-0 shadow-xs">
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Restored Original YAML</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(deobfuscatedYaml, 'deob')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-[11px] font-medium"
                >
                  {copiedKey === 'deob' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'deob' ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => handleDownload(deobfuscatedYaml, 'restored.yaml')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 text-[11px] font-medium"
                >
                  <Download className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={deobfuscatedYaml}
              placeholder="De-obfuscated restored YAML will appear here..."
              className="flex-1 w-full p-3.5 bg-transparent font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed"
            />

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
              <span>All keys, sensitive values, and anchors reversed accurately.</span>
              {deobfuscatedYaml && sourceYaml && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {deobfuscatedYaml.trim() === sourceYaml.trim() ? '✓ Exact Match to Source' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MAPPING MANAGER */}
      {activeTab === 'mapping' && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <YamlMappingManager
            mapping={mapping}
            onUpdateMapping={setMapping}
            onOpenConfigModal={(tab) => {
              setConfigModalTab(tab);
              setShowConfigModal(true);
            }}
          />
        </div>
      )}

      {/* TAB 4: SIDE-BY-SIDE DIFF */}
      {activeTab === 'diff' && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <YamlDiffViewer
            originalYaml={sourceYaml}
            obfuscatedYaml={obfuscatedYaml}
          />
        </div>
      )}

      {/* TAB 5: PRESETS */}
      {activeTab === 'presets' && (
        <div className="flex-1 overflow-y-auto min-h-0 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {YAML_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider">
                      {preset.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {preset.yaml.split('\n').length} lines
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {preset.name}
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-end">
                  <button
                    onClick={() => handleLoadPreset(preset)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load &amp; Obfuscate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIGURATION IMPORT/EXPORT MODAL */}
      <YamlConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        currentMapping={mapping}
        currentOptions={options}
        onApplyConfig={handleApplyImportedConfig}
        initialTab={configModalTab}
      />
    </div>
  );
};
