import React, { useState, useMemo, useEffect } from 'react';
import {
  Database,
  Table,
  Sliders,
  Code,
  FileSpreadsheet,
  Download,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  BookOpen,
  Layers,
  ArrowRight,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DbRowCopyConfig,
  TableColumn,
  ColumnOverride,
  SharedPropertyRule,
  RowCopyOptions,
  DB_ROW_COPY_PRESETS,
  generateRowCopySql,
  simulateRowCopy,
  findMatchingSharedProperty,
} from '../../../utils/dbRowCopyGenerator';
import { TableDefinitionEditor } from './TableDefinitionEditor';
import { RowLookupSelector } from './RowLookupSelector';
import { ColumnOverridesEditor } from './ColumnOverridesEditor';
import { SharedPropertiesEditor } from './SharedPropertiesEditor';
import { SqlOutputPreview } from './SqlOutputPreview';
import { RowDiffPreviewGrid } from './RowDiffPreviewGrid';
import { ConfigImportExportModal } from './ConfigImportExportModal';

interface DbRowCopyToolProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

const STORAGE_KEY_LAST_CONFIG = 'devhub_db_row_copy_active_config';

export const DbRowCopyTool: React.FC<DbRowCopyToolProps> = ({
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  // Load initial config from localStorage or default to Preset 1
  const [config, setConfig] = useState<DbRowCopyConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tableName && Array.isArray(parsed.columns)) {
          return parsed;
        }
      }
    } catch {}
    return DB_ROW_COPY_PRESETS[0];
  });

  const [activeTab, setActiveTab] = useState<'builder' | 'shared' | 'diff' | 'sql'>('builder');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Persist current config to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_CONFIG, JSON.stringify(config));
    } catch {}
  }, [config]);

  // Generate SQL dynamically
  const sqlResult = useMemo(() => {
    return generateRowCopySql(config);
  }, [config]);

  // Count active shared rules for badge
  const activeSharedCount = useMemo(() => {
    return (Object.values(config.sharedProperties || {}) as SharedPropertyRule[]).filter((r) => Boolean(r && r.active)).length;
  }, [config.sharedProperties]);

  // Handlers for updating configuration state
  const handleUpdateTableName = (tableName: string) => {
    setConfig((prev) => ({ ...prev, tableName }));
  };

  const handleUpdateSchemaName = (schemaName: string | undefined) => {
    setConfig((prev) => ({ ...prev, schemaName }));
  };

  const handleUpdateColumns = (columns: TableColumn[]) => {
    setConfig((prev) => {
      // If the current lookup column was deleted, fallback to pk or first column
      let lookupCol = prev.lookupColumn;
      if (!columns.some((c) => c.name === lookupCol)) {
        const pk = columns.find((c) => c.isPrimaryKey);
        lookupCol = pk ? pk.name : columns[0]?.name || 'id';
      }
      return {
        ...prev,
        columns,
        lookupColumn: lookupCol,
      };
    });
  };

  const handleUpdateLookupColumn = (lookupColumn: string) => {
    setConfig((prev) => ({ ...prev, lookupColumn }));
  };

  const handleUpdateLookupValue = (lookupValue: string) => {
    setConfig((prev) => ({ ...prev, lookupValue }));
  };

  const handleUpdateLookupOperator = (lookupOperator: '=' | 'IN' | 'LIKE') => {
    setConfig((prev) => ({ ...prev, lookupOperator }));
  };

  const handleUpdateOverride = (colName: string, override: Partial<ColumnOverride> | null) => {
    setConfig((prev) => {
      const nextOverrides = { ...prev.overrides };
      if (!override) {
        delete nextOverrides[colName];
      } else {
        nextOverrides[colName] = {
          ...(nextOverrides[colName] || {
            columnName: colName,
            mode: 'constant',
            active: true,
          }),
          ...override,
        };
      }
      return {
        ...prev,
        overrides: nextOverrides,
      };
    });
  };

  const handleBatchApplyOverrides = (newOverrides: Record<string, ColumnOverride>) => {
    setConfig((prev) => ({ ...prev, overrides: newOverrides }));
  };

  // Shared Properties handlers
  const handleUpdateSharedProperty = (key: string, rule: Partial<SharedPropertyRule> | null) => {
    setConfig((prev) => {
      const nextShared = { ...(prev.sharedProperties || {}) };
      if (!rule) {
        delete nextShared[key];
      } else {
        nextShared[key] = {
          ...(nextShared[key] || {
            id: `sp_${key}_${Date.now()}`,
            columnName: key,
            mode: 'constant',
            active: true,
            isCustom: true,
            matchCaseInsensitive: true,
          }),
          ...rule,
        };
      }
      return {
        ...prev,
        sharedProperties: nextShared,
      };
    });
  };

  const handleBatchUpdateSharedProperties = (rules: Record<string, SharedPropertyRule>) => {
    setConfig((prev) => ({
      ...prev,
      sharedProperties: rules,
    }));
  };

  // Bake all matching shared rules into table-specific explicit overrides
  const handleApplySharedToTableOverrides = () => {
    setConfig((prev) => {
      const nextOverrides = { ...prev.overrides };
      const shared = prev.sharedProperties || {};
      let appliedCount = 0;

      prev.columns.forEach((col) => {
        const match = findMatchingSharedProperty(col.name, shared);
        if (match && match.active) {
          nextOverrides[col.name] = {
            columnName: col.name,
            mode: match.mode,
            constantValue: match.constantValue,
            expression: match.expression,
            prefix: match.prefix,
            suffix: match.suffix,
            sequenceStep: match.sequenceStep,
            randomType: match.randomType,
            active: true,
          };
          appliedCount++;
        }
      });

      return {
        ...prev,
        overrides: nextOverrides,
      };
    });
  };

  const handleUpdateOptions = (opts: Partial<RowCopyOptions>) => {
    setConfig((prev) => ({
      ...prev,
      options: { ...prev.options, ...opts },
    }));
  };

  const handleUpdateSampleSourceRow = (row: Record<string, any>) => {
    setConfig((prev) => ({
      ...prev,
      sampleSourceRow: row,
    }));
  };

  const handleLoadConfig = (newConfig: DbRowCopyConfig) => {
    setConfig(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Toolbar */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Database Row Copy Tool
              </h2>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 font-semibold">
                {config.options.dialect.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Duplicate & clone database rows by ID or custom column with selective column overrides & multi-dialect SQL
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Presets & Config ({DB_ROW_COPY_PRESETS.length})</span>
          </button>

          {onToggleFullScreen && (
            <button
              type="button"
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'builder'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-indigo-500" />
            <span>Row Copy Builder</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shared')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'shared'
                ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
            <span>Shared Properties</span>
            {activeSharedCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold">
                {activeSharedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'diff'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-pink-500" />
            <span>Live Row Diff Simulation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sql'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-sky-500" />
            <span>SQL & Scripts</span>
          </button>
        </div>

        {/* Quick Summary Pill in Header */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>Target: <strong className="text-slate-700 dark:text-slate-200">{config.schemaName ? `${config.schemaName}.${config.tableName}` : config.tableName}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Lookup: <strong className="text-emerald-600 dark:text-emerald-400">{config.lookupColumn} = {config.lookupValue || '?'}</strong></span>
        </div>
      </div>

      {/* TAB 1: BUILDER VIEW */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Table Definition & Row Lookup Key */}
            <div className="lg:col-span-6 space-y-6">
              <TableDefinitionEditor
                tableName={config.tableName}
                schemaName={config.schemaName}
                columns={config.columns}
                onUpdateTableName={handleUpdateTableName}
                onUpdateSchemaName={handleUpdateSchemaName}
                onUpdateColumns={handleUpdateColumns}
                onSelectLookupColumn={handleUpdateLookupColumn}
              />

              <RowLookupSelector
                columns={config.columns}
                lookupColumn={config.lookupColumn}
                lookupValue={config.lookupValue}
                lookupOperator={config.lookupOperator}
                onUpdateLookupColumn={handleUpdateLookupColumn}
                onUpdateLookupValue={handleUpdateLookupValue}
                onUpdateLookupOperator={handleUpdateLookupOperator}
              />
            </div>

            {/* Right Column: Column Overrides Editor */}
            <div className="lg:col-span-6 space-y-6">
              <ColumnOverridesEditor
                columns={config.columns}
                overrides={config.overrides}
                sharedProperties={config.sharedProperties}
                onUpdateOverride={handleUpdateOverride}
                onBatchApplyOverrides={handleBatchApplyOverrides}
              />
            </div>
          </div>

          {/* Bottom Full-width Generated SQL Preview */}
          <SqlOutputPreview
            sqlResult={sqlResult}
            options={config.options}
            onUpdateOptions={handleUpdateOptions}
          />
        </div>
      )}

      {/* TAB 2: SHARED GENERIC PROPERTIES */}
      {activeTab === 'shared' && (
        <SharedPropertiesEditor
          columns={config.columns}
          sharedProperties={config.sharedProperties || {}}
          options={config.options}
          onUpdateSharedProperty={handleUpdateSharedProperty}
          onBatchUpdateSharedProperties={handleBatchUpdateSharedProperties}
          onUpdateOptions={handleUpdateOptions}
          onApplyToTableOverrides={handleApplySharedToTableOverrides}
        />
      )}

      {/* TAB 2: LIVE ROW DIFF SIMULATION */}
      {activeTab === 'diff' && (
        <div className="space-y-6">
          <RowDiffPreviewGrid
            config={config}
            onUpdateSampleSourceRow={handleUpdateSampleSourceRow}
          />
        </div>
      )}

      {/* TAB 3: DEDICATED SQL & SCRIPT VIEW */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          <SqlOutputPreview
            sqlResult={sqlResult}
            options={config.options}
            onUpdateOptions={handleUpdateOptions}
          />
        </div>
      )}

      {/* Presets, Export & Import Modal */}
      <ConfigImportExportModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentConfig={config}
        onLoadConfig={handleLoadConfig}
      />
    </div>
  );
};
