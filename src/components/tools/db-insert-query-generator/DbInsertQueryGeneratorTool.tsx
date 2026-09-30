import React, { useState, useMemo, useEffect } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Upload,
  AlertTriangle,
  Code,
  Code2,
  Sparkles,
  Maximize2,
  Minimize2,
  Sliders,
  Play,
  Zap,
  FileText,
  Info,
  Filter,
  FileJson,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  Settings2,
  Layers,
  Key,
  ShieldAlert,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Split,
  Eye,
  Table,
  ListFilter,
} from 'lucide-react';
import {
  PostgresInsertType,
  ValueGenerationMode,
  GeneratorType,
  InsertColumnConfig,
  ConflictStrategy,
  InsertStrategy,
  InsertQueryOptions,
  COMMON_POSTGRES_TYPES,
  DEFAULT_INSERT_OPTIONS,
  DB_INSERT_PRESETS,
  generatePostgresInsertQuery,
  parsePostgresSchema,
  parsePreferredValuesInput,
  generateCreateTableDdl,
} from '../../../utils/dbInsertQueryGenerator';
import { DbInsertConfigModal } from './DbInsertConfigModal';
import { PreferredValuesModal } from './PreferredValuesModal';
import { ExportDdlModal } from './ExportDdlModal';

interface DbInsertQueryGeneratorToolProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

const STORAGE_KEY_OPTIONS = 'devhub_db_insert_saved_options';

export const DbInsertQueryGeneratorTool: React.FC<DbInsertQueryGeneratorToolProps> = ({
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'columns' | 'options' | 'presets'>('columns');

  // Core configuration options
  const [options, setOptions] = useState<InsertQueryOptions>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OPTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_INSERT_OPTIONS;
  });

  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedParams, setCopiedParams] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDdlModal, setShowDdlModal] = useState(false);
  const [showExportDdlModal, setShowExportDdlModal] = useState(false);
  const [editingPoolCol, setEditingPoolCol] = useState<InsertColumnConfig | null>(null);
  const [ddlInputText, setDdlInputText] = useState('');
  const [ddlError, setDdlError] = useState<string | null>(null);
  const [outputTab, setOutputTab] = useState<'sql' | 'parameters' | 'grid'>('sql');

  // Persist options
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OPTIONS, JSON.stringify(options));
    } catch {
      // ignore
    }
  }, [options]);

  // Generate output query whenever options change
  const queryResult = useMemo(() => {
    return generatePostgresInsertQuery(options);
  }, [options]);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(queryResult.sql);
      setCopiedSql(true);
      showStatus('INSERT query copied to clipboard!');
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyParams = async () => {
    if (!queryResult.parametersJson) return;
    try {
      await navigator.clipboard.writeText(queryResult.parametersJson);
      setCopiedParams(true);
      showStatus('Parameters JSON copied to clipboard!');
      setTimeout(() => setCopiedParams(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyCsv = async () => {
    if (!queryResult.previewCsv) return;
    try {
      await navigator.clipboard.writeText(queryResult.previewCsv);
      setCopiedCsv(true);
      showStatus('Preview CSV copied to clipboard!');
      setTimeout(() => setCopiedCsv(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadCsv = () => {
    if (!queryResult.previewCsv) return;
    const blob = new Blob([queryResult.previewCsv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_${options.tableName || 'table'}_${options.rowCount}rows.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Downloaded .csv file');
  };

  const handleCopyPreviewJson = async () => {
    if (!queryResult.previewRows) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(queryResult.previewRows, null, 2));
      showStatus('Preview rows JSON copied to clipboard!');
    } catch {
      // fallback
    }
  };

  const handleDownloadSql = () => {
    const blob = new Blob([queryResult.sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insert_${options.tableName || 'table'}_${options.rowCount}rows.sql`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Downloaded .sql file');
  };

  // Add a new column
  const handleAddColumn = () => {
    const newId = `col_${Date.now().toString(36)}`;
    const newCol: InsertColumnConfig = {
      id: newId,
      name: `field_${options.columns.length + 1}`,
      type: 'varchar',
      maxLength: 255,
      nullable: true,
      hasDefault: false,
      isPrimaryKey: false,
      isUnique: false,
      excludeFromInsert: false,
      valueMode: 'generator',
      fixedValue: '',
      valuePool: [],
      generatorType: 'lorem',
    };
    setOptions((prev) => ({
      ...prev,
      columns: [...prev.columns, newCol],
    }));
  };

  // Move column Up / Down
  const handleMoveColumn = (id: string, direction: -1 | 1) => {
    const idx = options.columns.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= options.columns.length) return;
    const newCols = [...options.columns];
    const [moved] = newCols.splice(idx, 1);
    newCols.splice(targetIdx, 0, moved);
    setOptions((prev) => ({ ...prev, columns: newCols }));
  };

  // Duplicate column
  const handleDuplicateColumn = (id: string) => {
    const colToDup = options.columns.find((c) => c.id === id);
    if (!colToDup) return;
    const newCol: InsertColumnConfig = {
      ...colToDup,
      id: `col_${Date.now().toString(36)}`,
      name: `${colToDup.name}_copy`,
      isPrimaryKey: false,
    };
    const idx = options.columns.findIndex((c) => c.id === id);
    const newCols = [...options.columns];
    newCols.splice(idx + 1, 0, newCol);
    setOptions((prev) => ({ ...prev, columns: newCols }));
    showStatus(`Duplicated column "${colToDup.name}"`);
  };

  // Remove a column
  const handleRemoveColumn = (id: string) => {
    setOptions((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== id),
    }));
  };

  // Update specific column property
  const handleUpdateColumn = (id: string, updates: Partial<InsertColumnConfig>) => {
    setOptions((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updates };
        // If type changed, provide smart defaults for size constraints if not already set
        if (updates.type && updates.type !== c.type) {
          if (['varchar', 'character varying'].includes(updates.type) && !updated.maxLength) {
            updated.maxLength = 255;
          } else if (updates.type === 'character' && !updated.maxLength) {
            updated.maxLength = 10;
          } else if (['numeric', 'decimal'].includes(updates.type) && !updated.precision) {
            updated.precision = 10;
            updated.scale = 2;
          }
        }
        return updated;
      }),
    }));
  };

  // DDL Schema Quick Ingestion
  const handleParseDdlSubmit = () => {
    setDdlError(null);
    if (!ddlInputText.trim()) {
      setDdlError('Please paste a PostgreSQL CREATE TABLE statement.');
      return;
    }
    const result = parsePostgresSchema(ddlInputText);
    if (!result.success || result.columns.length === 0) {
      setDdlError(result.error || 'Failed to parse table schema.');
      return;
    }

    const pkColumns = result.columns.filter((c) => c.isPrimaryKey).map((c) => c.name);
    const nonPkColumns = result.columns.filter((c) => !c.isPrimaryKey && !c.excludeFromInsert).map((c) => c.name);

    setOptions((prev) => ({
      ...prev,
      tableName: result.tableName,
      schema: result.schema || 'public',
      columns: result.columns,
      conflictTargetColumns: pkColumns.length > 0 ? pkColumns : prev.conflictTargetColumns,
      conflictUpdateColumns: nonPkColumns.slice(0, 4),
    }));

    setShowDdlModal(false);
    setDdlInputText('');
    showStatus(`Parsed schema for table "${result.tableName}" with ${result.columns.length} columns!`);
  };

  // Load a Preset
  const handleLoadPreset = (presetId: string) => {
    const preset = DB_INSERT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setOptions(preset.options);
    showStatus(`Loaded preset "${preset.name}"!`);
  };

  // Reset to default
  const handleReset = () => {
    setOptions(DEFAULT_INSERT_OPTIONS);
    showStatus('Reset to default schema & options.');
  };

  return (
    <div className={`flex flex-col h-full bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 ${isFullScreen ? 'fixed inset-0 z-50 p-4' : ''}`}>
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 rounded-t-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">Database Insert Query Generator</h1>
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                POSTGRESQL
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bulk INSERT queries, DDL schema parsing, preferred values pools, UPSERT (ON CONFLICT), and mock generators
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Parse DDL Button */}
          <button
            onClick={() => setShowDdlModal(true)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Import schema from CREATE TABLE DDL"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Parse DDL Schema</span>
          </button>

          {/* Export DDL Schema */}
          <button
            onClick={() => setShowExportDdlModal(true)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="View or export schema as CREATE TABLE DDL"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Export DDL</span>
          </button>

          {/* Import / Export JSON */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Backup, export or import configuration as JSON"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Config JSON</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset options to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusMessage && (
        <div className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium flex items-center justify-between animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="opacity-80 hover:opacity-100">
            &times;
          </button>
        </div>
      )}

      {/* Main Split Grid Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Schema Builder & Options (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {/* Tabs Navigation */}
          <div className="flex items-center justify-between px-4 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('columns')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'columns'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Columns &amp; Preferred Values</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {options.columns.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('options')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'options'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Query Strategy &amp; UPSERT</span>
              </button>

              <button
                onClick={() => setActiveTab('presets')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'presets'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Presets</span>
              </button>
            </div>

            {/* Table Name Quick Edit */}
            <div className="hidden sm:flex items-center gap-1 text-xs pb-2 font-mono">
              <span className="text-slate-400">table:</span>
              <input
                type="text"
                value={options.tableName}
                onChange={(e) => setOptions((prev) => ({ ...prev, tableName: e.target.value }))}
                className="w-32 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold"
                placeholder="table_name"
              />
            </div>
          </div>

          {/* Tab 1: Column Definitions & Preferred Values Grid */}
          {activeTab === 'columns' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
              {/* Table Info Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Schema Name
                  </label>
                  <input
                    type="text"
                    value={options.schema}
                    onChange={(e) => setOptions((prev) => ({ ...prev, schema: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                    placeholder="public"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Target Table Name
                  </label>
                  <input
                    type="text"
                    value={options.tableName}
                    onChange={(e) => setOptions((prev) => ({ ...prev, tableName: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold"
                    placeholder="business_entities"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Rows to Generate
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={options.rowCount}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          rowCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                    />
                    <div className="flex gap-1">
                      {[1, 5, 10, 50].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setOptions((prev) => ({ ...prev, rowCount: n }))}
                          className={`px-1.5 py-1 text-[10px] font-mono rounded ${
                            options.rowCount === n
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column Rows Header */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Configuring {options.columns.filter((c) => !c.excludeFromInsert).length} active column(s) for INSERT:
                </div>
                <button
                  onClick={handleAddColumn}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Column</span>
                </button>
              </div>

              {/* Scrollable Column List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {options.columns.map((col, index) => (
                  <div
                    key={col.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs ${
                      col.excludeFromInsert
                        ? 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 opacity-70'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      {/* Left: Column Name & Type */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] text-slate-400">#{index + 1}</span>
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => handleUpdateColumn(col.id, { name: e.target.value })}
                          className="px-2 py-1 font-mono font-bold text-xs rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="column_name"
                        />

                        {/* Data Type Select */}
                        <select
                          value={col.type}
                          onChange={(e) =>
                            handleUpdateColumn(col.id, {
                              type: e.target.value as PostgresInsertType,
                            })
                          }
                          className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300"
                        >
                          {COMMON_POSTGRES_TYPES.map((t) => (
                            <option key={t.type} value={t.type}>
                              {t.label}
                            </option>
                          ))}
                        </select>

                        {/* Size Constraints Inputs: Length for VARCHAR/CHAR, Precision & Scale for NUMERIC/DECIMAL */}
                        {(col.type === 'character varying' || col.type === 'varchar' || col.type === 'character') && (
                          <div
                            className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 text-[11px]"
                            title="Maximum string length constraint (e.g. 25 for character varying(25))"
                          >
                            <span className="text-slate-400 font-mono text-[10px]">len:</span>
                            <input
                              type="number"
                              min={1}
                              max={10485760}
                              value={col.maxLength !== undefined ? col.maxLength : ''}
                              onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                handleUpdateColumn(col.id, { maxLength: val && val > 0 ? val : undefined });
                              }}
                              placeholder="e.g. 25"
                              className="w-14 bg-transparent text-slate-700 dark:text-slate-300 font-mono text-xs focus:outline-none"
                            />
                            {col.maxLength && (
                              <span className="text-[9px] font-mono px-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800/60">
                                max {col.maxLength}
                              </span>
                            )}
                          </div>
                        )}

                        {(col.type === 'numeric' || col.type === 'decimal') && (
                          <div
                            className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 text-[11px]"
                            title="NUMERIC(precision, scale): e.g. precision=2 for numeric(2), or precision=10, scale=2"
                          >
                            <span className="text-slate-400 font-mono text-[10px]">p:</span>
                            <input
                              type="number"
                              min={1}
                              max={1000}
                              value={col.precision !== undefined ? col.precision : ''}
                              onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                                handleUpdateColumn(col.id, { precision: val && val > 0 ? val : undefined });
                              }}
                              placeholder="prec"
                              className="w-10 bg-transparent text-slate-700 dark:text-slate-300 font-mono text-xs focus:outline-none"
                            />
                            <span className="text-slate-400 font-mono text-[10px] ml-0.5">s:</span>
                            <input
                              type="number"
                              min={0}
                              max={1000}
                              value={col.scale !== undefined ? col.scale : ''}
                              onChange={(e) => {
                                const val = e.target.value !== '' ? parseInt(e.target.value, 10) : undefined;
                                handleUpdateColumn(col.id, { scale: val !== undefined && val >= 0 ? val : undefined });
                              }}
                              placeholder="scale"
                              className="w-10 bg-transparent text-slate-700 dark:text-slate-300 font-mono text-xs focus:outline-none"
                            />
                            {col.precision && (
                              <span className="text-[9px] font-mono px-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/60">
                                max {Math.max(0, col.precision - (col.scale ?? 0)) > 0 ? Math.pow(10, col.precision - (col.scale ?? 0)) - 1 : 0}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Primary Key / Unique Badges */}
                        <button
                          type="button"
                          onClick={() => handleUpdateColumn(col.id, { isPrimaryKey: !col.isPrimaryKey })}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors flex items-center gap-1 ${
                            col.isPrimaryKey
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                          }`}
                          title="Toggle Primary Key"
                        >
                          <Key className="w-2.5 h-2.5" />
                          <span>PK</span>
                        </button>
                      </div>

                      {/* Right: Actions (Move, Duplicate, Exclude, Delete) */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-slate-50 dark:bg-slate-950">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveColumn(col.id, -1)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                            title="Move column up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === options.columns.length - 1}
                            onClick={() => handleMoveColumn(col.id, 1)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors border-l border-slate-200 dark:border-slate-800"
                            title="Move column down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDuplicateColumn(col.id)}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                          title="Duplicate column"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 select-none ml-1">
                          <input
                            type="checkbox"
                            checked={col.excludeFromInsert}
                            onChange={(e) => handleUpdateColumn(col.id, { excludeFromInsert: e.target.checked })}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Exclude (auto sequence)</span>
                        </label>

                        <button
                          onClick={() => handleRemoveColumn(col.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Remove column"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Value Generation Configuration */}
                    {!col.excludeFromInsert && (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1 items-center">
                        {/* Value Mode Selector */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] text-slate-500 font-medium mb-1">
                            Value Mode
                          </label>
                          <select
                            value={col.valueMode}
                            onChange={(e) =>
                              handleUpdateColumn(col.id, {
                                valueMode: e.target.value as ValueGenerationMode,
                              })
                            }
                            className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                          >
                            <option value="generator">Automated Generator</option>
                            <option value="pool">Pool / Preferred Values</option>
                            <option value="fixed">Fixed Constant Value</option>
                            <option value="default">SQL DEFAULT</option>
                            <option value="null">SQL NULL</option>
                          </select>
                        </div>

                        {/* Dynamic Value Input according to mode */}
                        <div className="sm:col-span-8">
                          {col.valueMode === 'fixed' && (
                            <div>
                              <label className="block text-[10px] text-slate-500 font-medium mb-1">
                                Fixed Value
                              </label>
                              <input
                                type="text"
                                value={col.fixedValue}
                                onChange={(e) => handleUpdateColumn(col.id, { fixedValue: e.target.value })}
                                className="w-full px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                                placeholder="e.g. 'Active', 42, '2026-01-01'"
                              />
                            </div>
                          )}

                          {col.valueMode === 'pool' && (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[10px] text-slate-500 font-medium">
                                  Preferred Values ({col.valuePool.length} defined)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setEditingPoolCol(col)}
                                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                  <ListFilter className="w-3 h-3" />
                                  <span>Spreadsheet / Bulk Pool</span>
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={col.valuePool.join(', ')}
                                  onChange={(e) =>
                                    handleUpdateColumn(col.id, {
                                      valuePool: parsePreferredValuesInput(e.target.value),
                                    })
                                  }
                                  className="flex-1 px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                                  placeholder="e.g. Micro SME, SME, Small Midcap, Enterprise"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingPoolCol(col)}
                                  className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold hover:bg-indigo-100 shrink-0"
                                  title="Open Bulk Pool Editor"
                                >
                                  Edit Pool
                                </button>
                              </div>
                            </div>
                          )}

                          {col.valueMode === 'generator' && (
                            <div>
                              <label className="block text-[10px] text-slate-500 font-medium mb-1">
                                Mock Generator Pattern
                              </label>
                              <select
                                value={col.generatorType}
                                onChange={(e) =>
                                  handleUpdateColumn(col.id, {
                                    generatorType: e.target.value as GeneratorType,
                                  })
                                }
                                className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                              >
                                <option value="sequential_int">Sequential Integer (1, 2, 3...)</option>
                                <option value="random_int">Random Integer (min..max)</option>
                                <option value="random_decimal">Random Currency / Decimal</option>
                                <option value="uuid">UUID v4 (Literal or gen_random_uuid())</option>
                                <option value="current_timestamp">Timestamp (CURRENT_TIMESTAMP)</option>
                                <option value="random_date">Random Date (YYYY-MM-DD)</option>
                                <option value="random_boolean">Random Boolean (TRUE / FALSE)</option>
                                <option value="name">Realistic Full Name</option>
                                <option value="email">Realistic Email Address</option>
                                <option value="username">Realistic Username</option>
                                <option value="company">Realistic Company Name</option>
                                <option value="phone">Realistic Phone Number</option>
                                <option value="city">World City Name</option>
                                <option value="country_code">Country Code (ISO 2)</option>
                                <option value="json_object">JSONB Sample Object</option>
                                <option value="lorem">Sample Descriptive Text</option>
                              </select>
                            </div>
                          )}

                          {(col.valueMode === 'default' || col.valueMode === 'null') && (
                            <div className="text-xs text-slate-500 italic pt-3">
                              Will emit literal SQL keyword <code className="font-mono text-indigo-600 dark:text-indigo-400">{col.valueMode.toUpperCase()}</code> for all rows.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Strategy, ON CONFLICT & Transaction Options */}
          {activeTab === 'options' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Insert Generation Style */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  SQL Generation Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    {
                      id: 'bulk_single_statement' as const,
                      title: 'Bulk Single Statement (Standard)',
                      desc: 'INSERT INTO tbl (cols) VALUES (...), (...); Highly optimized for PostgreSQL.',
                    },
                    {
                      id: 'individual_statements' as const,
                      title: 'Separate Individual INSERTs',
                      desc: 'Separate INSERT INTO tbl ...; statements for sequential execution & debugging.',
                    },
                    {
                      id: 'cte_values' as const,
                      title: 'CTE / WITH source AS (VALUES...)',
                      desc: 'WITH new_data AS (VALUES (...)) INSERT INTO tbl SELECT ...',
                    },
                    {
                      id: 'parameterized' as const,
                      title: 'Parameterized Query ($1, $2, ...)',
                      desc: 'Generates $1, $2 syntax along with a JSON parameters array for pg/pg8000.',
                    },
                  ].map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setOptions((prev) => ({ ...prev, insertStrategy: s.id }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        options.insertStrategy === s.id
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-500/50'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                        <span>{s.title}</span>
                        {options.insertStrategy === s.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ON CONFLICT (UPSERT) Clause */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold">ON CONFLICT (UPSERT) Clause</span>
                  </div>
                  <div className="flex gap-1">
                    {(['none', 'do_nothing', 'do_update'] as const).map((strat) => (
                      <button
                        key={strat}
                        type="button"
                        onClick={() => setOptions((prev) => ({ ...prev, conflictStrategy: strat }))}
                        className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                          options.conflictStrategy === strat
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {strat === 'none' ? 'None' : strat === 'do_nothing' ? 'DO NOTHING' : 'DO UPDATE SET'}
                      </button>
                    ))}
                  </div>
                </div>

                {options.conflictStrategy !== 'none' && (
                  <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Conflict Target Columns (e.g. Primary Key or UNIQUE index columns)
                      </label>
                      <input
                        type="text"
                        value={options.conflictTargetColumns.join(', ')}
                        onChange={(e) =>
                          setOptions((prev) => ({
                            ...prev,
                            conflictTargetColumns: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                        placeholder="id or email, username"
                      />
                    </div>

                    {options.conflictStrategy === 'do_update' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Columns to Overwrite in DO UPDATE SET (col = EXCLUDED.col)
                        </label>
                        <input
                          type="text"
                          value={options.conflictUpdateColumns.join(', ')}
                          onChange={(e) =>
                            setOptions((prev) => ({
                              ...prev,
                              conflictUpdateColumns: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                          placeholder="current_category, annual_turnover, updated_at"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RETURNING Clause */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  RETURNING Clause (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={options.returningClause}
                    onChange={(e) => setOptions((prev) => ({ ...prev, returningClause: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                    placeholder="* or id, created_at (leave empty for none)"
                  />
                  <div className="flex gap-1">
                    {['', '*', 'id'].map((ret) => (
                      <button
                        key={ret || 'none'}
                        type="button"
                        onClick={() => setOptions((prev) => ({ ...prev, returningClause: ret }))}
                        className={`px-2 py-1 text-xs font-mono rounded ${
                          options.returningClause === ret
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {ret ? ret : 'None'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles: Transactions, Type Casts, Comments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.wrapInTransaction}
                    onChange={(e) => setOptions((prev) => ({ ...prev, wrapInTransaction: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Wrap in Transaction (BEGIN/COMMIT)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeTypeCasts}
                    onChange={(e) => setOptions((prev) => ({ ...prev, includeTypeCasts: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Explicit Type Casts (::text)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeComments}
                    onChange={(e) => setOptions((prev) => ({ ...prev, includeComments: e.target.checked }))}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Include Header Comments</span>
                </label>
              </div>
            </div>
          )}

          {/* Tab 3: Built-in Presets */}
          {activeTab === 'presets' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Load ready-to-test schema and mock generation templates:
              </p>
              <div className="space-y-2.5">
                {DB_INSERT_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{preset.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{preset.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1.5">
                        <span>Table: {preset.options.tableName}</span>
                        <span>·</span>
                        <span>{preset.options.columns.length} columns</span>
                        <span>·</span>
                        <span>{preset.options.rowCount} rows</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLoadPreset(preset.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Load</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Generated Output SQL & Preview (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {/* Output Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setOutputTab('sql')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  outputTab === 'sql'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                SQL ({queryResult.rowCount} rows)
              </button>

              <button
                onClick={() => setOutputTab('grid')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                  outputTab === 'grid'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Table className="w-3 h-3" />
                <span>Data Grid</span>
              </button>

              {options.insertStrategy === 'parameterized' && (
                <button
                  onClick={() => setOutputTab('parameters')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    outputTab === 'parameters'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Params JSON
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {outputTab === 'sql' && (
                <>
                  <button
                    onClick={handleCopySql}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-1 transition-colors"
                    title="Copy SQL to clipboard"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadSql}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Download .sql file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}

              {outputTab === 'parameters' && (
                <button
                  onClick={handleCopyParams}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-1 transition-colors"
                  title="Copy parameters JSON"
                >
                  {copiedParams ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              )}

              {outputTab === 'grid' && (
                <>
                  <button
                    onClick={handleCopyCsv}
                    className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center gap-1 transition-colors"
                    title="Copy preview as CSV"
                  >
                    {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>CSV</span>
                  </button>

                  <button
                    onClick={handleDownloadCsv}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Download .csv file"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleCopyPreviewJson}
                    className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
                    title="Copy preview rows as JSON"
                  >
                    JSON
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Output Content Body */}
          <div className="flex-1 overflow-hidden p-3 flex flex-col bg-slate-950 font-mono text-xs">
            {outputTab === 'sql' && (
              <textarea
                readOnly
                value={queryResult.sql}
                className="w-full h-full p-2 bg-transparent text-emerald-400 dark:text-emerald-300 resize-none focus:outline-none overflow-y-auto leading-relaxed text-[11px] selection:bg-indigo-600 select-text"
                spellCheck={false}
              />
            )}

            {outputTab === 'parameters' && (
              <textarea
                readOnly
                value={queryResult.parametersJson || '[]'}
                className="w-full h-full p-2 bg-transparent text-amber-300 resize-none focus:outline-none overflow-y-auto leading-relaxed text-[11px] selection:bg-indigo-600 select-text"
                spellCheck={false}
              />
            )}

            {outputTab === 'grid' && (
              <div className="w-full h-full overflow-auto">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 shadow-xs z-10">
                    <tr>
                      <th className="p-2 w-10 text-slate-500 font-semibold">#</th>
                      {queryResult.columnsIncluded.map((cName) => (
                        <th key={cName} className="p-2 text-indigo-300 font-semibold whitespace-nowrap">
                          {cName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {queryResult.previewRows && queryResult.previewRows.length > 0 ? (
                      queryResult.previewRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-2 text-slate-500 font-mono text-[10px] select-none">{rIdx + 1}</td>
                          {queryResult.columnsIncluded.map((cName) => {
                            const val = row[cName];
                            return (
                              <td key={cName} className="p-2 whitespace-nowrap font-mono text-emerald-300">
                                {val === null || val === undefined ? (
                                  <span className="text-slate-500 italic">NULL</span>
                                ) : val === 'DEFAULT' ? (
                                  <span className="text-indigo-400 font-semibold">DEFAULT</span>
                                ) : typeof val === 'object' ? (
                                  <span className="text-amber-300">{JSON.stringify(val)}</span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={queryResult.columnsIncluded.length + 1} className="p-6 text-center text-slate-500 italic">
                          No active columns selected. Please uncheck "Exclude" on at least one column.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Metadata & Stats */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span>{queryResult.rowCount} rows</span>
              <span>·</span>
              <span>{queryResult.columnsIncluded.length} cols</span>
              {queryResult.columnsExcluded.length > 0 && (
                <>
                  <span>·</span>
                  <span>{queryResult.columnsExcluded.length} excluded</span>
                </>
              )}
            </div>
            <div>
              <span>{(queryResult.sql.length / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parse DDL Modal */}
      {showDdlModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowDdlModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm">Quick Parse PostgreSQL CREATE TABLE DDL</h3>
              </div>
              <button
                onClick={() => setShowDdlModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste your PostgreSQL DDL statement below. The generator will automatically extract table name, column types, primary keys, and auto-exclude SERIAL sequences.
            </p>

            {/* Quick Sample DDLs */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Quick Samples:</span>
              <button
                type="button"
                onClick={() =>
                  setDdlInputText(`CREATE TABLE "ecommerce_orders" (
  order_id UUID PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  metadata JSONB,
  ordered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`)
                }
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-medium"
              >
                Orders (UUID & JSONB)
              </button>
              <button
                type="button"
                onClick={() =>
                  setDdlInputText(`CREATE TABLE "user_accounts" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email CHARACTER VARYING(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`)
                }
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-medium"
              >
                Users (SERIAL & UNIQUE)
              </button>
              <button
                type="button"
                onClick={() =>
                  setDdlInputText(`CREATE TABLE "inventory_items" (
  sku CHARACTER VARYING (25) PRIMARY KEY,
  category_code VARCHAR(10) NOT NULL,
  rating NUMERIC(2) NOT NULL,
  unit_price NUMERIC(8, 2) NOT NULL,
  short_desc CHARACTER(25),
  in_stock BOOLEAN DEFAULT TRUE
);`)
                }
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-medium"
              >
                Inventory (VARCHAR(25) &amp; NUMERIC(2))
              </button>
              <button
                type="button"
                onClick={() =>
                  setDdlInputText(`CREATE TABLE "security_events" (
  event_id BIGSERIAL PRIMARY KEY,
  client_ip INET NOT NULL,
  event_action VARCHAR(100) NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  logged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`)
                }
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] font-medium"
              >
                Audit Logs (BIGSERIAL &amp; INET)
              </button>
            </div>

            <textarea
              value={ddlInputText}
              onChange={(e) => {
                setDdlInputText(e.target.value);
                setDdlError(null);
              }}
              placeholder={`CREATE TABLE "customers" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email CHARACTER VARYING(255) UNIQUE,
  balance NUMERIC(10,2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`}
              className="w-full h-44 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {ddlError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{ddlError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDdlModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleParseDdlSubmit}
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Parse &amp; Apply Schema
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Config Import/Export Modal */}
      <DbInsertConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        currentOptions={options}
        onApplyConfig={(newOpts) => {
          setOptions(newOpts);
          showStatus(`Imported configuration for table "${newOpts.tableName}"!`);
        }}
      />

      {/* Preferred Values Modal for Column */}
      {editingPoolCol && (
        <PreferredValuesModal
          isOpen={Boolean(editingPoolCol)}
          onClose={() => setEditingPoolCol(null)}
          columnName={editingPoolCol.name}
          columnType={editingPoolCol.type}
          maxLength={editingPoolCol.maxLength}
          precision={editingPoolCol.precision}
          scale={editingPoolCol.scale}
          initialValues={editingPoolCol.valuePool || []}
          onSave={(newValues) => {
            handleUpdateColumn(editingPoolCol.id, { valuePool: newValues });
            showStatus(`Updated preferred values pool for "${editingPoolCol.name}" (${newValues.length} values)`);
          }}
        />
      )}

      {/* Export Schema as CREATE TABLE DDL Modal */}
      <ExportDdlModal
        isOpen={showExportDdlModal}
        onClose={() => setShowExportDdlModal(false)}
        ddlSql={generateCreateTableDdl(options)}
        tableName={options.tableName}
      />
    </div>
  );
};
