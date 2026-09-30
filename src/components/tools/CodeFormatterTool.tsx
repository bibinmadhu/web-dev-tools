import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  Code,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Settings2,
  Maximize2,
  Minimize2,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
  FileCode,
  Columns,
  Eye,
  GitCompare,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  FormatterOptions,
  defaultFormatterOptions,
  formatCode,
  detectLanguage,
  FormatResult
} from '../../utils/codeFormatters';

export interface CodeFormatterToolProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const CodeFormatterTool: React.FC<CodeFormatterToolProps> = ({
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  // Active Language
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('python');

  // Input & Output Code
  const initialLangDef = SUPPORTED_LANGUAGES.find((l) => l.id === 'python') || SUPPORTED_LANGUAGES[0];
  const [inputCode, setInputCode] = useState<string>(initialLangDef.sample);

  // Settings
  const [options, setOptions] = useState<FormatterOptions>(() => {
    return {
      ...defaultFormatterOptions,
      indentSize: 4, // Default 4 for Python / Java
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'diff' | 'output'>('split');
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When language switches, adjust default indent recommendation (e.g. 4 for python/java, 2 for yaml/json/html)
  const handleSelectLanguage = (lang: SupportedLanguage, shouldLoadSample = false) => {
    setSelectedLanguage(lang);
    if (lang === 'python' || lang === 'java') {
      setOptions((prev) => ({ ...prev, indentSize: 4 }));
    } else {
      setOptions((prev) => ({ ...prev, indentSize: 2 }));
    }

    if (shouldLoadSample) {
      const def = SUPPORTED_LANGUAGES.find((l) => l.id === lang);
      if (def) {
        setInputCode(def.sample);
        showStatus(`Loaded ${def.name} sample code`);
      }
    }
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Perform Formatting
  const formatResult: FormatResult = useMemo(() => {
    return formatCode(inputCode, selectedLanguage, options);
  }, [inputCode, selectedLanguage, options]);

  // Handle auto-detect language
  const handleAutoDetect = () => {
    if (!inputCode.trim()) {
      showStatus('Input is empty to detect');
      return;
    }
    const detected = detectLanguage(inputCode);
    const def = SUPPORTED_LANGUAGES.find((l) => l.id === detected);
    setSelectedLanguage(detected);
    if (detected === 'python' || detected === 'java') {
      setOptions((prev) => ({ ...prev, indentSize: 4 }));
    } else {
      setOptions((prev) => ({ ...prev, indentSize: 2 }));
    }
    showStatus(`Detected format: ${def?.name || detected}`);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputCode(content);

      // Auto switch language based on extension
      if (extension === 'py') handleSelectLanguage('python');
      else if (extension === 'yaml' || extension === 'yml') handleSelectLanguage('yaml');
      else if (extension === 'java') handleSelectLanguage('java');
      else if (extension === 'js' || extension === 'jsx' || extension === 'mjs') handleSelectLanguage('javascript');
      else if (extension === 'ts' || extension === 'tsx') handleSelectLanguage('typescript');
      else if (extension === 'json') handleSelectLanguage('json');
      else if (extension === 'html' || extension === 'htm') handleSelectLanguage('html');
      else if (extension === 'xml' || extension === 'svg') handleSelectLanguage('xml');
      else if (extension === 'css' || extension === 'scss' || extension === 'less') handleSelectLanguage('css');
      else if (extension === 'sql') handleSelectLanguage('sql');
      else if (extension === 'md' || extension === 'markdown') handleSelectLanguage('markdown');
      else if (extension === 'sh' || extension === 'bash') handleSelectLanguage('shell');
      else handleAutoDetect();

      showStatus(`Uploaded ${file.name}`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle download
  const handleDownload = () => {
    const def = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];
    const filename = `formatted_${selectedLanguage}.${def.extension}`;
    const blob = new Blob([formatResult.formattedCode], { type: def.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus(`Downloaded ${filename}`);
  };

  // Handle copy formatted code
  const handleCopy = () => {
    navigator.clipboard.writeText(formatResult.formattedCode);
    setCopied(true);
    showStatus('Formatted code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Swap (use output as input)
  const handleSwap = () => {
    if (formatResult.formattedCode) {
      setInputCode(formatResult.formattedCode);
      showStatus('Replaced input with formatted code');
    }
  };

  // Diff lines generator for Diff View
  const diffData = useMemo(() => {
    if (viewMode !== 'diff') return [];
    const origLines = inputCode.split('\n');
    const formLines = formatResult.formattedCode.split('\n');
    const maxLen = Math.max(origLines.length, formLines.length);

    const rows = [];
    for (let i = 0; i < maxLen; i++) {
      const orig = origLines[i] !== undefined ? origLines[i] : '';
      const form = formLines[i] !== undefined ? formLines[i] : '';
      const isDifferent = orig !== form;
      rows.push({
        lineNum: i + 1,
        orig,
        form,
        isDifferent,
      });
    }
    return rows;
  }, [inputCode, formatResult.formattedCode, viewMode]);

  const activeDef = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // Size reduction / increase calculation
  const charDelta = formatResult.stats.formattedChars - formatResult.stats.originalChars;
  const percentDelta =
    formatResult.stats.originalChars > 0
      ? Math.round((charDelta / formatResult.stats.originalChars) * 1000) / 10
      : 0;

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Left: Language Selection & Quick Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mr-1">
            <Code className="w-4 h-4 text-indigo-500" />
            <span>Format:</span>
          </div>

          {/* Primary Quick Switch Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none max-w-full">
            {(['python', 'yaml', 'java', 'javascript', 'typescript', 'json', 'sql', 'html', 'css', 'markdown', 'shell'] as SupportedLanguage[]).map(
              (langId) => {
                const def = SUPPORTED_LANGUAGES.find((l) => l.id === langId)!;
                const isSelected = selectedLanguage === langId;
                return (
                  <button
                    key={langId}
                    onClick={() => handleSelectLanguage(langId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{def.name}</span>
                    {isSelected && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/50 text-white">
                        {def.badge}
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Auto Detect Button */}
          <button
            onClick={handleAutoDetect}
            title="Auto-detect programming or markup language from code"
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Auto-Detect</span>
          </button>

          {/* Load Sample Button */}
          <button
            onClick={() => handleSelectLanguage(selectedLanguage, true)}
            title={`Load ${activeDef.name} sample snippet`}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Sample</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload source file"
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".py,.yaml,.yml,.java,.js,.jsx,.ts,.tsx,.json,.html,.xml,.svg,.css,.scss,.sql,.md,.sh,.bash,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Settings Drawer Button */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isSettingsOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>Options</span>
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

          {/* Copy Formatted Button */}
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Format Settings Bar */}
      {isSettingsOpen && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-indigo-500" />
              Formatting Engine Preferences ({activeDef.name}):
            </span>
            <button
              onClick={() => setOptions({ ...defaultFormatterOptions })}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
            {/* Indent Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Indent Style:
              </label>
              <select
                value={options.indentType}
                onChange={(e) => setOptions({ ...options, indentType: e.target.value as any })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="spaces">Spaces</option>
                <option value="tabs">Tabs</option>
              </select>
            </div>

            {/* Indent Size */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Indent Size:
              </label>
              <select
                value={options.indentSize}
                onChange={(e) => setOptions({ ...options, indentSize: parseInt(e.target.value, 10) })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces (PEP 8 / Java)</option>
                <option value={8}>8 Spaces</option>
              </select>
            </div>

            {/* Quotes preference (for JS/TS/JSON) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Quotes:
              </label>
              <select
                value={options.quotes}
                onChange={(e) => setOptions({ ...options, quotes: e.target.value as any })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="preserve">Preserve Quotes</option>
                <option value="single">Single Quotes (')</option>
                <option value="double">Double Quotes (")</option>
              </select>
            </div>

            {/* Semicolons (for JS/TS) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Semicolons (JS/TS):
              </label>
              <select
                value={options.semicolons}
                onChange={(e) => setOptions({ ...options, semicolons: e.target.value as any })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="always">Always Semicolons (;)</option>
                <option value="never">Never (Standard JS)</option>
                <option value="preserve">Preserve</option>
              </select>
            </div>

            {/* Brace Placement (Java / JS / CSS) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Brace Style:
              </label>
              <select
                value={options.braceStyle}
                onChange={(e) => setOptions({ ...options, braceStyle: e.target.value as any })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="same-line">Same Line (K&R)</option>
                <option value="next-line">Next Line (Allman)</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-4 flex-wrap pt-1 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={options.sortKeys ?? false}
                onChange={(e) => setOptions({ ...options, sortKeys: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span>Alphabetize Keys (JSON / YAML)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={options.sortImports ?? false}
                onChange={(e) => setOptions({ ...options, sortImports: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span>Sort Imports (Java / Python / JS)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={options.uppercaseSqlKeywords ?? true}
                onChange={(e) => setOptions({ ...options, uppercaseSqlKeywords: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span>Uppercase SQL Keywords</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={options.minify ?? false}
                onChange={(e) => setOptions({ ...options, minify: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <span>Minify / Compact Mode (JSON/CSS)</span>
            </label>
          </div>
        </div>
      )}

      {/* Syntax Error / Validation Banner */}
      {!formatResult.isValid && formatResult.error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-400 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <div>
              <span className="font-bold">Syntax Parsing Issue in {activeDef.name}:</span>{' '}
              <span>{formatResult.error}</span>
              {formatResult.errorLine && (
                <span className="ml-1 font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50">
                  Line {formatResult.errorLine}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Toast Message */}
      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* View Mode & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            onClick={() => setViewMode('diff')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'diff'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Diff Mode</span>
          </button>
          <button
            onClick={() => setViewMode('output')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'output'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Formatted Only</span>
          </button>
        </div>

        {/* Metrics Chip */}
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] flex-wrap">
          <span>
            {formatResult.stats.originalLines} lines → {formatResult.stats.formattedLines} lines
          </span>
          <span>•</span>
          <span>
            {formatResult.stats.originalChars} chars → {formatResult.stats.formattedChars} chars
            {percentDelta !== 0 && (
              <span className={`ml-1 font-semibold ${percentDelta < 0 ? 'text-emerald-500' : 'text-blue-500'}`}>
                ({percentDelta > 0 ? `+${percentDelta}%` : `${percentDelta}%`})
              </span>
            )}
          </span>
          <span>•</span>
          <span className="text-indigo-500 dark:text-indigo-400 font-semibold">
            ⚡ {formatResult.stats.durationMs}ms
          </span>
        </div>
      </div>

      {/* Editor Main Canvas */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Unformatted Input Column */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                RAW / UNFORMATTED {activeDef.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInputCode('')}
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
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder={`Paste unformatted ${activeDef.name} code here...`}
                spellCheck={false}
                rows={isFullScreen ? 24 : 16}
                className="w-full h-full p-4 font-mono text-xs text-slate-200 bg-transparent focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
              />
            </div>
          </div>

          {/* Formatted Output Column */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                CLEAN FORMATTED CODE ({activeDef.name})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSwap}
                  className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                  title="Use formatted code as input for further edits"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Use as Input</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                  title="Download file"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm overflow-hidden flex-1">
              <textarea
                readOnly
                value={formatResult.formattedCode}
                spellCheck={false}
                rows={isFullScreen ? 24 : 16}
                className="w-full h-full p-4 font-mono text-xs text-indigo-300 dark:text-indigo-300 bg-transparent focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Diff View */}
      {viewMode === 'diff' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                <GitCompare className="w-4 h-4 text-indigo-400" />
                Line-by-Line Formatter Diff
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-500/40 inline-block"></span>
                <span>Original</span>
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block"></span>
                <span>Formatted</span>
              </span>
            </div>
            <span className="font-mono text-[11px]">{diffData.length} lines compared</span>
          </div>

          <div
            className={`font-mono text-xs overflow-y-auto ${
              isFullScreen ? 'max-h-[calc(100vh-280px)]' : 'max-h-96'
            }`}
          >
            <table className="w-full border-collapse">
              <tbody>
                {diffData.map((row) => (
                  <tr
                    key={row.lineNum}
                    className={`border-b border-slate-900/60 ${
                      row.isDifferent ? 'bg-indigo-950/20' : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <td className="w-12 py-1 px-3 text-right text-slate-600 select-none text-[11px] border-r border-slate-800/80 bg-slate-900/50">
                      {row.lineNum}
                    </td>
                    <td
                      className={`py-1 px-3 w-1/2 font-mono text-[11px] whitespace-pre overflow-x-auto border-r border-slate-800/80 ${
                        row.isDifferent && row.orig
                          ? 'bg-rose-950/20 text-rose-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.orig || ' '}
                    </td>
                    <td
                      className={`py-1 px-3 w-1/2 font-mono text-[11px] whitespace-pre overflow-x-auto ${
                        row.isDifferent && row.form
                          ? 'bg-emerald-950/20 text-emerald-300'
                          : 'text-slate-300'
                      }`}
                    >
                      {row.form || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Output Only View */}
      {viewMode === 'output' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
              FULL VIEW: BEAUTIFIED {activeDef.name} OUTPUT
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSwap}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Replace Input</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-sm overflow-hidden p-4">
            <textarea
              readOnly
              value={formatResult.formattedCode}
              spellCheck={false}
              rows={isFullScreen ? 28 : 20}
              className="w-full h-full font-mono text-xs text-indigo-300 bg-transparent focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};
