import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileJson,
  Search,
  Replace,
  Sparkles,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
  RotateCw,
  Trash2,
  Plus,
  Minimize2,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Code,
  FolderTree,
  Columns,
  ArrowUpDown,
  Filter,
  FileCode,
  Sliders,
  Layers,
  Wand2,
  Info,
} from 'lucide-react';
import {
  parseJsonSafe,
  tryFixCommonJsonErrors,
  searchAndReplaceJson,
  countMatches,
  SearchOptions,
  DEFAULT_SEARCH_OPTIONS,
  updateNodeAtPath,
  renameKeyAtPath,
  deleteNodeAtPath,
  insertChildAtPath,
  duplicateNodeAtPath,
  formatJsonPath,
  sortJsonKeys,
  calculateJsonStats,
  JSON_EDITOR_PRESETS,
} from '../../../utils/jsonEditorUtils';
import { JsonTreeNode } from './JsonTreeNode';
import { JsonQueryModal } from './JsonQueryModal';
import { JsonConvertModal } from './JsonConvertModal';

type EditorLayoutMode = 'split' | 'tree' | 'code';

interface JsonEditorToolProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const JsonEditorTool: React.FC<JsonEditorToolProps> = ({
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  // Initial state from first preset
  const defaultInitialJson = JSON_EDITOR_PRESETS[0].json;
  const defaultInitialText = JSON.stringify(defaultInitialJson, null, 2);

  const [rawText, setRawText] = useState(defaultInitialText);
  const [parsedData, setParsedData] = useState<any>(defaultInitialJson);
  const [parseError, setParseError] = useState<{ message: string; line?: number; column?: number } | null>(null);

  // Undo / Redo History
  const [history, setHistory] = useState<string[]>([defaultInitialText]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Layout mode
  const [layoutMode, setLayoutMode] = useState<EditorLayoutMode>('split');

  // Search & Replace
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOptions>(DEFAULT_SEARCH_OPTIONS);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Tree expansion state
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set(['', 'data', 'pagination', 'items', 'customer', 'pricingSummary', 'server', 'database']));
  const [selectedPath, setSelectedPath] = useState<(string | number)[]>([]);

  // Modals
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  // Push new state to history
  const commitChange = (newText: string, newData: any) => {
    setRawText(newText);
    setParsedData(newData);
    setParseError(null);

    // Truncate future history and append
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newText);
    if (updatedHistory.length > 50) {
      updatedHistory.shift();
    }
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  // Handle typing directly into raw code editor
  const handleRawTextChange = (text: string) => {
    setRawText(text);
    const { data, error, line, column } = parseJsonSafe(text);
    if (error) {
      setParseError({ message: error, line, column });
    } else {
      setParseError(null);
      setParsedData(data);
    }
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevText = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setRawText(prevText);
      const { data } = parseJsonSafe(prevText);
      setParsedData(data);
      setParseError(null);
      showStatus('Undo successful');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextText = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setRawText(nextText);
      const { data } = parseJsonSafe(nextText);
      setParsedData(data);
      setParseError(null);
      showStatus('Redo successful');
    }
  };

  // Format code (2 spaces, 4 spaces, or compact)
  const handleFormat = (indent: number) => {
    if (parsedData === undefined || parseError) return;
    try {
      const formatted = indent === 0 ? JSON.stringify(parsedData) : JSON.stringify(parsedData, null, indent);
      commitChange(formatted, parsedData);
      showStatus(indent === 0 ? 'Minified JSON' : `Formatted with ${indent} spaces`);
    } catch (e: any) {
      showStatus('Unable to format invalid JSON');
    }
  };

  // Quick fix syntax errors
  const handleQuickFix = () => {
    const { fixed, modified, fixes } = tryFixCommonJsonErrors(rawText);
    if (modified) {
      const { data, error } = parseJsonSafe(fixed);
      if (!error) {
        commitChange(JSON.stringify(data, null, 2), data);
        showStatus(`Fixed: ${fixes.join(', ')}`);
      } else {
        setRawText(fixed);
        showStatus(`Applied fixes: ${fixes.join(', ')} (verify remaining syntax)`);
      }
    } else {
      showStatus('No automatic fixes detected');
    }
  };

  // Tree manipulation callbacks
  const handleTreeUpdateValue = (path: (string | number)[], newVal: any) => {
    const updated = updateNodeAtPath(parsedData, path, newVal);
    const newText = JSON.stringify(updated, null, 2);
    commitChange(newText, updated);
  };

  const handleTreeRenameKey = (
    parentPath: (string | number)[],
    oldKey: string,
    newKey: string
  ) => {
    const updated = renameKeyAtPath(parsedData, parentPath, oldKey, newKey);
    const newText = JSON.stringify(updated, null, 2);
    commitChange(newText, updated);
    showStatus(`Renamed key "${oldKey}" to "${newKey}"`);
  };

  const handleTreeDeleteNode = (path: (string | number)[]) => {
    const updated = deleteNodeAtPath(parsedData, path);
    const newText = JSON.stringify(updated, null, 2);
    commitChange(newText, updated);
    showStatus(`Deleted node at ${formatJsonPath(path)}`);
  };

  const handleTreeDuplicateNode = (path: (string | number)[]) => {
    const updated = duplicateNodeAtPath(parsedData, path);
    const newText = JSON.stringify(updated, null, 2);
    commitChange(newText, updated);
    showStatus(`Duplicated node at ${formatJsonPath(path)}`);
  };

  const handleTreeInsertChild = (
    targetPath: (string | number)[],
    keyOrIdx: string | number,
    value: any
  ) => {
    const updated = insertChildAtPath(parsedData, targetPath, keyOrIdx, value);
    const newText = JSON.stringify(updated, null, 2);
    commitChange(newText, updated);
    showStatus(`Added child at ${formatJsonPath([...targetPath, keyOrIdx])}`);
  };

  // Search & Replace execution
  const matchCount = useMemo(() => {
    if (!searchQuery || parseError || parsedData === undefined) return 0;
    return countMatches(parsedData, searchQuery, searchOptions);
  }, [parsedData, searchQuery, searchOptions, parseError]);

  const handleReplaceAll = () => {
    if (!searchQuery || parsedData === undefined || parseError) return;
    const { result, replaceCount } = searchAndReplaceJson(
      parsedData,
      searchQuery,
      replaceQuery,
      searchOptions
    );
    if (replaceCount > 0) {
      const newText = JSON.stringify(result, null, 2);
      commitChange(newText, result);
      showStatus(`Replaced ${replaceCount} ${replaceCount === 1 ? 'occurrence' : 'occurrences'}`);
    } else {
      showStatus('No matches found to replace');
    }
  };

  // Expand / Collapse all
  const handleExpandAll = () => {
    const allPaths = new Set<string>();
    const collect = (node: any, curPath: string) => {
      if (node !== null && typeof node === 'object') {
        allPaths.add(curPath);
        if (Array.isArray(node)) {
          node.forEach((item, idx) => collect(item, curPath ? `${curPath}.${idx}` : String(idx)));
        } else {
          Object.keys(node).forEach((k) => collect(node[k], curPath ? `${curPath}.${k}` : k));
        }
      }
    };
    collect(parsedData, '');
    setExpandedPaths(allPaths);
    showStatus('Expanded all nodes');
  };

  const handleCollapseAll = () => {
    setExpandedPaths(new Set(['']));
    showStatus('Collapsed all nodes');
  };

  const handleExpandToLevel = (level: number) => {
    const paths = new Set<string>();
    const collect = (node: any, curPath: string, depth: number) => {
      if (depth > level) return;
      if (node !== null && typeof node === 'object') {
        paths.add(curPath);
        if (Array.isArray(node)) {
          node.forEach((item, idx) => collect(item, curPath ? `${curPath}.${idx}` : String(idx), depth + 1));
        } else {
          Object.keys(node).forEach((k) => collect(node[k], curPath ? `${curPath}.${k}` : k, depth + 1));
        }
      }
    };
    collect(parsedData, '', 1);
    setExpandedPaths(paths);
    showStatus(`Expanded to level ${level}`);
  };

  const handleToggleExpandPath = (pathStr: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(pathStr)) {
        next.delete(pathStr);
      } else {
        next.add(pathStr);
      }
      return next;
    });
  };

  // Sort keys
  const handleSortKeys = (direction: 'asc' | 'desc') => {
    if (parsedData === undefined || parseError) return;
    const sorted = sortJsonKeys(parsedData, direction, true);
    const newText = JSON.stringify(sorted, null, 2);
    commitChange(newText, sorted);
    showStatus(`Sorted keys (${direction.toUpperCase()})`);
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showStatus('Copied JSON to clipboard');
  };

  // Download .json
  const handleDownload = () => {
    const blob = new Blob([rawText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus('Downloaded JSON file');
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { data, error, line, column } = parseJsonSafe(content);
      if (error) {
        setRawText(content);
        setParseError({ message: error, line, column });
        showStatus('Uploaded file with JSON syntax errors');
      } else {
        const formatted = JSON.stringify(data, null, 2);
        commitChange(formatted, data);
        showStatus(`Loaded "${file.name}"`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load preset
  const handleLoadPreset = (presetId: string) => {
    const preset = JSON_EDITOR_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const formatted = JSON.stringify(preset.json, null, 2);
      commitChange(formatted, preset.json);
      showStatus(`Loaded "${preset.name}" preset`);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    return calculateJsonStats(parsedData, rawText);
  }, [parsedData, rawText]);

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 ${isFullScreen ? 'h-screen w-screen' : 'h-[85vh] w-full'} rounded-xl overflow-hidden`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json,application/json,text/plain"
        className="hidden"
      />

      {/* Top Application Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                JSON Editor
              </h2>
              {parseError ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                  <AlertCircle className="w-3 h-3" /> Syntax Error
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                  <CheckCircle2 className="w-3 h-3" /> Valid JSON
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interactive tree editor, deep search & replace, schema converter & queries
            </p>
          </div>
        </div>

        {/* Layout Switcher & Primary Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-slate-200/70 dark:bg-slate-800 p-0.5 border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setLayoutMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                layoutMode === 'split'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Split View: Visual Tree + Code Editor"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('tree')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                layoutMode === 'tree'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Visual Interactive Tree View"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tree</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                layoutMode === 'code'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Raw Code Text Editor"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Code</span>
            </button>
          </div>

          {/* Search & Replace Toggle */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isSearchOpen
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find & Replace</span>
            {searchQuery && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-200 dark:bg-indigo-800 text-[10px]">
                {matchCount}
              </span>
            )}
          </button>

          {/* Fullscreen toggle button if provided */}
          {onToggleFullScreen && (
            <button
              type="button"
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Secondary Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 text-xs shrink-0">
        {/* Left Toolbar: Undo/Redo, Formatting, Quick Fix, Sort */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Undo & Redo */}
          <div className="flex items-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Format dropdown / buttons */}
          <button
            type="button"
            onClick={() => handleFormat(2)}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            Format (2 Sp)
          </button>
          <button
            type="button"
            onClick={() => handleFormat(4)}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-300 transition-colors hidden sm:inline"
          >
            Format (4 Sp)
          </button>
          <button
            type="button"
            onClick={() => handleFormat(0)}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            Minify
          </button>

          {/* Quick Fix Button (Appears especially when error exists) */}
          <button
            type="button"
            onClick={handleQuickFix}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              parseError
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Auto-repair single quotes, unquoted keys, trailing commas, comments"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Auto Fix Syntax</span>
          </button>

          {/* Sort Keys */}
          <div className="flex items-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5">
            <button
              type="button"
              onClick={() => handleSortKeys('asc')}
              className="px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Sort keys alphabetically A-Z"
            >
              Sort A-Z
            </button>
            <button
              type="button"
              onClick={() => handleSortKeys('desc')}
              className="px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Sort keys Z-A"
            >
              Z-A
            </button>
          </div>

          {/* Presets Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) handleLoadPreset(e.target.value);
            }}
            defaultValue=""
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none"
          >
            <option value="" disabled>
              Load Sample Preset...
            </option>
            {JSON_EDITOR_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Toolbar: Query, Convert, Upload, Download, Copy */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Query & Filter Modal */}
          <button
            type="button"
            onClick={() => setIsQueryModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Query & Filter</span>
          </button>

          {/* Export & Convert Modal */}
          <button
            type="button"
            onClick={() => setIsConvertModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Convert / Export</span>
          </button>

          {/* Upload File */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Upload JSON file"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Download File */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Download JSON file"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clear JSON */}
          <button
            type="button"
            onClick={() => commitChange('{\n\n}', {})}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Clear all content"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Find & Replace Panel (Collapsible) */}
      {isSearchOpen && (
        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-200 dark:border-indigo-900/60 flex flex-wrap items-center gap-3 shrink-0">
          {/* Find input */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-indigo-500 shrink-0" />
            <input
              type="text"
              placeholder="Find in JSON (keys or values)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          {/* Replace input */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
            <Replace className="w-4 h-4 text-indigo-500 shrink-0" />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Search Options Toggles */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            {/* Case Sensitive */}
            <button
              type="button"
              onClick={() => setSearchOptions((prev) => ({ ...prev, caseSensitive: !prev.caseSensitive }))}
              className={`px-2 py-0.5 rounded border transition-colors ${
                searchOptions.caseSensitive
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
              title="Match Case (Aa)"
            >
              Aa
            </button>

            {/* Whole Word */}
            <button
              type="button"
              onClick={() => setSearchOptions((prev) => ({ ...prev, wholeWord: !prev.wholeWord }))}
              className={`px-2 py-0.5 rounded border transition-colors ${
                searchOptions.wholeWord
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
              title="Whole Word (\b)"
            >
              \b
            </button>

            {/* Regex */}
            <button
              type="button"
              onClick={() => setSearchOptions((prev) => ({ ...prev, useRegex: !prev.useRegex }))}
              className={`px-2 py-0.5 rounded border transition-colors ${
                searchOptions.useRegex
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
              title="Regular Expression (.*)"
            >
              .*
            </button>

            {/* In Keys / In Values checkboxes */}
            <label className="flex items-center gap-1 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={searchOptions.inKeys}
                onChange={(e) => setSearchOptions((prev) => ({ ...prev, inKeys: e.target.checked }))}
                className="rounded text-indigo-600 focus:ring-0"
              />
              Keys
            </label>
            <label className="flex items-center gap-1 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={searchOptions.inValues}
                onChange={(e) => setSearchOptions((prev) => ({ ...prev, inValues: e.target.checked }))}
                className="rounded text-indigo-600 focus:ring-0"
              />
              Values
            </label>

            {/* Filter tree toggle */}
            <button
              type="button"
              onClick={() => setIsFilterActive(!isFilterActive)}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                isFilterActive
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
              title="Hide non-matching nodes in tree view"
            >
              <Filter className="w-3 h-3" />
              <span>Filter Tree</span>
            </button>
          </div>

          {/* Action buttons: Replace All */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
            </span>
            <button
              type="button"
              onClick={handleReplaceAll}
              disabled={!searchQuery || matchCount === 0}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors"
            >
              Replace All
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Visual Interactive Tree View */}
        {(layoutMode === 'split' || layoutMode === 'tree') && (
          <div
            className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/40 overflow-hidden ${
              layoutMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            {/* Tree View Subheader */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0">
              <div className="flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-indigo-500" />
                <span>Interactive Structure Tree</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Expand all nodes"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Collapse all nodes"
                >
                  Collapse All
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => handleExpandToLevel(1)}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  L1
                </button>
                <button
                  type="button"
                  onClick={() => handleExpandToLevel(2)}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  L2
                </button>
                <button
                  type="button"
                  onClick={() => handleExpandToLevel(3)}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  L3
                </button>
              </div>
            </div>

            {/* Tree Nodes Scrollable Container */}
            <div className="flex-1 overflow-auto p-3">
              {parseError ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
                  <p className="text-xs font-semibold text-rose-500">
                    Cannot render tree: Invalid JSON syntax
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mt-1">
                    {parseError.message}
                  </p>
                  <button
                    type="button"
                    onClick={handleQuickFix}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Auto Fix Syntax</span>
                  </button>
                </div>
              ) : parsedData !== undefined && parsedData !== null ? (
                <JsonTreeNode
                  nodeKey="root"
                  value={parsedData}
                  path={[]}
                  depth={0}
                  isRoot={true}
                  expandedPaths={expandedPaths}
                  onToggleExpand={handleToggleExpandPath}
                  onUpdateValue={handleTreeUpdateValue}
                  onRenameKey={handleTreeRenameKey}
                  onDeleteNode={handleTreeDeleteNode}
                  onDuplicateNode={handleTreeDuplicateNode}
                  onInsertChild={handleTreeInsertChild}
                  onSelectPath={(path) => setSelectedPath(path)}
                  searchQuery={searchQuery}
                  isFilterActive={isFilterActive}
                />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Empty JSON document
                </div>
              )}
            </div>

            {/* Selected Path Breadcrumb Bar */}
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between shrink-0">
              <span className="truncate">
                Path: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{formatJsonPath(selectedPath)}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(formatJsonPath(selectedPath));
                  showStatus('Copied JSONPath to clipboard');
                }}
                className="text-[10px] text-slate-400 hover:text-indigo-500 ml-2 shrink-0 underline"
              >
                Copy Path
              </button>
            </div>
          </div>
        )}

        {/* Code Text Editor View */}
        {(layoutMode === 'split' || layoutMode === 'code') && (
          <div
            className={`flex flex-col bg-slate-950 text-slate-100 overflow-hidden ${
              layoutMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            {/* Code View Subheader */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-semibold text-slate-400 shrink-0">
              <div className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>Raw JSON Editor</span>
              </div>
              <div className="flex items-center gap-2">
                {parseError ? (
                  <span className="text-[11px] text-rose-400 font-mono">
                    {parseError.line ? `Line ${parseError.line}:${parseError.column || 1}` : 'Syntax Error'}
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {stats.lines} lines • {stats.nodeCount} nodes
                  </span>
                )}
              </div>
            </div>

            {/* Error Banner if Syntax is Invalid */}
            {parseError && (
              <div className="px-3 py-1.5 bg-rose-950/80 border-b border-rose-900 text-rose-300 text-xs font-mono flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 truncate">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{parseError.message}</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFix}
                  className="px-2 py-0.5 rounded bg-rose-800 hover:bg-rose-700 text-white text-[10px] font-semibold shrink-0 ml-2"
                >
                  Quick Fix
                </button>
              </div>
            )}

            {/* Textarea Editor with Line Numbers */}
            <div className="flex-1 flex overflow-hidden relative">
              <textarea
                value={rawText}
                onChange={(e) => handleRawTextChange(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-3 font-mono text-xs text-slate-100 bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-indigo-600/40"
                placeholder="Paste or write valid JSON here..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status & Statistics Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
        <div className="flex items-center gap-3">
          {statusMessage ? (
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold animate-fade-in">
              {statusMessage}
            </span>
          ) : (
            <>
              <span>Size: {(stats.byteSize / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span>Nodes: {stats.nodeCount}</span>
              <span>•</span>
              <span>Max Depth: {stats.maxDepth}</span>
              <span>•</span>
              <span>Keys: {stats.keyCount}</span>
              <span>•</span>
              <span>Array Items: {stats.arrayItemCount}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span>Encoding: UTF-8</span>
          <span>•</span>
          <span>History: {historyIndex + 1}/{history.length}</span>
        </div>
      </div>

      {/* Query & Filter Modal */}
      <JsonQueryModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        jsonData={parsedData}
        onApplyResult={(filteredJson) => {
          const newText = JSON.stringify(filteredJson, null, 2);
          commitChange(newText, filteredJson);
          showStatus('Applied query result to editor');
        }}
      />

      {/* Export & Convert Modal */}
      <JsonConvertModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        jsonData={parsedData}
      />
    </div>
  );
};
