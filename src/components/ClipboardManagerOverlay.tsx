import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clipboard,
  Copy,
  Check,
  Trash2,
  Pin,
  Search,
  X,
  Download,
  Upload,
  ExternalLink,
  Code2,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileCode,
  Terminal,
  Database,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  ClipboardItem,
  SnippetType,
  getClipboardHistory,
  removeClipboardItem,
  clearClipboardHistory,
  togglePinClipboardItem,
  addClipboardItem,
  formatTimeAgo,
  formatByteSize,
  exportClipboardHistoryJson,
  importClipboardHistoryJson,
  CLIPBOARD_CHANGE_EVENT,
  MAX_CLIPBOARD_ITEMS,
} from '../utils/clipboardManager';
import { DevTool } from '../types';
import { TOOLS_DATA } from '../data/toolsData';

interface ClipboardManagerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTool?: (tool: DevTool) => void;
}

export const ClipboardManagerOverlay: React.FC<ClipboardManagerOverlayProps> = ({
  isOpen,
  onClose,
  onOpenTool,
}) => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | SnippetType>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync state with localStorage and custom event
  const refreshItems = () => {
    setItems(getClipboardHistory());
  };

  useEffect(() => {
    refreshItems();

    const handleCustomChange = () => {
      refreshItems();
    };

    window.addEventListener(CLIPBOARD_CHANGE_EVENT, handleCustomChange);
    window.addEventListener('storage', handleCustomChange);

    return () => {
      window.removeEventListener(CLIPBOARD_CHANGE_EVENT, handleCustomChange);
      window.removeEventListener('storage', handleCustomChange);
    };
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      refreshItems();
      setShowClearConfirm(false);
      setShowImportModal(false);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (showImportModal) {
          setShowImportModal(false);
        } else if (showClearConfirm) {
          setShowClearConfirm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showImportModal, showClearConfirm, onClose]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (selectedTypeFilter !== 'all' && item.detectedType !== selectedTypeFilter) {
        return false;
      }
      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.text.toLowerCase().includes(q) ||
        item.detectedType.toLowerCase().includes(q) ||
        (item.source && item.source.toLowerCase().includes(q))
      );
    });
  }, [items, selectedTypeFilter, searchQuery]);

  // Copy to clipboard action
  const handleCopy = async (item: ClipboardItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      showTemporaryStatus('Snippet copied to system clipboard!');
      setTimeout(() => {
        setCopiedId((curr) => (curr === item.id ? null : curr));
      }, 2000);
    } catch {
      // fallback
    }
  };

  // Toggle pin
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = togglePinClipboardItem(id);
    setItems(updated);
  };

  // Delete item
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeClipboardItem(id);
    setItems(updated);
    if (expandedId === id) setExpandedId(null);
    showTemporaryStatus('Snippet removed from clipboard history');
  };

  // Clear all history
  const handleClearHistory = (keepPinned: boolean) => {
    const updated = clearClipboardHistory(keepPinned);
    setItems(updated);
    setShowClearConfirm(false);
    showTemporaryStatus(keepPinned ? 'Cleared unpinned snippets' : 'Clipboard history cleared');
  };

  // Temporary status banner
  const showTemporaryStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = exportClipboardHistoryJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devhub_clipboard_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showTemporaryStatus('Exported clipboard history as JSON');
  };

  // Import JSON
  const handleImportSubmit = () => {
    setImportError(null);
    setImportSuccess(null);
    if (!importJsonText.trim()) {
      setImportError('Please paste valid JSON text to import.');
      return;
    }
    const res = importClipboardHistoryJson(importJsonText);
    if (res.success) {
      setImportSuccess(`Successfully imported ${res.count} snippet(s)!`);
      refreshItems();
      setTimeout(() => {
        setShowImportModal(false);
        setImportJsonText('');
        setImportSuccess(null);
      }, 1200);
    } else {
      setImportError(res.error || 'Failed to import clipboard items.');
    }
  };

  // Map snippet type to recommended tool
  const getRecommendedTool = (type: SnippetType): DevTool | null => {
    switch (type) {
      case 'json':
        return TOOLS_DATA.find((t) => t.id === 'json-beautifier') || null;
      case 'python':
        return TOOLS_DATA.find((t) => t.id === 'python-obfuscator') || null;
      case 'sql':
        return TOOLS_DATA.find((t) => t.id === 'query-obfuscator') || null;
      case 'curl':
        return TOOLS_DATA.find((t) => t.id === 'curl-converter') || null;
      case 'java':
        return TOOLS_DATA.find((t) => t.id === 'java-formatter') || null;
      case 'base64':
        return TOOLS_DATA.find((t) => t.id === 'base64-encoder') || null;
      case 'jwt':
        return TOOLS_DATA.find((t) => t.id === 'jwt-decoder') || null;
      case 'yaml':
        return TOOLS_DATA.find((t) => t.id === 'yaml-obfuscator') || null;
      case 'html':
      case 'css':
      case 'javascript':
        return TOOLS_DATA.find((t) => t.id === 'code-formatter') || null;
      default:
        return null;
    }
  };

  const handleOpenInTool = (item: ClipboardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const tool = getRecommendedTool(item.detectedType);
    if (tool && onOpenTool) {
      onOpenTool(tool);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={overlayRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clipboard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Clipboard History</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  ({items.length}/{MAX_CLIPBOARD_ITEMS})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last {MAX_CLIPBOARD_ITEMS} copied strings &amp; code snippets stored in workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportJson}
              disabled={items.length === 0}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              title="Export clipboard history as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              title="Import clipboard snippets from JSON"
            >
              <Upload className="w-4 h-4" />
            </button>
            {items.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Clear clipboard history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
              title="Close overlay (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Temporary Status Toast */}
        {statusMessage && (
          <div className="px-5 py-2 bg-indigo-600 text-white text-xs font-medium flex items-center justify-between transition-all animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="opacity-80 hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Clear Confirmation Prompt */}
        {showClearConfirm && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Clear clipboard history? Choose whether to keep pinned items.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleClearHistory(true)}
                className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors"
              >
                Keep Pinned
              </button>
              <button
                onClick={() => handleClearHistory(false)}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search copied code, text, or query..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Segmented Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'json', label: 'JSON' },
                { id: 'sql', label: 'SQL' },
                { id: 'python', label: 'Python' },
                { id: 'curl', label: 'cURL' },
                { id: 'javascript', label: 'JS/TS' },
                { id: 'java', label: 'Java' },
                { id: 'text', label: 'Text' },
              ] as const
            ).map((filter) => {
              const count =
                filter.id === 'all'
                  ? items.length
                  : items.filter((item) => item.detectedType === filter.id).length;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedTypeFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedTypeFilter === filter.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{filter.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedTypeFilter === filter.id
                          ? 'bg-indigo-700/60 text-indigo-100'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* List of Clipboard Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] max-h-[500px]">
          {filteredItems.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <Clipboard className="w-10 h-10 mb-3 opacity-40 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {items.length === 0 ? 'Clipboard history is empty' : 'No matching snippets found'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
                {items.length === 0
                  ? 'Whenever you copy code, queries, or text in any DevHub tool, it will appear here for instant re-use.'
                  : 'Try adjusting your search query or type filter.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isExpanded = expandedId === item.id;
              const isCopied = copiedId === item.id;
              const recommendedTool = getRecommendedTool(item.detectedType);

              return (
                <div
                  key={item.id}
                  onClick={() => handleCopy(item)}
                  className={`group relative border rounded-xl p-3.5 transition-all cursor-pointer ${
                    item.pinned
                      ? 'border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/20 dark:bg-indigo-950/15'
                      : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-indigo-300 dark:hover:border-slate-700'
                  } ${isCopied ? 'ring-2 ring-emerald-500/60' : ''}`}
                >
                  {/* Item Header & Metadata */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {/* Clean domain type label */}
                      <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {item.detectedType}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span>{item.lineCount} {item.lineCount === 1 ? 'line' : 'lines'}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span>{item.characterCount} chars ({formatByteSize(item.byteSize)})</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 inline text-slate-400" />
                        {formatTimeAgo(item.timestamp)}
                      </span>
                      {item.source && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="text-slate-400 dark:text-slate-500 italic truncate max-w-[130px]">
                            {item.source}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {/* Pin button */}
                      <button
                        onClick={(e) => handleTogglePin(item.id, e)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.pinned
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={item.pinned ? 'Unpin snippet' : 'Pin snippet to keep in history'}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Open in tool button */}
                      {recommendedTool && onOpenTool && (
                        <button
                          onClick={(e) => handleOpenInTool(item, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                          title={`Open in ${recommendedTool.name}`}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Expand / Collapse */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : item.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={isExpanded ? 'Collapse snippet' : 'Expand full snippet'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Copy button */}
                      <button
                        onClick={(e) => handleCopy(item, e)}
                        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white'
                        }`}
                        title="Copy to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete from clipboard history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Code Snippet Content */}
                  <div className="relative font-mono text-xs rounded-lg bg-slate-100/90 dark:bg-slate-950/80 p-2.5 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
                    {isExpanded ? (
                      <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed select-text">
                        {item.text}
                      </pre>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate select-none font-mono text-[11px]">
                          {item.preview || item.text.slice(0, 90)}
                        </span>
                        {item.lineCount > 1 && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-sans">
                            +{item.lineCount - 1} more lines
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
              Click Card
            </kbd>
            <span>to copy</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
              Esc
            </kbd>
            <span>to close</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Auto-syncs across all tools</span>
          </div>
        </div>

        {/* Import JSON Modal Dialog */}
        {showImportModal && (
          <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-6 flex flex-col justify-between animate-in fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-sm">Import Clipboard Snippets</h3>
                </div>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste JSON exported from DevHub or an array of snippet strings to merge into your history.
              </p>

              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"history": [{"text": "const greeting = \"Hello World\";"}]}'
                className="w-full h-44 p-3 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />

              {importError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Import Snippets
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
