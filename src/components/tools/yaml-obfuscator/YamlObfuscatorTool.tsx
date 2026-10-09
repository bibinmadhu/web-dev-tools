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
  EyeOff,
  Ban,
  CheckSquare,
  Square,
  X,
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
  const [newExcludedValue, setNewExcludedValue] = useState<string>('');
  const [detectedValuesList, setDetectedValuesList] = useState<string[]>([]);
  const [showSelectiveValuesDrawer, setShowSelectiveValuesDrawer] = useState<boolean>(true);
  const [valueFilterText, setValueFilterText] = useState<string>('');
  const [valueStatusFilter, setValueStatusFilter] = useState<'all' | 'masked' | 'excluded'>('all');

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
    setDetectedValuesList(result.detectedValues);
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
    const res = obfuscateYaml(preset.yaml, options);
    setObfuscatedYaml(res.obfuscatedYaml);
    setMapping(res.mapping);
    setDetectedValuesList(res.detectedValues);
    setDeobfuscatedYaml('');
    setRoundtripStatus(null);
    setActiveTab('obfuscate');
  };

  const handleApplyImportedConfig = (config: YamlObfuscatorConfigExport, newMapping: YamlObfuscatorMapping) => {
    setOptions(config.options);
    setMapping(newMapping);
    setRoundtripStatus(null);
    const res = obfuscateYaml(sourceYaml, config.options, newMapping);
    setObfuscatedYaml(res.obfuscatedYaml);
    setDetectedValuesList(res.detectedValues);
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

  const handleAddExcludedValue = (customVal?: string) => {
    const val = (customVal !== undefined ? customVal : newExcludedValue).trim();
    if (!val) return;
    const currentExcluded = options.excludedValues || [];
    if (!currentExcluded.some((v) => v.toLowerCase() === val.toLowerCase())) {
      const updatedOptions = {
        ...options,
        excludedValues: [...currentExcluded, val],
      };
      setOptions(updatedOptions);
      const res = obfuscateYaml(sourceYaml, updatedOptions, mapping || undefined);
      setObfuscatedYaml(res.obfuscatedYaml);
      setMapping(res.mapping);
      setDetectedValuesList(res.detectedValues);
    }
    if (customVal === undefined) {
      setNewExcludedValue('');
    }
  };

  const handleRemoveExcludedValue = (valToRemove: string) => {
    const currentExcluded = options.excludedValues || [];
    const updated = currentExcluded.filter((v) => v.toLowerCase() !== valToRemove.toLowerCase());
    const updatedOptions = {
      ...options,
      excludedValues: updated,
    };
    setOptions(updatedOptions);
    const res = obfuscateYaml(sourceYaml, updatedOptions, mapping || undefined);
    setObfuscatedYaml(res.obfuscatedYaml);
    setMapping(res.mapping);
    setDetectedValuesList(res.detectedValues);
  };

  const handleToggleValueExcluded = (val: string) => {
    const currentExcluded = options.excludedValues || [];
    const isExcluded = currentExcluded.some((v) => v.toLowerCase() === val.toLowerCase());
    if (isExcluded) {
      handleRemoveExcludedValue(val);
    } else {
      handleAddExcludedValue(val);
    }
  };

  const handleExcludeAllDetectedValues = () => {
    const currentExcluded = options.excludedValues || [];
    const set = new Set(currentExcluded.map((v) => v.toLowerCase()));
    const toAdd = detectedValuesList.filter((v) => !set.has(v.toLowerCase()));
    if (toAdd.length === 0) return;
    const updated = [...currentExcluded, ...toAdd];
    const updatedOptions = { ...options, excludedValues: updated };
    setOptions(updatedOptions);
    const res = obfuscateYaml(sourceYaml, updatedOptions, mapping || undefined);
    setObfuscatedYaml(res.obfuscatedYaml);
    setMapping(res.mapping);
    setDetectedValuesList(res.detectedValues);
  };

  const handleClearAllExcludedValues = () => {
    const updatedOptions = { ...options, excludedValues: [] };
    setOptions(updatedOptions);
    const res = obfuscateYaml(sourceYaml, updatedOptions, mapping || undefined);
    setObfuscatedYaml(res.obfuscatedYaml);
    setMapping(res.mapping);
    setDetectedValuesList(res.detectedValues);
  };

  const handleSetObfuscationScope = (scope: 'values_only' | 'keys_and_values' | 'keys_only') => {
    const updatedOptions: YamlObfuscatorOptions = {
      ...options,
      obfuscateValues: scope === 'values_only' || scope === 'keys_and_values',
      obfuscateKeys: scope === 'keys_only' || scope === 'keys_and_values',
    };
    setOptions(updatedOptions);
    const res = obfuscateYaml(sourceYaml, updatedOptions, mapping || undefined);
    setObfuscatedYaml(res.obfuscatedYaml);
    setMapping(res.mapping);
    setDetectedValuesList(res.detectedValues);
  };

  const handleToggleAllValuesMode = (enableAll: boolean) => {
    const updatedOptions: YamlObfuscatorOptions = {
      ...options,
      obfuscateValues: true,
      valueMode: enableAll ? 'all_values' : 'sensitive_only',
    };
    setOptions(updatedOptions);
    const res = obfuscateYaml(sourceYaml, updatedOptions, mapping || undefined);
    setObfuscatedYaml(res.obfuscatedYaml);
    setMapping(res.mapping);
    setDetectedValuesList(res.detectedValues);
  };

  const handleObfuscateAllValues = () => {
    const updatedOptions: YamlObfuscatorOptions = {
      ...options,
      obfuscateValues: true,
      valueMode: 'all_values',
      excludedValues: [],
    };
    setOptions(updatedOptions);
    const res = obfuscateYaml(sourceYaml, updatedOptions, mapping || undefined);
    setObfuscatedYaml(res.obfuscatedYaml);
    setMapping(res.mapping);
    setDetectedValuesList(res.detectedValues);
  };

  const handleObfuscateSensitiveOnly = () => {
    const updatedOptions: YamlObfuscatorOptions = {
      ...options,
      obfuscateValues: true,
      valueMode: 'sensitive_only',
      excludedValues: [],
    };
    setOptions(updatedOptions);
    const res = obfuscateYaml(sourceYaml, updatedOptions, mapping || undefined);
    setObfuscatedYaml(res.obfuscatedYaml);
    setMapping(res.mapping);
    setDetectedValuesList(res.detectedValues);
  };

  const handleRemoveAllValuesObfuscation = () => {
    const currentExcluded = options.excludedValues || [];
    const set = new Set(currentExcluded.map((v) => v.toLowerCase()));
    const toAdd = detectedValuesList.filter((v) => !set.has(v.toLowerCase()));
    const updated = [...currentExcluded, ...toAdd];
    const updatedOptions: YamlObfuscatorOptions = { ...options, excludedValues: updated };
    setOptions(updatedOptions);
    const res = obfuscateYaml(sourceYaml, updatedOptions, mapping || undefined);
    setObfuscatedYaml(res.obfuscatedYaml);
    setMapping(res.mapping);
    setDetectedValuesList(res.detectedValues);
  };

  const isAllValuesMode = options.valueMode === 'all_values' || options.valueMode === 'all_strings';

  const excludedValuesSet = useMemo(() => {
    return new Set((options.excludedValues || []).map((v) => v.toLowerCase()));
  }, [options.excludedValues]);

  const { maskedValuesCount, excludedValuesCount } = useMemo(() => {
    let masked = 0;
    let excluded = 0;
    detectedValuesList.forEach((v) => {
      if (excludedValuesSet.has(v.toLowerCase())) {
        excluded++;
      } else if (options.obfuscateValues) {
        masked++;
      } else {
        excluded++;
      }
    });
    return { maskedValuesCount: masked, excludedValuesCount: excluded };
  }, [detectedValuesList, excludedValuesSet, options.obfuscateValues]);

  const filteredDetectedValues = useMemo(() => {
    return detectedValuesList.filter((val) => {
      const isExcluded = excludedValuesSet.has(val.toLowerCase());
      const isMasked = options.obfuscateValues && !isExcluded;
      if (valueStatusFilter === 'masked' && !isMasked) return false;
      if (valueStatusFilter === 'excluded' && !isExcluded) return false;
      if (valueFilterText.trim()) {
        return val.toLowerCase().includes(valueFilterText.trim().toLowerCase());
      }
      return true;
    });
  }, [detectedValuesList, excludedValuesSet, options.obfuscateValues, valueStatusFilter, valueFilterText]);

  // Run initial obfuscation on mount if empty
  useEffect(() => {
    if (!obfuscatedYaml && sourceYaml) {
      const res = obfuscateYaml(sourceYaml, options);
      setObfuscatedYaml(res.obfuscatedYaml);
      setMapping(res.mapping);
      setDetectedValuesList(res.detectedValues);
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
                checked={options.obfuscateValues}
                onChange={(e) => {
                  const updated = { ...options, obfuscateValues: e.target.checked };
                  setOptions(updated);
                  const res = obfuscateYaml(sourceYaml, updated, mapping || undefined);
                  setObfuscatedYaml(res.obfuscatedYaml);
                  setMapping(res.mapping);
                  setDetectedValuesList(res.detectedValues);
                }}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Obfuscate Sensitive Values</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">(Default: Enabled)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={options.obfuscateKeys}
                onChange={(e) => {
                  const updated = { ...options, obfuscateKeys: e.target.checked };
                  setOptions(updated);
                  const res = obfuscateYaml(sourceYaml, updated, mapping || undefined);
                  setObfuscatedYaml(res.obfuscatedYaml);
                  setMapping(res.mapping);
                  setDetectedValuesList(res.detectedValues);
                }}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Obfuscate Property Keys (Default: Disabled)</span>
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

          {/* Excluded Values & Keys Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-850">
            {/* Preserved / Excluded Values */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                  Preserved / Excluded Values ({options.excludedValues?.length || 0}):
                </label>
                {options.excludedValues && options.excludedValues.length > 0 && (
                  <button
                    onClick={handleClearAllExcludedValues}
                    className="text-[10px] text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newExcludedValue}
                  onChange={(e) => setNewExcludedValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddExcludedValue();
                  }}
                  placeholder="Add value to keep plaintext (e.g. localhost, prod)"
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-[11px] text-slate-900 dark:text-slate-100 font-mono flex-1"
                />
                <button
                  onClick={() => handleAddExcludedValue()}
                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-medium cursor-pointer"
                >
                  Exclude
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="flex items-center gap-1 text-[10px] text-slate-500 flex-wrap pt-0.5">
                <span>Quick:</span>
                {['production', 'staging', 'development', 'localhost', 'true', 'default', 'latest'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleAddExcludedValue(s)}
                    className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-mono cursor-pointer"
                  >
                    +{s}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                {(!options.excludedValues || options.excludedValues.length === 0) ? (
                  <span className="text-[10px] text-slate-400 italic p-0.5">No values excluded. All sensitive values will be obfuscated.</span>
                ) : (
                  options.excludedValues.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-mono text-amber-800 dark:text-amber-200"
                    >
                      {v}
                      <button
                        onClick={() => handleRemoveExcludedValue(v)}
                        className="text-amber-400 hover:text-rose-500 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Preserved / Excluded Keys */}
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Preserved / Excluded Keys ({options.excludedKeys.length}):
                </label>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newExcludedKey}
                  onChange={(e) => setNewExcludedKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddExcludedKey();
                  }}
                  placeholder="Add key (e.g. hostName)"
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-[11px] text-slate-900 dark:text-slate-100 font-mono flex-1"
                />
                <button
                  onClick={handleAddExcludedKey}
                  className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-medium cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                {options.excludedKeys.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300"
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
        </div>
      )}

      {/* QUICK TARGET SCOPE & ALL VALUES TOOLBAR (Always visible in Obfuscate tab) */}
      {activeTab === 'obfuscate' && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs shrink-0 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Obfuscate:</span>
            </div>

            {/* Values Checkbox */}
            <label
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium cursor-pointer transition-colors ${
                options.obfuscateValues
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
              }`}
              title="Obfuscate values (Client-specific data - Default: Enabled)"
            >
              <input
                type="checkbox"
                checked={options.obfuscateValues}
                onChange={(e) => {
                  const updated = { ...options, obfuscateValues: e.target.checked };
                  setOptions(updated);
                  const res = obfuscateYaml(sourceYaml, updated, mapping || undefined);
                  setObfuscatedYaml(res.obfuscatedYaml);
                  setMapping(res.mapping);
                  setDetectedValuesList(res.detectedValues);
                }}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold">Values</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                Default
              </span>
            </label>

            {/* Keys Checkbox */}
            <label
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium cursor-pointer transition-colors ${
                options.obfuscateKeys
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100'
              }`}
              title="Obfuscate YAML dictionary property keys (Default: Disabled)"
            >
              <input
                type="checkbox"
                checked={options.obfuscateKeys}
                onChange={(e) => {
                  const updated = { ...options, obfuscateKeys: e.target.checked };
                  setOptions(updated);
                  const res = obfuscateYaml(sourceYaml, updated, mapping || undefined);
                  setObfuscatedYaml(res.obfuscatedYaml);
                  setMapping(res.mapping);
                  setDetectedValuesList(res.detectedValues);
                }}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Keys</span>
              <span className="text-[10px] opacity-75 font-normal">
                (Names)
              </span>
            </label>

            {/* Scope Presets */}
            <div className="hidden lg:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
              <button
                onClick={() => handleSetObfuscationScope('values_only')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  options.obfuscateValues && !options.obfuscateKeys
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Default: Obfuscate values only, keys preserved"
              >
                Values Only
              </button>
              <button
                onClick={() => handleSetObfuscationScope('keys_and_values')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  options.obfuscateValues && options.obfuscateKeys
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Obfuscate both property keys and values"
              >
                Keys &amp; Values
              </button>
              <button
                onClick={() => handleSetObfuscationScope('keys_only')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  !options.obfuscateValues && options.obfuscateKeys
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Obfuscate keys only"
              >
                Keys Only
              </button>
            </div>

            {/* OPTION TO OBFUSCATE ALL VALUES IN YAML */}
            {options.obfuscateValues && (
              <div className="flex items-center gap-1.5 pl-2 sm:border-l border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Value Scope:
                </span>
                <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => handleToggleAllValuesMode(true)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      isAllValuesMode
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Obfuscate ALL values in the YAML (all strings and data)"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>All Values in YAML</span>
                  </button>
                  <button
                    onClick={() => handleToggleAllValuesMode(false)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      !isAllValuesMode
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Obfuscate sensitive values only (passwords, tokens, credentials, URLs)"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Sensitive Only</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Action Buttons to Remove Obfuscation for All or Manage Specific */}
          <div className="flex items-center gap-2">
            {/* One-click button: Remove Obfuscation for All Values */}
            <button
              onClick={handleRemoveAllValuesObfuscation}
              disabled={detectedValuesList.length === 0 || maskedValuesCount === 0}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 border border-rose-300 dark:border-rose-800/80 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Remove obfuscation for all values in this YAML (keeps all values plaintext)"
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-500" />
              <span>Remove Obfuscation for All</span>
            </button>

            {/* One-click button: Obfuscate All Values */}
            <button
              onClick={handleObfuscateAllValues}
              disabled={detectedValuesList.length === 0}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 border ${
                isAllValuesMode && options.excludedValues?.length === 0
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
              title="Obfuscate all values in YAML with no exclusions"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Obfuscate All Values</span>
            </button>

            {/* Toggle Values Exceptions Drawer */}
            <button
              onClick={() => setShowSelectiveValuesDrawer(!showSelectiveValuesDrawer)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 border ${
                showSelectiveValuesDrawer
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
              title="Toggle value-by-value selective obfuscation manager"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-500" />
              <span>{showSelectiveValuesDrawer ? 'Hide Values Manager' : 'Manage Values'}</span>
              {excludedValuesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold">
                  {excludedValuesCount} plaintext
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* VALUES MANAGEMENT & PLAINTEXT EXCEPTIONS DRAWER (In Obfuscate tab) */}
      {activeTab === 'obfuscate' && showSelectiveValuesDrawer && (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 shrink-0 text-xs shadow-xs animate-in fade-in duration-100">
          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <EyeOff className="w-4 h-4 text-amber-500" />
                <span>Values Obfuscation &amp; Plaintext Exceptions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  {detectedValuesList.length} Total Values
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                  {maskedValuesCount} Masked
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
                  {excludedValuesCount} Plaintext (Obfuscation Removed)
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={handleRemoveAllValuesObfuscation}
                disabled={detectedValuesList.length === 0 || maskedValuesCount === 0}
                className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Remove obfuscation for all values in YAML"
              >
                <Ban className="w-3 h-3 text-rose-500" />
                <span>Remove Obfuscation for All Values</span>
              </button>
              <button
                onClick={handleObfuscateAllValues}
                className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                title="Obfuscate all values across the entire YAML"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Obfuscate All Values</span>
              </button>
              <button
                onClick={handleObfuscateSensitiveOnly}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                title="Reset to sensitive-values-only obfuscation (Default)"
              >
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>Obfuscate Sensitive Only</span>
              </button>
              {excludedValuesCount > 0 && (
                <button
                  onClick={handleClearAllExcludedValues}
                  className="px-2 py-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  title="Clear all value exclusions"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Exclusions</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter, search and custom exclusion row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Search & Status Filter */}
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={valueFilterText}
                  onChange={(e) => setValueFilterText(e.target.value)}
                  placeholder="Search candidate values..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="inline-flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                <button
                  onClick={() => setValueStatusFilter('all')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                    valueStatusFilter === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All ({detectedValuesList.length})
                </button>
                <button
                  onClick={() => setValueStatusFilter('masked')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                    valueStatusFilter === 'masked'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Masked ({maskedValuesCount})
                </button>
                <button
                  onClick={() => setValueStatusFilter('excluded')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                    valueStatusFilter === 'excluded'
                      ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Plaintext ({excludedValuesCount})
                </button>
              </div>
            </div>

            {/* Quick Add Custom Excluded Value */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[260px] max-w-md">
              <input
                type="text"
                value={newExcludedValue}
                onChange={(e) => setNewExcludedValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddExcludedValue();
                }}
                placeholder="Add custom value to keep plaintext..."
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                onClick={() => handleAddExcludedValue()}
                disabled={!newExcludedValue.trim()}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0"
              >
                Exclude
              </button>
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="flex items-center gap-1 text-[10px] text-slate-500 flex-wrap">
            <span className="font-medium">Quick Exclude:</span>
            {['production', 'staging', 'development', 'localhost', 'postgres', 'latest', 'admin', '8080'].map((s) => {
              const isExcluded = excludedValuesSet.has(s.toLowerCase());
              return (
                <button
                  key={s}
                  onClick={() => handleToggleValueExcluded(s)}
                  className={`px-1.5 py-0.5 rounded font-mono transition-colors cursor-pointer border ${
                    isExcluded
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-bold'
                      : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {isExcluded ? '✓ ' : '+'}{s}
                </button>
              );
            })}
          </div>

          {/* Interactive Value Chips Grid */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span>Click any value chip below to toggle its obfuscation:</span>
              <span className="text-[10px] text-slate-400 font-normal">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Masked</span> (Click to keep plaintext) | <span className="text-amber-600 dark:text-amber-400 font-semibold">Plaintext</span> (Click to obfuscate)
              </span>
            </div>

            {detectedValuesList.length === 0 ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                No values detected in YAML source yet. Paste YAML on the left to see detected candidate values.
              </div>
            ) : filteredDetectedValues.length === 0 ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                No values match the current search filter.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800">
                {filteredDetectedValues.map((val) => {
                  const isExcluded = excludedValuesSet.has(val.toLowerCase());
                  const isMasked = options.obfuscateValues && !isExcluded;

                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleToggleValueExcluded(val)}
                      className={`group px-2 py-1 rounded-md border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                        isExcluded
                          ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-950/90 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-2xs'
                          : isMasked
                          ? 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-950/90 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title={
                        isExcluded
                          ? `Plaintext (Obfuscation removed). Click to enable obfuscation for "${val}"`
                          : `Currently Masked. Click to REMOVE obfuscation (keep plaintext) for "${val}"`
                      }
                    >
                      {isMasked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[200px]" title={val}>
                        {val}
                      </span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-sans font-bold uppercase tracking-wider shrink-0 ${
                          isExcluded
                            ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                            : 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                        }`}
                      >
                        {isExcluded ? 'Plaintext' : 'Masked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
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
            excludedValues={options.excludedValues || []}
            onToggleExcludeValue={handleToggleValueExcluded}
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
