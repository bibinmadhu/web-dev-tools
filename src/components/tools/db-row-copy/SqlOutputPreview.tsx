import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Download,
  Terminal,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  Sliders,
  FileText,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  SqlDialect,
  RowCopyOptions,
  GeneratedSqlResult,
} from '../../../utils/dbRowCopyGenerator';

interface SqlOutputPreviewProps {
  sqlResult: GeneratedSqlResult;
  options: RowCopyOptions;
  onUpdateOptions: (opts: Partial<RowCopyOptions>) => void;
}

export const SqlOutputPreview: React.FC<SqlOutputPreviewProps> = ({
  sqlResult,
  options,
  onUpdateOptions,
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'python'>('sql');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);

  const handleCopy = (text: string, type: 'sql' | 'python') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedPython(true);
      setTimeout(() => setCopiedPython(false), 2000);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const { copySummary } = sqlResult;

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Bar with Metrics and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Generated SQL & Test Scripts
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{copySummary.totalColumns} total columns</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {copySummary.copiedVerbatim} verbatim
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                {copySummary.overridden} overridden
              </span>
              {copySummary.excluded > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    {copySummary.excluded} excluded
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Tabs & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'sql'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              SQL Query
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'python'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Python Script (pg8000)
            </button>
          </div>

          {activeTab === 'sql' ? (
            <>
              <button
                type="button"
                onClick={() => handleCopy(sqlResult.sql, 'sql')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied SQL' : 'Copy SQL'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload(sqlResult.sql, 'clone_row.sql')}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Download .sql file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleCopy(sqlResult.pythonScript || '', 'python')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
              >
                {copiedPython ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPython ? 'Copied Python' : 'Copy Python'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload(sqlResult.pythonScript || '', 'test_clone_row.py')}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Download .py file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* SQL Execution Options & Dialect Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
        {/* Dialect */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
            SQL Dialect
          </label>
          <select
            value={options.dialect}
            onChange={(e) => onUpdateOptions({ dialect: e.target.value as SqlDialect })}
            className="w-full px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="postgres">PostgreSQL</option>
            <option value="mysql">MySQL / MariaDB</option>
            <option value="sqlserver">Microsoft SQL Server (T-SQL)</option>
            <option value="oracle">Oracle Database</option>
            <option value="sqlite">SQLite</option>
          </select>
        </div>

        {/* Strategy */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
            Copy Strategy
          </label>
          <select
            value={options.strategy}
            onChange={(e) => onUpdateOptions({ strategy: e.target.value as any })}
            className="w-full px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="insert_select">INSERT INTO ... SELECT</option>
            <option value="cte_select">CTE (WITH source_row AS ...)</option>
          </select>
        </div>

        {/* Transaction & Safety */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
            Transaction Safety
          </label>
          <div className="flex items-center gap-3 mt-1.5">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.useTransaction}
                onChange={(e) => onUpdateOptions({ useTransaction: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
              <span className="text-slate-700 dark:text-slate-300">Wrap in BEGIN/COMMIT</span>
            </label>

            {options.useTransaction && (
              <label className="flex items-center gap-1.5 cursor-pointer" title="Rollback changes immediately for verification without persisting">
                <input
                  type="checkbox"
                  checked={options.rollbackOnly}
                  onChange={(e) => onUpdateOptions({ rollbackOnly: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
                <span className="text-amber-700 dark:text-amber-300 font-medium">Dry Run (ROLLBACK)</span>
              </label>
            )}
          </div>
        </div>

        {/* RETURNING Clause */}
        <div>
          <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium">
            RETURNING Result
          </label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeReturning}
                onChange={(e) => onUpdateOptions({ includeReturning: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
              <span className="text-slate-700 dark:text-slate-300">RETURNING</span>
            </label>
            {options.includeReturning && (
              <input
                type="text"
                value={options.returningColumns || '*'}
                onChange={(e) => onUpdateOptions({ returningColumns: e.target.value })}
                placeholder="*"
                className="w-24 px-2 py-0.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            )}
          </div>
        </div>
      </div>

      {/* Code Editor Box */}
      <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 font-mono text-xs">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[11px]">
          <span>
            {activeTab === 'sql' ? `${options.dialect.toUpperCase()} QUERY` : 'PYTHON INTEGRATION SCRIPT'}
          </span>
          <span className="text-slate-500">
            {activeTab === 'sql' ? `${sqlResult.sql.split('\n').length} lines` : 'pg8000 Native Runner'}
          </span>
        </div>

        <pre className="p-4 text-slate-200 overflow-x-auto leading-relaxed max-h-[380px] overflow-y-auto selection:bg-indigo-600">
          <code>{activeTab === 'sql' ? sqlResult.sql : sqlResult.pythonScript}</code>
        </pre>
      </div>
    </div>
  );
};
