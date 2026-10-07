import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Plus,
  Copy,
  Check,
  Download,
  Upload,
  AlertTriangle,
  Database,
  Table,
  Sliders,
  Play,
  Zap,
  Info,
  Filter,
  FileJson,
  Bookmark,
  CheckCircle2,
  ListFilter,
  Columns,
  Search,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Code,
  Terminal,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
} from 'lucide-react';
import {
  ColumnType,
  ConditionOperator,
  ConditionMode,
  DeleteStrategy,
  TransactionMode,
  TableColumn,
  DeleteCondition,
  DeleteQueryOptions,
  generatePostgresDeleteQuery,
  parseCreateTableDdl,
  parseDelimitedList,
  DB_DELETE_PRESETS,
  DbDeletePreset,
} from '../../../utils/dbDeleteQueryGenerator';
import { DbDeleteConfigModal } from './DbDeleteConfigModal';

interface DbDeleteQueryGeneratorToolProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const DbDeleteQueryGeneratorTool: React.FC<DbDeleteQueryGeneratorToolProps> = ({
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  // Table schema & identity
  const [tableName, setTableName] = useState<string>('orders');
  const [schema, setSchema] = useState<string>('public');
  const [useTableAlias, setUseTableAlias] = useState<boolean>(false);
  const [tableAlias, setTableAlias] = useState<string>('o');

  // Parsed schema columns
  const [schemaColumns, setSchemaColumns] = useState<TableColumn[]>([
    { id: 'c-1', name: 'order_id', type: 'text', isPrimaryKey: true, nullable: false },
    { id: 'c-2', name: 'customer_id', type: 'text', nullable: false },
    { id: 'c-3', name: 'tenant_id', type: 'text', nullable: false },
    { id: 'c-4', name: 'status', type: 'text', nullable: false },
    { id: 'c-5', name: 'total_amount', type: 'numeric', nullable: false },
    { id: 'c-6', name: 'created_at', type: 'timestamp', nullable: true },
  ]);

  // Raw DDL schema input drawer / state
  const [ddlInput, setDdlInput] = useState<string>(`CREATE TABLE public.orders (
    order_id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);`);
  const [showDdlParser, setShowDdlParser] = useState<boolean>(false);
  const [ddlParseMessage, setDdlParseMessage] = useState<string | null>(null);

  // Conditions
  const [conditionLogic, setConditionLogic] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<DeleteCondition[]>([
    {
      id: 'cond-1',
      column: 'status',
      type: 'text',
      mode: 'single',
      operator: '=',
      singleValue: 'CANCELLED',
      values: [],
      negate: false,
    },
    {
      id: 'cond-2',
      column: 'order_id',
      type: 'text',
      mode: 'list',
      operator: 'IN',
      singleValue: '',
      values: ['ORD-9001', 'ORD-9002', 'ORD-9003', 'ORD-9004'],
      negate: false,
    },
  ]);

  // Strategy & Safety Execution
  const [strategy, setStrategy] = useState<DeleteStrategy>('where_in');
  const [transactionMode, setTransactionMode] = useState<TransactionMode>('rollback');
  const [allowFullTableDelete, setAllowFullTableDelete] = useState<boolean>(false);
  const [returningClause, setReturningClause] = useState<string>('order_id, status');
  const [includeTypeCasts, setIncludeTypeCasts] = useState<boolean>(false);
  const [includeRowComments, setIncludeRowComments] = useState<boolean>(true);
  const [includeCountCheck, setIncludeCountCheck] = useState<boolean>(true);
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [chunkLimit, setChunkLimit] = useState<number>(1000);

  // Soft Delete Settings
  const [softDeletedAtColumn, setSoftDeletedAtColumn] = useState<string>('deleted_at');
  const [softIsDeletedColumn, setSoftIsDeletedColumn] = useState<string>('is_deleted');
  const [softDeletedByColumn, setSoftDeletedByColumn] = useState<string>('');
  const [softDeletedByValue, setSoftDeletedByValue] = useState<string>('');

  // UI Tabs & Modals
  const [activeLeftTab, setActiveLeftTab] = useState<'schema' | 'conditions' | 'strategy' | 'presets'>('conditions');
  const [activeOutputTab, setActiveOutputTab] = useState<'sql' | 'dryrun' | 'python' | 'audit'>('sql');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // New column form in schema tab
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<ColumnType>('text');

  // Compute Options object
  const currentOptions: DeleteQueryOptions = useMemo(() => {
    return {
      tableName,
      schema,
      tableAlias,
      useTableAlias,
      strategy,
      transactionMode,
      conditions,
      conditionLogic,
      allowFullTableDelete,
      returningClause,
      includeTypeCasts,
      includeRowComments,
      includeCountCheck,
      chunkSize,
      chunkLimit,
      softDeleteSettings: strategy === 'soft_delete' ? {
        enabled: true,
        deletedAtColumn: softDeletedAtColumn,
        isDeletedColumn: softIsDeletedColumn,
        deletedByColumn: softDeletedByColumn || undefined,
        deletedByValue: softDeletedByValue || undefined,
      } : undefined,
    };
  }, [
    tableName,
    schema,
    tableAlias,
    useTableAlias,
    strategy,
    transactionMode,
    conditions,
    conditionLogic,
    allowFullTableDelete,
    returningClause,
    includeTypeCasts,
    includeRowComments,
    includeCountCheck,
    chunkSize,
    chunkLimit,
    softDeletedAtColumn,
    softIsDeletedColumn,
    softDeletedByColumn,
    softDeletedByValue,
  ]);

  // Generate Query Bundle
  const queryResult = useMemo(() => {
    return generatePostgresDeleteQuery(currentOptions);
  }, [currentOptions]);

  // Copy helper
  const handleCopyText = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  // Download SQL helper
  const handleDownloadSql = () => {
    const filename = `${tableName || 'query'}-delete.sql`;
    const blob = new Blob([queryResult.sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // DDL Schema parsing handler
  const handleParseDdl = () => {
    if (!ddlInput.trim()) {
      setDdlParseMessage('Please enter DDL text.');
      return;
    }
    const parsed = parseCreateTableDdl(ddlInput);
    if (parsed.columns.length > 0) {
      setTableName(parsed.tableName);
      if (parsed.schema) setSchema(parsed.schema);
      setSchemaColumns(parsed.columns);
      setDdlParseMessage(`Successfully extracted table "${parsed.tableName}" and ${parsed.columns.length} columns.`);
      setTimeout(() => setDdlParseMessage(null), 3000);
    } else {
      setDdlParseMessage('Could not extract columns. Verify CREATE TABLE syntax.');
    }
  };

  // Condition Handlers
  const handleAddCondition = (colName?: string, colType?: ColumnType) => {
    const targetCol = colName || (schemaColumns[0]?.name || 'id');
    const targetType = colType || (schemaColumns[0]?.type || 'text');
    const newCond: DeleteCondition = {
      id: `cond-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      column: targetCol,
      type: targetType,
      mode: 'single',
      operator: '=',
      singleValue: '',
      values: [],
      negate: false,
    };
    setConditions((prev) => [...prev, newCond]);
    setActiveLeftTab('conditions');
  };

  const handleUpdateCondition = (id: string, updates: Partial<DeleteCondition>) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleRemoveCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  // Config import
  const handleImportConfig = (imported: DeleteQueryOptions, importedCols?: TableColumn[]) => {
    setTableName(imported.tableName);
    if (imported.schema) setSchema(imported.schema);
    setTableAlias(imported.tableAlias || 't');
    setUseTableAlias(Boolean(imported.useTableAlias));
    setStrategy(imported.strategy);
    setTransactionMode(imported.transactionMode);
    setConditions(imported.conditions);
    setConditionLogic(imported.conditionLogic);
    setAllowFullTableDelete(Boolean(imported.allowFullTableDelete));
    if (imported.returningClause !== undefined) setReturningClause(imported.returningClause);
    if (imported.includeTypeCasts !== undefined) setIncludeTypeCasts(imported.includeTypeCasts);
    if (imported.includeRowComments !== undefined) setIncludeRowComments(imported.includeRowComments);
    if (imported.includeCountCheck !== undefined) setIncludeCountCheck(imported.includeCountCheck);
    if (imported.chunkSize) setChunkSize(imported.chunkSize);
    if (imported.chunkLimit) setChunkLimit(imported.chunkLimit);
    if (imported.softDeleteSettings) {
      setSoftDeletedAtColumn(imported.softDeleteSettings.deletedAtColumn || 'deleted_at');
      setSoftIsDeletedColumn(imported.softDeleteSettings.isDeletedColumn || 'is_deleted');
      setSoftDeletedByColumn(imported.softDeleteSettings.deletedByColumn || '');
      setSoftDeletedByValue(imported.softDeleteSettings.deletedByValue || '');
    }
    if (importedCols && importedCols.length > 0) {
      setSchemaColumns(importedCols);
    }
  };

  // Preset loading
  const handleSelectPreset = (preset: DbDeletePreset) => {
    handleImportConfig(preset.options);
    if (preset.sampleDdl) {
      setDdlInput(preset.sampleDdl);
      const parsed = parseCreateTableDdl(preset.sampleDdl);
      if (parsed.columns.length > 0) {
        setSchemaColumns(parsed.columns);
      }
    }
  };

  // Add manual column to schema
  const handleAddManualColumn = () => {
    if (!newColName.trim()) return;
    const clean = newColName.trim();
    if (schemaColumns.some((c) => c.name.toLowerCase() === clean.toLowerCase())) {
      return;
    }
    const col: TableColumn = {
      id: `col-${clean}-${Date.now()}`,
      name: clean,
      type: newColType,
      nullable: true,
    };
    setSchemaColumns((prev) => [...prev, col]);
    setNewColName('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Database Delete Query Generator
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                PostgreSQL
              </span>
              {/* Risk Level Badge */}
              <span
                className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${
                  queryResult.safetyRiskLevel === 'SAFE'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : queryResult.safetyRiskLevel === 'MODERATE'
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                {queryResult.safetyRiskLevel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate safe bulk & targeted DELETE queries from table schema with single & list criteria
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Preset Selector */}
          <select
            onChange={(e) => {
              const found = DB_DELETE_PRESETS.find((p) => p.id === e.target.value);
              if (found) handleSelectPreset(found);
            }}
            value=""
            className="text-xs px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-300 dark:border-slate-700 focus:outline-none"
          >
            <option value="" disabled>
              ⚡ Load Preset Template...
            </option>
            {DB_DELETE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Config Modal Button */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md transition-colors border border-slate-300 dark:border-slate-700"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Config (Import/Export)</span>
          </button>

          {/* Fullscreen Toggle */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace: 2-Column Split */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* LEFT PANEL: Schema, Conditions, Strategy */}
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          {/* Sub-Tabs Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 px-3 pt-2">
            <button
              onClick={() => setActiveLeftTab('conditions')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'conditions'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Conditions ({conditions.length})</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('schema')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'schema'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Schema & Table ({schemaColumns.length})</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('strategy')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'strategy'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Strategy & Safety</span>
            </button>

            <button
              onClick={() => setActiveLeftTab('presets')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeLeftTab === 'presets'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Presets</span>
            </button>
          </div>

          {/* Left Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* ============================================================== */}
            {/* TAB: CONDITIONS */}
            {/* ============================================================== */}
            {activeLeftTab === 'conditions' && (
              <div className="space-y-4">
                {/* Condition Controls Header */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Combine conditions with:
                    </span>
                    <div className="inline-flex rounded-md shadow-sm border border-slate-300 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900">
                      <button
                        onClick={() => setConditionLogic('AND')}
                        className={`px-2.5 py-1 text-xs font-bold rounded ${
                          conditionLogic === 'AND'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        AND
                      </button>
                      <button
                        onClick={() => setConditionLogic('OR')}
                        className={`px-2.5 py-1 text-xs font-bold rounded ${
                          conditionLogic === 'OR'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        OR
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddCondition()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Condition</span>
                  </button>
                </div>

                {/* Empty State */}
                {conditions.length === 0 && (
                  <div className="text-center py-8 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      No WHERE conditions configured
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      Deleting without conditions requires the safety guard toggle. Add single or list conditions below.
                    </p>
                    <button
                      onClick={() => handleAddCondition()}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add First Condition
                    </button>
                  </div>
                )}

                {/* Conditions List */}
                <div className="space-y-3">
                  {conditions.map((cond, index) => {
                    return (
                      <div
                        key={cond.id}
                        className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs space-y-3 relative hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        {/* Condition Header Bar */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400">
                              #{index + 1}
                            </span>

                            {/* Column Selection */}
                            <select
                              value={cond.column}
                              onChange={(e) => {
                                const col = schemaColumns.find((c) => c.name === e.target.value);
                                handleUpdateCondition(cond.id, {
                                  column: e.target.value,
                                  type: col ? col.type : cond.type,
                                });
                              }}
                              className="text-xs font-semibold px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {schemaColumns.map((col) => (
                                <option key={col.id} value={col.name}>
                                  {col.name} {col.isPrimaryKey ? '★ (PK)' : ''}
                                </option>
                              ))}
                              {!schemaColumns.some((c) => c.name === cond.column) && (
                                <option value={cond.column}>{cond.column} (custom)</option>
                              )}
                            </select>

                            {/* Column Type */}
                            <select
                              value={cond.type}
                              onChange={(e) =>
                                handleUpdateCondition(cond.id, {
                                  type: e.target.value as ColumnType,
                                })
                              }
                              className="text-[11px] font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded border border-transparent"
                            >
                              <option value="text">text</option>
                              <option value="integer">integer</option>
                              <option value="bigint">bigint</option>
                              <option value="numeric">numeric</option>
                              <option value="boolean">boolean</option>
                              <option value="timestamp">timestamp</option>
                              <option value="date">date</option>
                              <option value="uuid">uuid</option>
                              <option value="raw">raw/SQL</option>
                            </select>
                          </div>

                          {/* Delete Condition Button */}
                          <button
                            onClick={() => handleRemoveCondition(cond.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                            title="Remove condition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Mode & Operator Row */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Mode Toggle: Single vs List */}
                          <div className="inline-flex rounded-md p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <button
                              onClick={() => {
                                handleUpdateCondition(cond.id, {
                                  mode: 'single',
                                  operator: cond.operator === 'IN' ? '=' : cond.operator,
                                });
                              }}
                              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                                cond.mode === 'single'
                                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                              }`}
                            >
                              Single Value
                            </button>
                            <button
                              onClick={() => {
                                handleUpdateCondition(cond.id, {
                                  mode: 'list',
                                  operator: 'IN',
                                });
                              }}
                              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                                cond.mode === 'list'
                                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                              }`}
                            >
                              List / Bulk ({cond.values.length})
                            </button>
                          </div>

                          {/* Operator */}
                          <select
                            value={cond.operator}
                            onChange={(e) =>
                              handleUpdateCondition(cond.id, {
                                operator: e.target.value as ConditionOperator,
                              })
                            }
                            className="text-xs px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                          >
                            {cond.mode === 'single' ? (
                              <>
                                <option value="=">= (Equals)</option>
                                <option value="!=">!= (Not Equals)</option>
                                <option value=">">&gt; (Greater than)</option>
                                <option value="<">&lt; (Less than)</option>
                                <option value=">=">&gt;= (Greater or equal)</option>
                                <option value="<=">&lt;= (Less or equal)</option>
                                <option value="LIKE">LIKE (Pattern match)</option>
                                <option value="ILIKE">ILIKE (Case-insensitive)</option>
                                <option value="IS NULL">IS NULL</option>
                                <option value="IS NOT NULL">IS NOT NULL</option>
                                <option value="BETWEEN">BETWEEN (Range)</option>
                              </>
                            ) : (
                              <>
                                <option value="IN">IN (Any in list)</option>
                                <option value="NOT IN">NOT IN (None in list)</option>
                              </>
                            )}
                          </select>

                          {/* NOT Negation checkbox */}
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(cond.negate)}
                              onChange={(e) =>
                                handleUpdateCondition(cond.id, { negate: e.target.checked })
                              }
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Negate (NOT)</span>
                          </label>

                          {/* Case Insensitive checkbox */}
                          {(cond.type === 'text' || cond.type === 'raw') && cond.mode === 'single' && (
                            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(cond.caseInsensitive)}
                                onChange={(e) =>
                                  handleUpdateCondition(cond.id, {
                                    caseInsensitive: e.target.checked,
                                  })
                                }
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>Case-insensitive</span>
                            </label>
                          )}
                        </div>

                        {/* Value Input Section */}
                        {cond.operator !== 'IS NULL' && cond.operator !== 'IS NOT NULL' && (
                          <div className="space-y-1.5">
                            {cond.mode === 'single' ? (
                              <input
                                type="text"
                                value={cond.singleValue}
                                onChange={(e) =>
                                  handleUpdateCondition(cond.id, { singleValue: e.target.value })
                                }
                                placeholder={
                                  cond.operator === 'BETWEEN'
                                    ? "e.g. 2026-01-01 AND 2026-03-31"
                                    : cond.type === 'timestamp'
                                    ? "e.g. NOW() - INTERVAL '30 days' or 2026-01-01"
                                    : cond.type === 'boolean'
                                    ? "true or false"
                                    : "Enter target value..."
                                }
                                className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                  <span>
                                    Paste values (newline, comma, or spreadsheet tab separated)
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const clean = parseDelimitedList(cond.values.join('\n'), true);
                                        handleUpdateCondition(cond.id, { values: clean });
                                      }}
                                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                      Deduplicate
                                    </button>
                                    <span>·</span>
                                    <span>{cond.values.length} items</span>
                                  </div>
                                </div>
                                <textarea
                                  value={cond.values.join('\n')}
                                  onChange={(e) => {
                                    const parsed = parseDelimitedList(e.target.value, false);
                                    handleUpdateCondition(cond.id, { values: parsed });
                                  }}
                                  rows={4}
                                  placeholder="ID-1001&#10;ID-1002&#10;ID-1003"
                                  className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: SCHEMA & TABLE */}
            {/* ============================================================== */}
            {activeLeftTab === 'schema' && (
              <div className="space-y-4">
                {/* Table Identification Card */}
                <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Target Table Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Table Name
                      </label>
                      <input
                        type="text"
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        PostgreSQL Schema
                      </label>
                      <input
                        type="text"
                        value={schema}
                        onChange={(e) => setSchema(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useTableAlias}
                        onChange={(e) => setUseTableAlias(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Use Table Alias</span>
                    </label>
                    {useTableAlias && (
                      <input
                        type="text"
                        value={tableAlias}
                        onChange={(e) => setTableAlias(e.target.value)}
                        placeholder="Alias (e.g. t)"
                        className="w-20 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                      />
                    )}
                  </div>
                </div>

                {/* DDL Schema Parser Card */}
                <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Parse Table Schema from DDL
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Paste CREATE TABLE SQL to automatically extract table name, columns & types
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDdlParser(!showDdlParser)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {showDdlParser ? 'Hide DDL' : 'Open DDL'}
                    </button>
                  </div>

                  {showDdlParser && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <textarea
                        value={ddlInput}
                        onChange={(e) => setDdlInput(e.target.value)}
                        rows={6}
                        placeholder="CREATE TABLE public.my_table (&#10;    id SERIAL PRIMARY KEY,&#10;    status VARCHAR(32) NOT NULL&#10;);"
                        className="w-full p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleParseDdl}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Parse Schema DDL</span>
                        </button>
                        {ddlParseMessage && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            {ddlParseMessage}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Available Columns List */}
                <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Available Columns ({schemaColumns.length})
                    </h3>
                  </div>

                  {/* Manual add column */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value)}
                      placeholder="Add column name..."
                      className="flex-1 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                    />
                    <select
                      value={newColType}
                      onChange={(e) => setNewColType(e.target.value as ColumnType)}
                      className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                    >
                      <option value="text">text</option>
                      <option value="integer">integer</option>
                      <option value="bigint">bigint</option>
                      <option value="numeric">numeric</option>
                      <option value="boolean">boolean</option>
                      <option value="timestamp">timestamp</option>
                      <option value="date">date</option>
                      <option value="uuid">uuid</option>
                    </select>
                    <button
                      onClick={handleAddManualColumn}
                      disabled={!newColName.trim()}
                      className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>

                  {/* Columns table */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                    {schemaColumns.map((col) => (
                      <div
                        key={col.id}
                        className="py-2 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {col.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {col.type}
                          </span>
                          {col.isPrimaryKey && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              PK
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddCondition(col.name, col.type)}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          + Filter by this
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: STRATEGY & SAFETY */}
            {/* ============================================================== */}
            {activeLeftTab === 'strategy' && (
              <div className="space-y-4">
                {/* Delete Strategy Picker */}
                <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    PostgreSQL Delete Strategy
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      {
                        id: 'where_in',
                        name: 'WHERE IN Clause',
                        desc: 'Standard clean SQL delete with chunking for large lists',
                      },
                      {
                        id: 'using_values',
                        name: 'USING (VALUES) Join',
                        desc: 'High-performance PostgreSQL bulk delete using virtual table join',
                      },
                      {
                        id: 'cte',
                        name: 'CTE With Targets',
                        desc: 'WITH targets AS (VALUES (...)) DELETE query structure',
                      },
                      {
                        id: 'individual',
                        name: 'Individual Statements',
                        desc: 'Multiple separate DELETE statements for fine-grained audit',
                      },
                      {
                        id: 'soft_delete',
                        name: 'Soft Delete (UPDATE)',
                        desc: 'Sets is_deleted=TRUE, deleted_at=NOW() instead of hard delete',
                      },
                      {
                        id: 'chunked_limit',
                        name: 'Chunked CTE (LIMIT)',
                        desc: 'Safely purges huge tables in chunks using ctid to prevent locks',
                      },
                    ].map((strat) => (
                      <button
                        key={strat.id}
                        onClick={() => setStrategy(strat.id as DeleteStrategy)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          strategy === strat.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 text-indigo-950 dark:text-indigo-100 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-xs">{strat.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {strat.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Soft Delete Custom Settings */}
                {strategy === 'soft_delete' && (
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Soft-Delete Columns Configuration
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Timestamp Column
                        </label>
                        <input
                          type="text"
                          value={softDeletedAtColumn}
                          onChange={(e) => setSoftDeletedAtColumn(e.target.value)}
                          placeholder="deleted_at"
                          className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Boolean Deleted Flag
                        </label>
                        <input
                          type="text"
                          value={softIsDeletedColumn}
                          onChange={(e) => setSoftIsDeletedColumn(e.target.value)}
                          placeholder="is_deleted"
                          className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Safety & Transaction Card */}
                <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Safety & Transaction Modes
                  </h3>

                  {/* Transaction Mode */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Transaction Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setTransactionMode('none')}
                        className={`py-1.5 text-xs font-semibold rounded border transition-colors ${
                          transactionMode === 'none'
                            ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-slate-800'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        None (Plain)
                      </button>
                      <button
                        onClick={() => setTransactionMode('rollback')}
                        className={`py-1.5 text-xs font-semibold rounded border transition-colors ${
                          transactionMode === 'rollback'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        ROLLBACK (Dry Run)
                      </button>
                      <button
                        onClick={() => setTransactionMode('commit')}
                        className={`py-1.5 text-xs font-semibold rounded border transition-colors ${
                          transactionMode === 'commit'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        BEGIN...COMMIT
                      </button>
                    </div>
                  </div>

                  {/* Safety Checkbox */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <label className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowFullTableDelete}
                        onChange={(e) => setAllowFullTableDelete(e.target.checked)}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>
                        <strong>Allow Full Table Deletion without WHERE conditions</strong> (Dangerous!)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCountCheck}
                        onChange={(e) => setIncludeCountCheck(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Include pre-delete SELECT COUNT(*) check query</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeTypeCasts}
                        onChange={(e) => setIncludeTypeCasts(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Include explicit PostgreSQL type casts (::uuid, ::integer)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeRowComments}
                        onChange={(e) => setIncludeRowComments(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Include statement comments and annotations</span>
                    </label>
                  </div>

                  {/* Returning clause */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      RETURNING Clause (Optional)
                    </label>
                    <input
                      type="text"
                      value={returningClause}
                      onChange={(e) => setReturningClause(e.target.value)}
                      placeholder="e.g. order_id, status or * (leave blank for none)"
                      className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: PRESETS */}
            {/* ============================================================== */}
            {activeLeftTab === 'presets' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a template to configure schema, conditions, and delete queries in one click:
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {DB_DELETE_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                            {preset.name}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {preset.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {preset.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                          <span>Table: {preset.options.tableName}</span>
                          <span>·</span>
                          <span>Strategy: {preset.options.strategy}</span>
                          <span>·</span>
                          <span>Conditions: {preset.options.conditions.length}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectPreset(preset)}
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-md transition-colors border border-indigo-200 dark:border-indigo-800"
                      >
                        <span>Load</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Output Tabs (SQL, Dry-Run SELECT, Python, Safety Audit) */}
        <div className="w-full lg:w-1/2 flex flex-col bg-slate-100 dark:bg-slate-950/50 overflow-hidden">
          {/* Sub-Tabs Navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 pt-2">
            <div className="flex">
              <button
                onClick={() => setActiveOutputTab('sql')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeOutputTab === 'sql'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Generated SQL</span>
              </button>

              <button
                onClick={() => setActiveOutputTab('dryrun')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeOutputTab === 'dryrun'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Dry-Run SELECT Audit</span>
              </button>

              <button
                onClick={() => setActiveOutputTab('python')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeOutputTab === 'python'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>pg8000 Python Script</span>
              </button>

              <button
                onClick={() => setActiveOutputTab('audit')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeOutputTab === 'audit'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Safety & Audit ({queryResult.warnings.length})</span>
              </button>
            </div>

            {/* Actions for current tab */}
            <div className="flex items-center gap-2 pb-2">
              {activeOutputTab === 'sql' && (
                <>
                  <button
                    onClick={() => handleCopyText(queryResult.sql, 'sql')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded transition-colors"
                  >
                    {copiedTab === 'sql' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedTab === 'sql' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSql}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </>
              )}

              {activeOutputTab === 'dryrun' && (
                <button
                  onClick={() => handleCopyText(queryResult.dryRunSelectSql, 'dryrun')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded transition-colors"
                >
                  {copiedTab === 'dryrun' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedTab === 'dryrun' ? 'Copied' : 'Copy Query'}</span>
                </button>
              )}

              {activeOutputTab === 'python' && (
                <button
                  onClick={() => handleCopyText(queryResult.pythonSnippet, 'python')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded transition-colors"
                >
                  {copiedTab === 'python' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedTab === 'python' ? 'Copied' : 'Copy Python'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            {/* SQL Tab */}
            {activeOutputTab === 'sql' && (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Strategy: {queryResult.strategy}</span>
                  <span>{queryResult.sql.split('\n').length} lines</span>
                </div>
                <textarea
                  readOnly
                  value={queryResult.sql}
                  className="flex-1 w-full min-h-[400px] p-3 font-mono text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 select-all resize-none focus:outline-none"
                />
              </div>
            )}

            {/* Dry Run SELECT Audit Tab */}
            {activeOutputTab === 'dryrun' && (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                  Run this query first in your database client (DBeaver, psql, pgAdmin) to inspect the exact rows that will be deleted before executing any deletion!
                </div>
                <textarea
                  readOnly
                  value={queryResult.dryRunSelectSql}
                  className="flex-1 w-full min-h-[400px] p-3 font-mono text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 select-all resize-none focus:outline-none"
                />
              </div>
            )}

            {/* Python Script Tab */}
            {activeOutputTab === 'python' && (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>pg8000 Native Runner</span>
                  <span>pip install pg8000</span>
                </div>
                <textarea
                  readOnly
                  value={queryResult.pythonSnippet}
                  className="flex-1 w-full min-h-[400px] p-3 font-mono text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 select-all resize-none focus:outline-none"
                />
              </div>
            )}

            {/* Safety & Audit Tab */}
            {activeOutputTab === 'audit' && (
              <div className="space-y-4">
                {/* Risk Level Banner */}
                <div
                  className={`p-4 rounded-lg border ${
                    queryResult.safetyRiskLevel === 'SAFE'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : queryResult.safetyRiskLevel === 'MODERATE'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Risk Evaluation: {queryResult.safetyRiskLevel}</span>
                  </div>
                  <p className="text-xs mt-1">
                    {queryResult.safetyRiskLevel === 'SAFE'
                      ? 'Protected with WHERE filters and transaction isolation.'
                      : queryResult.safetyRiskLevel === 'MODERATE'
                      ? 'Review query criteria and verify targeted rows.'
                      : 'Severe data loss risk! Carefully verify conditions before execution.'}
                  </p>
                </div>

                {/* Warnings List */}
                {queryResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Active Safety Warnings
                    </h4>
                    <div className="space-y-1.5">
                      {queryResult.warnings.map((w, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2.5 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded"
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution Statistics */}
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 text-xs">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Query Execution Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    <div>Target Table: <span className="font-semibold text-slate-800 dark:text-slate-200">{tableName}</span></div>
                    <div>Schema: <span className="font-semibold text-slate-800 dark:text-slate-200">{schema}</span></div>
                    <div>Strategy: <span className="font-semibold text-slate-800 dark:text-slate-200">{strategy}</span></div>
                    <div>Transaction: <span className="font-semibold text-slate-800 dark:text-slate-200">{transactionMode}</span></div>
                    <div>Single Conditions: <span className="font-semibold text-slate-800 dark:text-slate-200">{queryResult.singleConditionsCount}</span></div>
                    <div>List Conditions: <span className="font-semibold text-slate-800 dark:text-slate-200">{queryResult.listConditionsCount}</span></div>
                    <div>Total List Values: <span className="font-semibold text-slate-800 dark:text-slate-200">{queryResult.totalListValuesCount}</span></div>
                    <div>Condition Logic: <span className="font-semibold text-slate-800 dark:text-slate-200">{conditionLogic}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Config Import/Export Modal */}
      <DbDeleteConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        options={currentOptions}
        schemaColumns={schemaColumns}
        onImportConfig={handleImportConfig}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
};
