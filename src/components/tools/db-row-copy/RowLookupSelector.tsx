import React from 'react';
import { Filter, Key, Check, Info, ArrowRight, ListFilter, RotateCcw } from 'lucide-react';
import { TableColumn } from '../../../utils/dbRowCopyGenerator';

interface RowLookupSelectorProps {
  columns: TableColumn[];
  lookupColumn: string;
  lookupValue: string;
  lookupOperator: '=' | 'IN' | 'LIKE';
  onUpdateLookupColumn: (col: string) => void;
  onUpdateLookupValue: (val: string) => void;
  onUpdateLookupOperator: (op: '=' | 'IN' | 'LIKE') => void;
}

export const RowLookupSelector: React.FC<RowLookupSelectorProps> = ({
  columns,
  lookupColumn,
  lookupValue,
  lookupOperator,
  onUpdateLookupColumn,
  onUpdateLookupValue,
  onUpdateLookupOperator,
}) => {
  const selectedCol = columns.find((c) => c.name === lookupColumn) || columns[0];
  const primaryKeyCol = columns.find((c) => c.isPrimaryKey);
  const isDefaultId =
    lookupColumn.toLowerCase() === 'id' ||
    (primaryKeyCol && lookupColumn === primaryKeyCol.name);

  const handleResetToDefaultId = () => {
    if (primaryKeyCol) {
      onUpdateLookupColumn(primaryKeyCol.name);
    } else {
      const idCol = columns.find((c) => c.name.toLowerCase() === 'id');
      if (idCol) onUpdateLookupColumn(idCol.name);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Source Row Lookup Key
              </h3>
              {isDefaultId ? (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  Default ID Lookup
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                  Overridden Lookup Column
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pick the row to copy using <code className="font-mono">id</code> by default or override to any column
            </p>
          </div>
        </div>

        {!isDefaultId && primaryKeyCol && (
          <button
            type="button"
            onClick={handleResetToDefaultId}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-emerald-500" />
            <span>Reset to PK ({primaryKeyCol.name})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* Lookup Column Select */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Lookup Column (Row Identifier)
          </label>
          <div className="relative">
            <select
              value={lookupColumn}
              onChange={(e) => onUpdateLookupColumn(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.name}>
                  {col.name} ({col.type}){col.isPrimaryKey ? ' ★ PK' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Operator Select */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Operator
          </label>
          <select
            value={lookupOperator}
            onChange={(e) => onUpdateLookupOperator(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-center font-semibold"
          >
            <option value="=">= (Single Exact)</option>
            <option value="IN">IN (Batch List)</option>
            <option value="LIKE">LIKE (Pattern)</option>
          </select>
        </div>

        {/* Lookup Value Input */}
        <div className="sm:col-span-6">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
            <span>
              Lookup Value(s) <span className="text-rose-500">*</span>
            </span>
            {selectedCol && (
              <span className="text-[10px] text-slate-400 font-mono">
                Type: {selectedCol.type}
              </span>
            )}
          </label>
          <input
            type="text"
            value={lookupValue}
            onChange={(e) => onUpdateLookupValue(e.target.value)}
            placeholder={
              lookupOperator === 'IN'
                ? '1001, 1002, 1003 or list of IDs'
                : selectedCol?.type === 'UUID'
                ? 'e.g. e89b21f3-4a11-477c-a0e2-76bf38d99042'
                : selectedCol?.type === 'BIGINT' || selectedCol?.type === 'INTEGER'
                ? 'e.g. 1042'
                : 'e.g. alice@example.com'
            }
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Target SQL Preview Hint */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
        <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-slate-400">Target Condition:</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          WHERE {lookupColumn} {lookupOperator} {lookupValue ? `'${lookupValue}'` : '<value>'}
        </span>
      </div>
    </div>
  );
};
