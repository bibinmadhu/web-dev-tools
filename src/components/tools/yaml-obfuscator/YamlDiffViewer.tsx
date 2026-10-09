import React, { useState } from 'react';
import { Columns, List, Copy, Check, Split } from 'lucide-react';

export interface YamlDiffViewerProps {
  originalYaml: string;
  obfuscatedYaml: string;
}

export const YamlDiffViewer: React.FC<YamlDiffViewerProps> = ({
  originalYaml,
  obfuscatedYaml,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedObfuscated, setCopiedObfuscated] = useState(false);

  const origLines = originalYaml.split('\n');
  const obfLines = obfuscatedYaml.split('\n');
  const maxLines = Math.max(origLines.length, obfLines.length);

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(originalYaml);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 2000);
  };

  const handleCopyObfuscated = () => {
    navigator.clipboard.writeText(obfuscatedYaml);
    setCopiedObfuscated(true);
    setTimeout(() => setCopiedObfuscated(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
      {/* HEADER BAR */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Split className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Original vs. Obfuscated YAML Comparison
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {maxLines} lines
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded p-0.5 text-[11px]">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns className="w-3 h-3" />
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'unified'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white font-medium shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3 h-3" />
              Unified
            </button>
          </div>
        </div>
      </div>

      {/* DIFF BODY */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 flex-1 overflow-hidden min-h-0">
          {/* LEFT: ORIGINAL */}
          <div className="flex flex-col overflow-hidden min-h-0 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Original Source YAML
              </span>
              <button
                onClick={handleCopyOriginal}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 text-[10px]"
              >
                {copiedOriginal ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedOriginal ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex-1 overflow-auto p-3 font-mono text-[11px] leading-relaxed">
              {Array.from({ length: maxLines }).map((_, idx) => {
                const line = origLines[idx] ?? '';
                const obfLine = obfLines[idx] ?? '';
                const isDiff = line !== obfLine && line.trim() !== '';

                return (
                  <div
                    key={`orig-${idx}`}
                    className={`flex items-start ${
                      isDiff
                        ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border-l-2 border-rose-500'
                        : 'text-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-slate-400 select-none text-right pr-2.5">
                      {idx + 1}
                    </span>
                    <pre className="flex-1 whitespace-pre-wrap break-all">{line || ' '}</pre>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: OBFUSCATED */}
          <div className="flex flex-col overflow-hidden min-h-0 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Obfuscated Target YAML
              </span>
              <button
                onClick={handleCopyObfuscated}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 text-[10px]"
              >
                {copiedObfuscated ? <Check className="w-3 h-3 text-indigo-500" /> : <Copy className="w-3 h-3" />}
                {copiedObfuscated ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex-1 overflow-auto p-3 font-mono text-[11px] leading-relaxed">
              {Array.from({ length: maxLines }).map((_, idx) => {
                const line = origLines[idx] ?? '';
                const obfLine = obfLines[idx] ?? '';
                const isDiff = line !== obfLine && obfLine.trim() !== '';

                return (
                  <div
                    key={`obf-${idx}`}
                    className={`flex items-start ${
                      isDiff
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 border-l-2 border-indigo-500'
                        : 'text-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-slate-400 select-none text-right pr-2.5">
                      {idx + 1}
                    </span>
                    <pre className="flex-1 whitespace-pre-wrap break-all">{obfLine || ' '}</pre>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* UNIFIED DIFF VIEW */
        <div className="flex-1 overflow-auto p-3 font-mono text-[11px] leading-relaxed bg-slate-50/50 dark:bg-slate-950/40">
          {Array.from({ length: maxLines }).map((_, idx) => {
            const orig = origLines[idx] ?? '';
            const obf = obfLines[idx] ?? '';
            const isDiff = orig !== obf;

            if (!isDiff) {
              return (
                <div key={`same-${idx}`} className="flex items-start text-slate-700 dark:text-slate-400">
                  <span className="w-8 shrink-0 text-slate-400 select-none text-right pr-2.5">
                    {idx + 1}
                  </span>
                  <span className="w-4 select-none text-slate-400"> </span>
                  <pre className="flex-1 whitespace-pre-wrap break-all">{orig || ' '}</pre>
                </div>
              );
            }

            return (
              <React.Fragment key={`diff-${idx}`}>
                {orig.trim() && (
                  <div className="flex items-start bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200">
                    <span className="w-8 shrink-0 text-slate-400 select-none text-right pr-2.5">
                      {idx + 1}
                    </span>
                    <span className="w-4 select-none text-rose-500 font-bold">-</span>
                    <pre className="flex-1 whitespace-pre-wrap break-all">{orig}</pre>
                  </div>
                )}
                {obf.trim() && (
                  <div className="flex items-start bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200">
                    <span className="w-8 shrink-0 text-slate-400 select-none text-right pr-2.5">
                      {idx + 1}
                    </span>
                    <span className="w-4 select-none text-emerald-500 font-bold">+</span>
                    <pre className="flex-1 whitespace-pre-wrap break-all">{obf}</pre>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
