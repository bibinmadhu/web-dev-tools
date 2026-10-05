import React, { useState } from 'react';
import {
  Sliders,
  Check,
  X,
  Sparkles,
  Zap,
  RotateCcw,
  Ban,
  ArrowRight,
  Hash,
  Type,
  Calendar,
  Layers,
  Wand2,
} from 'lucide-react';
import {
  TableColumn,
  ColumnOverride,
  OverrideMode,
  RandomMockType,
  ColumnDataType,
} from '../../../utils/dbRowCopyGenerator';

interface ColumnOverridesEditorProps {
  columns: TableColumn[];
  overrides: Record<string, ColumnOverride>;
  onUpdateOverride: (colName: string, override: Partial<ColumnOverride> | null) => void;
  onBatchApplyOverrides: (newOverrides: Record<string, ColumnOverride>) => void;
}

export const ColumnOverridesEditor: React.FC<ColumnOverridesEditorProps> = ({
  columns,
  overrides,
  onUpdateOverride,
  onBatchApplyOverrides,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'overridden' | 'verbatim'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Action: Auto-exclude primary key (ideal for serial auto-increment)
  const handleExcludePrimaryKey = () => {
    const next = { ...overrides };
    columns.forEach((col) => {
      if (col.isPrimaryKey || col.isIdentity) {
        next[col.name] = {
          columnName: col.name,
          mode: 'exclude',
          active: true,
        };
      }
    });
    onBatchApplyOverrides(next);
  };

  // Quick Action: Auto-generate UUID for UUID PKs
  const handleAutoGenerateUuids = () => {
    const next = { ...overrides };
    columns.forEach((col) => {
      if (col.type === 'UUID') {
        next[col.name] = {
          columnName: col.name,
          mode: 'mock_random',
          randomType: 'uuid',
          active: true,
        };
      }
    });
    onBatchApplyOverrides(next);
  };

  // Quick Action: Suffix " (Copy)" to textual columns
  const handleSuffixCopyNames = () => {
    const next = { ...overrides };
    columns.forEach((col) => {
      if (
        (col.type === 'VARCHAR' || col.type === 'TEXT') &&
        !col.name.toLowerCase().includes('email') &&
        !col.name.toLowerCase().includes('status')
      ) {
        next[col.name] = {
          columnName: col.name,
          mode: 'prefix_suffix',
          suffix: ' (Copy)',
          active: true,
        };
      }
    });
    onBatchApplyOverrides(next);
  };

  // Reset all
  const handleResetAll = () => {
    onBatchApplyOverrides({});
  };

  // Filter columns
  const filteredColumns = columns.filter((col) => {
    const ov = overrides[col.name];
    const isOverridden = ov && ov.active && ov.mode !== 'exclude';
    const isExcluded = ov && ov.active && ov.mode === 'exclude';
    const hasOverride = isOverridden || isExcluded;

    if (activeFilter === 'overridden' && !hasOverride) return false;
    if (activeFilter === 'verbatim' && hasOverride) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return col.name.toLowerCase().includes(q) || col.type.toLowerCase().includes(q);
    }
    return true;
  });

  const totalOverridden = Object.values(overrides).filter((o: ColumnOverride) => Boolean(o && o.active)).length;

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header and Quick Automation Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Column Overrides
              </h3>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {totalOverridden} of {columns.length} columns modified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize values for the copied row. Unmodified columns are copied verbatim from the source.
            </p>
          </div>
        </div>

        {/* Quick Batch Setup Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleExcludePrimaryKey}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Exclude primary key so the database auto-increments or generates default"
          >
            <Ban className="w-3 h-3 text-amber-500" />
            <span>Exclude PK</span>
          </button>

          <button
            type="button"
            onClick={handleAutoGenerateUuids}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Auto-assign random UUID generator to all UUID columns"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>New UUIDs</span>
          </button>

          <button
            type="button"
            onClick={handleSuffixCopyNames}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Append (Copy) to all titles and names"
          >
            <Wand2 className="w-3 h-3 text-emerald-500" />
            <span>+ &apos;(Copy)&apos; Suffix</span>
          </button>

          {totalOverridden > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
              title="Reset all columns to copy verbatim"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            All Columns ({columns.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('overridden')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'overridden'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Overridden ({totalOverridden})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('verbatim')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeFilter === 'verbatim'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Verbatim ({columns.length - totalOverridden})
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter columns..."
          className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden font-mono w-44"
        />
      </div>

      {/* Columns Override Cards */}
      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
        {filteredColumns.map((col) => {
          const override = overrides[col.name];
          const isActive = Boolean(override?.active);
          const currentMode: OverrideMode = override?.mode || 'constant';

          return (
            <div
              key={col.id}
              className={`p-3 rounded-xl border transition-all ${
                isActive
                  ? override.mode === 'exclude'
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                    : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
                  : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdateOverride(col.name, {
                          columnName: col.name,
                          mode: override?.mode || (col.isPrimaryKey ? 'exclude' : 'constant'),
                          active: true,
                          constantValue: override?.constantValue || '',
                        });
                      } else {
                        onUpdateOverride(col.name, { active: false });
                      }
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <span className="font-mono font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {col.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {col.type}
                  </span>
                  {col.isPrimaryKey && (
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
                      Primary Key
                    </span>
                  )}
                </div>

                <div>
                  {isActive ? (
                    <span
                      className={`text-[11px] font-medium font-mono px-2 py-0.5 rounded ${
                        override.mode === 'exclude'
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                          : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {override.mode === 'exclude'
                        ? 'Omitted from INSERT (Auto Default)'
                        : `Override: ${override.mode}`}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      Copied Verbatim
                    </span>
                  )}
                </div>
              </div>

              {/* Mode Selection and Inputs when Active */}
              {isActive && (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 items-center">
                  {/* Mode Dropdown */}
                  <div className="sm:col-span-4">
                    <select
                      value={currentMode}
                      onChange={(e) =>
                        onUpdateOverride(col.name, {
                          mode: e.target.value as OverrideMode,
                          active: true,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                    >
                      <option value="constant">Fixed Constant Value</option>
                      <option value="prefix_suffix">Prefix / Suffix Concatenation</option>
                      <option value="expression">Raw SQL Expression</option>
                      <option value="mock_random">Random / Mock Generator</option>
                      <option value="sequence_increment">Sequence Increment (+N)</option>
                      <option value="null">Set to NULL</option>
                      <option value="exclude">Exclude Column (Auto-Generated ID)</option>
                    </select>
                  </div>

                  {/* Mode-Specific Value Input */}
                  <div className="sm:col-span-8">
                    {currentMode === 'constant' && (
                      <input
                        type="text"
                        value={override.constantValue || ''}
                        onChange={(e) =>
                          onUpdateOverride(col.name, { constantValue: e.target.value })
                        }
                        placeholder={
                          col.type === 'BOOLEAN'
                            ? 'true or false'
                            : col.type === 'NUMERIC' || col.type === 'INTEGER'
                            ? 'e.g. 199.95'
                            : `New constant value for ${col.name}`
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                      />
                    )}

                    {currentMode === 'expression' && (
                      <input
                        type="text"
                        value={override.expression || ''}
                        onChange={(e) =>
                          onUpdateOverride(col.name, { expression: e.target.value })
                        }
                        placeholder="e.g. NOW(), gen_random_uuid(), CURRENT_TIMESTAMP + INTERVAL '7 days'"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                      />
                    )}

                    {currentMode === 'prefix_suffix' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={override.prefix || ''}
                          onChange={(e) =>
                            onUpdateOverride(col.name, { prefix: e.target.value })
                          }
                          placeholder="Prefix e.g. COPY_"
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                        />
                        <input
                          type="text"
                          value={override.suffix || ''}
                          onChange={(e) =>
                            onUpdateOverride(col.name, { suffix: e.target.value })
                          }
                          placeholder="Suffix e.g. _CLONE"
                          className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                        />
                      </div>
                    )}

                    {currentMode === 'sequence_increment' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono">Increment by:</span>
                        <input
                          type="number"
                          value={override.sequenceStep ?? 1}
                          onChange={(e) =>
                            onUpdateOverride(col.name, {
                              sequenceStep: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-24 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-center font-bold"
                        />
                        <span className="text-[11px] text-slate-400 font-mono">
                          (Result: {col.name} + {override.sequenceStep ?? 1})
                        </span>
                      </div>
                    )}

                    {currentMode === 'mock_random' && (
                      <select
                        value={override.randomType || 'uuid'}
                        onChange={(e) =>
                          onUpdateOverride(col.name, {
                            randomType: e.target.value as RandomMockType,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                      >
                        <option value="uuid">New Random UUID (e.g. gen_random_uuid())</option>
                        <option value="email">Randomized Email Address (copy_xxxx@domain)</option>
                        <option value="timestamp_now">Current Timestamp (NOW())</option>
                        <option value="timestamp_future">Future Expiration (+30 Days)</option>
                        <option value="numeric_code">Random Numeric Code (6 digits)</option>
                        <option value="name_copy">Append &apos; (Clone)&apos; to Original</option>
                      </select>
                    )}

                    {currentMode === 'null' && (
                      <span className="text-xs text-slate-500 italic">
                        Sets column value explicitly to <code className="font-mono font-bold">NULL</code>.
                      </span>
                    )}

                    {currentMode === 'exclude' && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        Column will be omitted from the <code className="font-mono">INSERT INTO</code> statement, allowing the database to assign default or auto-increment values.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
