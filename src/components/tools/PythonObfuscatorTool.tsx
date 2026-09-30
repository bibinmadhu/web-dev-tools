import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  Code2,
  FileCode,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  Settings,
  Search,
  BookOpen,
  Zap,
  ArrowRightLeft,
  FileJson,
  Layers,
  Sparkles,
  Trash2,
  Plus,
  Maximize2,
  Minimize2,
  Globe,
  Link2,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Eye,
  Sliders
} from 'lucide-react';
import {
  obfuscatePythonCode,
  deobfuscatePythonCode,
  PythonObfuscationMapping,
  PythonObfuscatorOptions,
  DEFAULT_PYTHON_OBFUSCATOR_OPTIONS,
  PythonNamingStyle,
  UrlObfuscationMode,
  PythonDeobfuscationResult
} from '../../utils/pythonObfuscator';
import { PYTHON_PRESETS, PythonPreset } from '../../utils/pythonPresets';

export interface PythonObfuscatorToolProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const PythonObfuscatorTool: React.FC<PythonObfuscatorToolProps> = ({
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'obfuscate' | 'deobfuscate' | 'mapping' | 'settings'>('obfuscate');

  // Selected Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PYTHON_PRESETS[0].id);

  // Code states
  const [sourceCode, setSourceCode] = useState<string>(PYTHON_PRESETS[0].code);
  const [obfuscatedCode, setObfuscatedCode] = useState<string>('');
  const [deobfInputCode, setDeobfInputCode] = useState<string>('');
  const [deobfuscatedResult, setDeobfuscatedResult] = useState<PythonDeobfuscationResult | null>(null);

  // Mapping state
  const [mapping, setMapping] = useState<PythonObfuscationMapping>({
    version: '1.0',
    timestamp: new Date().toISOString(),
    namingStyle: 'hexadecimal',
    urlMode: 'masked_url',
    classes: {},
    functions: {},
    variables: {},
    urls: {},
    reverseMapping: {},
  });

  const [mappingJsonInput, setMappingJsonInput] = useState<string>('');
  const [mappingSearchQuery, setMappingSearchQuery] = useState<string>('');
  const [mappingCategoryFilter, setMappingCategoryFilter] = useState<'all' | 'urls' | 'classes' | 'functions' | 'variables'>('all');

  // Configuration options
  const [options, setOptions] = useState<PythonObfuscatorOptions>(DEFAULT_PYTHON_OBFUSCATOR_OPTIONS);

  // UI feedback states
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedMapping, setCopiedMapping] = useState<boolean>(false);
  const [copiedDeobf, setCopiedDeobf] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mappingFileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Run Obfuscation
  const handleRunObfuscation = () => {
    const res = obfuscatePythonCode(sourceCode, options);
    setObfuscatedCode(res.obfuscatedCode);
    setMapping(res.mapping);
    setMappingJsonInput(JSON.stringify(res.mapping, null, 2));

    // If deobfuscate input is empty, prefill with this obfuscated code
    if (!deobfInputCode) {
      setDeobfInputCode(res.obfuscatedCode);
    }
  };

  useEffect(() => {
    handleRunObfuscation();
  }, [sourceCode, options]);

  // Load Preset
  const handleSelectPreset = (presetId: string) => {
    const preset = PYTHON_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPresetId(presetId);
      setSourceCode(preset.code);
      showStatus(`Loaded preset "${preset.name}" (${preset.urlCount} URLs)`);
    }
  };

  // Run Deobfuscation
  const handleRunDeobfuscation = () => {
    try {
      let mapToUse = mapping;
      if (mappingJsonInput.trim()) {
        try {
          mapToUse = JSON.parse(mappingJsonInput);
        } catch (e: any) {
          showStatus(`Mapping JSON Error: ${e.message}`);
          return;
        }
      }

      const res = deobfuscatePythonCode(deobfInputCode || obfuscatedCode, mapToUse);
      setDeobfuscatedResult(res);
      showStatus(
        `Successfully restored ${res.stats.urlsRestored} URLs and ${res.stats.totalReplacements} symbols!`
      );
    } catch (err: any) {
      showStatus(`De-obfuscation error: ${err.message}`);
    }
  };

  // File Upload for source code
  const handleSourceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setSourceCode(text);
      showStatus(`Uploaded ${file.name}`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // File Upload for mapping JSON
  const handleMappingFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = JSON.parse(text);
        setMapping(parsed);
        setMappingJsonInput(text);
        showStatus(`Loaded mapping file ${file.name}`);
      } catch (e: any) {
        showStatus(`Invalid mapping JSON: ${e.message}`);
      }
    };
    reader.readAsText(file);
    if (mappingFileInputRef.current) mappingFileInputRef.current.value = '';
  };

  // Download Obfuscated Python
  const handleDownloadObfuscated = () => {
    const blob = new Blob([obfuscatedCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'obfuscated_script.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus('Downloaded obfuscated_script.py');
  };

  // Download De-obfuscated Python
  const handleDownloadDeobfuscated = () => {
    if (!deobfuscatedResult?.deobfuscatedCode) return;
    const blob = new Blob([deobfuscatedResult.deobfuscatedCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'restored_script.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus('Downloaded restored_script.py');
  };

  // Download Mapping JSON
  const handleDownloadMapping = () => {
    const blob = new Blob([mappingJsonInput || JSON.stringify(mapping, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'python_obfuscation_mapping.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus('Downloaded python_obfuscation_mapping.json');
  };

  // Copy helpers
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    showStatus('Obfuscated Python code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyMapping = () => {
    navigator.clipboard.writeText(mappingJsonInput || JSON.stringify(mapping, null, 2));
    setCopiedMapping(true);
    showStatus('Mapping JSON copied to clipboard!');
    setTimeout(() => setCopiedMapping(false), 2000);
  };

  const handleCopyDeobf = () => {
    if (deobfuscatedResult?.deobfuscatedCode) {
      navigator.clipboard.writeText(deobfuscatedResult.deobfuscatedCode);
      setCopiedDeobf(true);
      showStatus('De-obfuscated code copied!');
      setTimeout(() => setCopiedDeobf(false), 2000);
    }
  };

  // Filtered Mapping Table Items
  const filteredMappingItems = useMemo(() => {
    const list: Array<{
      category: 'URL' | 'Class' | 'Function' | 'Variable';
      original: string;
      obfuscated: string;
    }> = [];

    if (mapping.urls) {
      Object.entries(mapping.urls).forEach(([orig, obf]) => {
        list.push({ category: 'URL', original: String(orig), obfuscated: String(obf) });
      });
    }

    if (mapping.classes) {
      Object.entries(mapping.classes).forEach(([orig, obf]) => {
        list.push({ category: 'Class', original: String(orig), obfuscated: String(obf) });
      });
    }

    if (mapping.functions) {
      Object.entries(mapping.functions).forEach(([orig, obf]) => {
        list.push({ category: 'Function', original: String(orig), obfuscated: String(obf) });
      });
    }

    if (mapping.variables) {
      Object.entries(mapping.variables).forEach(([orig, obf]) => {
        list.push({ category: 'Variable', original: String(orig), obfuscated: String(obf) });
      });
    }

    return list.filter((item) => {
      // Category filter
      if (mappingCategoryFilter === 'urls' && item.category !== 'URL') return false;
      if (mappingCategoryFilter === 'classes' && item.category !== 'Class') return false;
      if (mappingCategoryFilter === 'functions' && item.category !== 'Function') return false;
      if (mappingCategoryFilter === 'variables' && item.category !== 'Variable') return false;

      // Search query
      if (mappingSearchQuery.trim()) {
        const q = mappingSearchQuery.toLowerCase();
        return item.original.toLowerCase().includes(q) || item.obfuscated.toLowerCase().includes(q);
      }
      return true;
    });
  }, [mapping, mappingCategoryFilter, mappingSearchQuery]);

  const urlCount = Object.keys(mapping.urls || {}).length;
  const classCount = Object.keys(mapping.classes || {}).length;
  const funcCount = Object.keys(mapping.functions || {}).length;
  const varCount = Object.keys(mapping.variables || {}).length;
  const totalMangled = urlCount + classCount + funcCount + varCount;

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Left: Tool Brand & Preset Picker */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Python Code Obfuscator
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>{urlCount} URLs Protected</span>
                </span>
              </div>
            </div>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Preset:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {PYTHON_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.urlCount} URLs)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Quick Action Buttons & Fullscreen */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload .py file"
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Upload .py</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.txt"
            onChange={handleSourceFileUpload}
            className="hidden"
          />

          {/* Re-run Obfuscation */}
          <button
            onClick={handleRunObfuscation}
            title="Re-run obfuscation with current settings"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Re-Obfuscate</span>
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400 transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* Copy Obfuscated Code */}
          <button
            onClick={() => handleCopyCode(obfuscatedCode)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('obfuscate')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'obfuscate'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Obfuscate Code</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('deobfuscate');
            if (!deobfInputCode) setDeobfInputCode(obfuscatedCode);
          }}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'deobfuscate'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>De-Obfuscate Modified Code</span>
          {deobfuscatedResult && (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('mapping')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'mapping'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Mapping Registry</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
            {totalMangled}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Obfuscation Settings</span>
        </button>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* TAB 1: OBFUSCATE CODE */}
      {activeTab === 'obfuscate' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-slate-600 dark:text-slate-400 flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                <Globe className="w-3.5 h-3.5" />
                {urlCount} URLs Obfuscated
              </span>
              <span>•</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {classCount} Classes Renamed
              </span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {funcCount} Functions / Methods
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {varCount} Variables / Attributes
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span>Style: <strong className="text-slate-800 dark:text-slate-200 uppercase">{options.namingStyle}</strong></span>
              <span>•</span>
              <span>URL Mode: <strong className="text-slate-800 dark:text-slate-200 uppercase">{options.urlObfuscationMode}</strong></span>
            </div>
          </div>

          {/* Editors Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Source Python Editor */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  ORIGINAL PYTHON SOURCE
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSourceCode('')}
                    className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                    title="Clear input"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm overflow-hidden flex-1">
                <textarea
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  placeholder="Paste Python code here..."
                  spellCheck={false}
                  rows={isFullScreen ? 24 : 18}
                  className="w-full h-full p-4 font-mono text-xs text-slate-200 bg-transparent focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
                />
              </div>
            </div>

            {/* Obfuscated Python Editor */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  OBFUSCATED PYTHON (WITH MASKED URLS)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDeobfInputCode(obfuscatedCode);
                      setActiveTab('deobfuscate');
                      showStatus('Sent obfuscated code to De-Obfuscate tab');
                    }}
                    className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                    title="Send to De-obfuscator"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Test Deobfuscate</span>
                  </button>
                  <button
                    onClick={handleDownloadObfuscated}
                    className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                    title="Download .py file"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm overflow-hidden flex-1">
                <textarea
                  readOnly
                  value={obfuscatedCode}
                  spellCheck={false}
                  rows={isFullScreen ? 24 : 18}
                  className="w-full h-full p-4 font-mono text-xs text-indigo-300 dark:text-indigo-300 bg-transparent focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DE-OBFUSCATE MODIFIED CODE */}
      {activeTab === 'deobfuscate' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-indigo-500" />
                De-Obfuscate Modified Python Code using Mapping
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Paste modified code containing obfuscated identifiers or masked URLs. The mapping will restore all original names and full URL endpoints.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => mappingFileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-500" />
                <span>Load Mapping JSON</span>
              </button>
              <input
                ref={mappingFileInputRef}
                type="file"
                accept=".json"
                onChange={handleMappingFileUpload}
                className="hidden"
              />

              <button
                onClick={handleRunDeobfuscation}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Restore Code</span>
              </button>
            </div>
          </div>

          {/* Deobfuscate Canvas: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Obfuscated/Modified Code */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                  OBFUSCATED / MODIFIED PYTHON CODE
                </span>
                <button
                  onClick={() => setDeobfInputCode(obfuscatedCode)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                >
                  Use Latest Obfuscated Code
                </button>
              </div>

              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm overflow-hidden flex-1">
                <textarea
                  value={deobfInputCode}
                  onChange={(e) => setDeobfInputCode(e.target.value)}
                  placeholder="Paste obfuscated or modified Python code here..."
                  spellCheck={false}
                  rows={isFullScreen ? 22 : 16}
                  className="w-full h-full p-4 font-mono text-xs text-slate-200 bg-transparent focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Restored Output Code */}
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  RESTORED DE-OBFUSCATED CODE
                </span>
                {deobfuscatedResult && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyDeobf}
                      className="text-slate-400 hover:text-indigo-400 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedDeobf ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDeobf ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadDeobfuscated}
                      className="text-slate-400 hover:text-indigo-400 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm overflow-hidden flex-1">
                {deobfuscatedResult ? (
                  <textarea
                    readOnly
                    value={deobfuscatedResult.deobfuscatedCode}
                    spellCheck={false}
                    rows={isFullScreen ? 22 : 16}
                    className="w-full h-full p-4 font-mono text-xs text-emerald-300 dark:text-emerald-300 bg-transparent focus:outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                    <RotateCcw className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-xs">Click "Restore Code" to de-obfuscate using the active mapping.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MAPPING REGISTRY */}
      {activeTab === 'mapping' && (
        <div className="space-y-4">
          {/* Mapping Control Header */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Category Filter:</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                  {(['all', 'urls', 'classes', 'functions', 'variables'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMappingCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                        mappingCategoryFilter === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {cat === 'urls' ? `URLs (${urlCount})` : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMapping}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedMapping ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMapping ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={handleDownloadMapping}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Mapping</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={mappingSearchQuery}
                onChange={(e) => setMappingSearchQuery(e.target.value)}
                placeholder="Search mapping by original URL, symbol, or obfuscated token..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Mapping Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full border-collapse text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4 w-28">Type</th>
                    <th className="py-2.5 px-4">Original Value / URL</th>
                    <th className="py-2.5 px-4">Obfuscated Replacement</th>
                    <th className="py-2.5 px-4 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                  {filteredMappingItems.length > 0 ? (
                    filteredMappingItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="py-2 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                              item.category === 'URL'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                : item.category === 'Class'
                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                                : item.category === 'Function'
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                : 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20'
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-800 dark:text-slate-200 break-all select-all">
                          {item.original}
                        </td>
                        <td className="py-2 px-4 text-indigo-600 dark:text-indigo-400 font-bold break-all select-all">
                          {item.obfuscated}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.obfuscated);
                              showStatus(`Copied token ${item.obfuscated}`);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
                            title="Copy token"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                        No mapping items found matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          {/* URL Obfuscation Preferences */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              URL Obfuscation & Masking Preferences
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <label className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.obfuscateUrls}
                    onChange={(e) => setOptions({ ...options, obfuscateUrls: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>Obfuscate URLs (HTTP, HTTPS, WSS, FTP)</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Detects API endpoints, webhooks, and remote URLs, replacing them with reversible mapped tokens or internal masked routes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  URL Obfuscation Mode:
                </label>
                <select
                  value={options.urlObfuscationMode}
                  onChange={(e) => setOptions({ ...options, urlObfuscationMode: e.target.value as UrlObfuscationMode })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="masked_url">Masked Internal Route (e.g. https://obf-endpoint-01.internal/route_1)</option>
                  <option value="token">Tokenized Placeholder (e.g. __URL_OBF_1__)</option>
                  <option value="base64">Base64 Encoded Format</option>
                </select>
              </div>
            </div>
          </div>

          {/* Identifier Naming Style */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Naming & Mangling Styles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                { id: 'hexadecimal', title: 'Hexadecimal', desc: 'Cls_0x01, fn_0x01, v_0x01' },
                { id: 'alphabetical', title: 'Alphabetical', desc: 'Cls_A, fn_a, v_a' },
                { id: 'numeric', title: 'Numeric', desc: 'Cls_1, fn_1, v_1' },
                { id: 'random', title: 'Randomized Hash', desc: 'Cls_A4F1, fn_8b2c, v_5e10' },
                { id: 'prefixed', title: 'Custom Prefixes', desc: 'Customizable prefix rules' },
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => setOptions({ ...options, namingStyle: style.id as PythonNamingStyle })}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    options.namingStyle === style.id
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-400'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">{style.title}</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{style.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Code Preservation & Stripping Rules
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.obfuscateClasses}
                  onChange={(e) => setOptions({ ...options, obfuscateClasses: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Obfuscate Classes</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.obfuscateFunctions}
                  onChange={(e) => setOptions({ ...options, obfuscateFunctions: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Obfuscate Functions & Methods</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.obfuscateVariables}
                  onChange={(e) => setOptions({ ...options, obfuscateVariables: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Obfuscate Variables & Attributes</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.preserveSpecialMethods}
                  onChange={(e) => setOptions({ ...options, preserveSpecialMethods: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Preserve Dunder Methods (__init__, etc.)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.stripComments}
                  onChange={(e) => setOptions({ ...options, stripComments: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Strip Comments (# ...)</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.stripDocstrings}
                  onChange={(e) => setOptions({ ...options, stripDocstrings: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <span>Strip Docstrings (""" ... """)</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
