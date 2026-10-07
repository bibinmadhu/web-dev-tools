import React, { useState } from 'react';
import {
  Table,
  Sparkles,
  ArrowRight,
  Check,
  RefreshCw,
  Edit2,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';
import {
  DbRowCopyConfig,
  simulateRowCopy,
} from '../../../utils/dbRowCopyGenerator';

interface RowDiffPreviewGridProps {
  config: DbRowCopyConfig;
  onUpdateSampleSourceRow?: (row: Record<string, any>) => void;
}

export const RowDiffPreviewGrid: React.FC<RowDiffPreviewGridProps> = ({
  config,
  onUpdateSampleSourceRow,
}) => {
  const [isEditingSource, setIsEditingSource] = useState(false);
  const sampleSource = config.sampleSourceRow || {};

  // Run simulation
  const { clonedRow, diffs } = simulateRowCopy(config, sampleSource);

  const handleCellChange = (colName: string, value: string) => {
    if (!onUpdateSampleSourceRow) return;
    onUpdateSampleSourceRow({
      ...sampleSource,
      [colName]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Live Row Diff & Simulation Preview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Side-by-side comparison of the source row vs resulting copied row with override highlighting
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditingSource(!isEditingSource)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            isEditingSource
              ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditingSource ? 'Done Editing Sample' : 'Edit Sample Source Data'}</span>
        </button>
      </div>

      {/* Comparison Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
            <tr>
              <th className="py-2.5 px-3 w-1/4">Column Name</th>
              <th className="py-2.5 px-3 w-1/3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Source Row ({config.lookupColumn} = {config.lookupValue})
                </span>
              </th>
              <th className="py-2.5 px-2 w-8 text-center text-slate-400">
                <ArrowRight className="w-3.5 h-3.5 mx-auto" />
              </th>
              <th className="py-2.5 px-3 w-1/3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Copied Row Result
                </span>
              </th>
              <th className="py-2.5 px-3 w-28 text-right">Rule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {config.columns.map((col) => {
              const diff = diffs[col.name];
              const isShared = Boolean(diff?.isShared);
              const isOverridden = diff?.status === 'overridden';
              const isExcluded = diff?.status === 'excluded';
              const isLookup = col.name === config.lookupColumn;

              return (
                <tr
                  key={col.id}
                  className={`transition-colors ${
                    isShared
                      ? 'bg-purple-50/20 dark:bg-purple-950/10'
                      : isOverridden
                      ? 'bg-indigo-50/20 dark:bg-indigo-950/10'
                      : isExcluded
                      ? 'bg-amber-50/20 dark:bg-amber-950/10'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {/* Column Name */}
                  <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span>{col.name}</span>
                      {col.isPrimaryKey && (
                        <span className="text-[10px] text-amber-500" title="Primary Key">★</span>
                      )}
                      {(col.isIdentity || (col.identityType && col.identityType !== 'none')) && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1 py-0.2 rounded" title="Auto-Generated Identity">
                          ⚡
                        </span>
                      )}
                      {isLookup && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1 rounded">
                          lookup
                        </span>
                      )}
                      {isShared && (
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-1 py-0.2 rounded" title="Inherited from Shared Properties">
                          shared
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Source Value */}
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                    {isEditingSource ? (
                      <input
                        type="text"
                        value={sampleSource[col.name] !== undefined ? String(sampleSource[col.name]) : ''}
                        onChange={(e) => handleCellChange(col.name, e.target.value)}
                        placeholder="sample value"
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                      />
                    ) : (
                      <span className="truncate block max-w-xs" title={String(diff?.original)}>
                        {diff?.original !== undefined && diff?.original !== null
                          ? String(diff?.original)
                          : <span className="text-slate-400 italic">NULL</span>}
                      </span>
                    )}
                  </td>

                  {/* Arrow Indicator */}
                  <td className="py-2 px-2 text-center text-slate-400 text-xs">
                    →
                  </td>

                  {/* Copied Value */}
                  <td className="py-2 px-3">
                    {isExcluded ? (
                      col.isIdentity || (col.identityType && col.identityType !== 'none') ? (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-sans font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Auto-Generated (Next Sequence ID)</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 text-[11px] italic font-sans font-medium">
                          Omitted (Auto Default)
                        </span>
                      )
                    ) : isShared ? (
                      <span className="font-bold text-purple-600 dark:text-purple-400 truncate block max-w-xs" title={String(diff?.copied)}>
                        {diff?.copied !== null ? String(diff?.copied) : 'NULL'}
                      </span>
                    ) : isOverridden ? (
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate block max-w-xs" title={String(diff?.copied)}>
                        {diff?.copied !== null ? String(diff?.copied) : 'NULL'}
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 truncate block max-w-xs">
                        {String(diff?.copied)}
                      </span>
                    )}
                  </td>

                  {/* Status / Rule */}
                  <td className="py-2 px-3 text-right">
                    {isExcluded ? (
                      col.isIdentity || (col.identityType && col.identityType !== 'none') ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded font-sans font-medium">
                          ⚡ Auto-Gen
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Excluded
                        </span>
                      )
                    ) : isShared ? (
                      <span
                        className="text-[10px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded font-sans font-medium border border-purple-200 dark:border-purple-800/60 inline-flex items-center gap-1"
                        title={`Inherited from shared property: ${diff?.sharedRuleName || col.name}`}
                      >
                        <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                        <span>Shared</span>
                      </span>
                    ) : isOverridden ? (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded font-sans">
                        {config.overrides[col.name]?.mode}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        verbatim
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
