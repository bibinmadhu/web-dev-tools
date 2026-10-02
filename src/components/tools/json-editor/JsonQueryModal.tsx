import React, { useState, useEffect } from 'react';
import { X, Search, Check, Copy, ArrowRight, Play, Sparkles, AlertCircle } from 'lucide-react';
import { queryJsonWithExpression } from '../../../utils/jsonEditorUtils';

interface JsonQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: any;
  onApplyResult: (newJson: any) => void;
}

export const JsonQueryModal: React.FC<JsonQueryModalProps> = ({
  isOpen,
  onClose,
  jsonData,
  onApplyResult,
}) => {
  const [query, setQuery] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!query.trim()) {
      setOutput(jsonData);
      setError(null);
      return;
    }

    const { result, error: queryErr } = queryJsonWithExpression(jsonData, query);
    if (queryErr) {
      setError(queryErr);
      setOutput(null);
    } else {
      setError(null);
      setOutput(result);
    }
  }, [query, jsonData, isOpen]);

  if (!isOpen) return null;

  const sampleQueries = [
    { label: 'Root Data', expr: 'data' },
    { label: 'Filter Items / Users', expr: 'Array.isArray(data) ? data.slice(0, 5) : Object.keys(data)' },
    { label: 'Object Keys Only', expr: 'typeof data === "object" && data ? Object.keys(data) : []' },
    { label: 'Pluck First Item', expr: 'Array.isArray(data) ? data[0] : (data.items ? data.items[0] : data)' },
    { label: 'Count Elements', expr: 'Array.isArray(data) ? data.length : Object.keys(data).length' },
  ];

  const handleCopy = () => {
    if (output !== undefined) {
      navigator.clipboard.writeText(JSON.stringify(output, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (output !== undefined && !error) {
      onApplyResult(output);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Query & Filter JSON
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filter, map, slice or transform JSON using JavaScript expressions (<code className="font-mono text-indigo-500">data</code> represents root JSON)
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

        {/* Query Input & Sample Chips */}
        <div className="p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Query Expression:
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. data.users.filter(u => u.isActive) or data.items[0]"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mr-1">
              Quick samples:
            </span>
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(sample.expr)}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-200/70 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Error Message if Query is Invalid */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live Output Preview */}
        <div className="p-4 flex-1 overflow-auto flex flex-col min-h-[220px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">
              Query Result Preview
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={output === undefined || !!error}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Result'}</span>
            </button>
          </div>

          <pre className="flex-1 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-auto border border-slate-800 max-h-[350px]">
            {output === undefined || error
              ? '/* No result or error in query */'
              : JSON.stringify(output, null, 2)}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={output === undefined || !!error}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply as Editor Content</span>
          </button>
        </div>
      </div>
    </div>
  );
};
