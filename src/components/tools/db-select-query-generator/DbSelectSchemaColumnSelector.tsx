import React, { useState, useMemo } from 'react';
import {
  Columns,
  Search,
  Check,
  Copy,
  Plus,
  Trash2,
  Bookmark,
  Sparkles,
  Key,
  ShieldCheck,
  Activity,
  Layers,
  Database,
  Code,
  CheckCircle2,
  Upload,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import {
  TableColumn,
  SelectColumn,
  SchemaUseCase,
  BUILTIN_SCHEMA_USE_CASES,
  getColumnNamesForUseCase,
  ColumnAggregate,
} from '../../../utils/dbSelectQueryGenerator';

export interface DbSelectSchemaColumnSelectorProps {
  schemaColumns: TableColumn[];
  selectColumns: SelectColumn[];
  onChangeSelectColumns: (columns: SelectColumn[]) => void;
  selectedUseCase: string;
  onChangeSelectedUseCase: (useCaseId: string) => void;
  customUseCases: SchemaUseCase[];
  onSaveCustomUseCase: (useCase: SchemaUseCase) => void;
  onDeleteCustomUseCase: (useCaseId: string) => void;
  tableAlias: string;
  useTableAlias: boolean;
  onAddMatchFilter: (column: TableColumn) => void;
  selectAllColumns: boolean;
  onToggleSelectAllColumns: (selectAll: boolean) => void;
  customSelectClause: string;
  onChangeCustomSelectClause: (clause: string) => void;
  projectionMode: 'schema' | 'custom';
  onChangeProjectionMode: (mode: 'schema' | 'custom') => void;
  onOpenImportSchema: () => void;
}

export const DbSelectSchemaColumnSelector: React.FC<DbSelectSchemaColumnSelectorProps> = ({
  schemaColumns,
  selectColumns,
  onChangeSelectColumns,
  selectedUseCase,
  onChangeSelectedUseCase,
  customUseCases,
  onSaveCustomUseCase,
  onDeleteCustomUseCase,
  tableAlias,
  useTableAlias,
  onAddMatchFilter,
  selectAllColumns,
  onToggleSelectAllColumns,
  customSelectClause,
  onChangeCustomSelectClause,
  projectionMode,
  onChangeProjectionMode,
  onOpenImportSchema,
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isSavingUseCase, setIsSavingUseCase] = useState<boolean>(false);
  const [newUseCaseName, setNewUseCaseName] = useState<string>('');
  const [newUseCaseDesc, setNewUseCaseDesc] = useState<string>('');
  const [copiedProjection, setCopiedProjection] = useState<boolean>(false);

  // Set of currently selected column names
  const selectedColumnNames = useMemo(() => {
    return new Set(selectColumns.map((c) => c.name));
  }, [selectColumns]);

  // Filter schema columns
  const filteredColumns = useMemo(() => {
    if (!searchFilter.trim()) return schemaColumns;
    const q = searchFilter.toLowerCase();
    return schemaColumns.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.defaultValue && c.defaultValue.toLowerCase().includes(q))
    );
  }, [schemaColumns, searchFilter]);

  // Handle picking a use case
  const handleSelectUseCase = (useCaseId: string) => {
    onChangeSelectedUseCase(useCaseId);
    if (selectAllColumns) {
      onToggleSelectAllColumns(false);
    }
    const targetNames = getColumnNamesForUseCase(schemaColumns, useCaseId, customUseCases);
    const newSelectCols: SelectColumn[] = targetNames.map((name) => {
      const existing = selectColumns.find((c) => c.name === name);
      const schemaCol = schemaColumns.find((c) => c.name === name);
      return {
        id: existing?.id || `sel-${name}-${Date.now()}`,
        name,
        alias: existing?.alias || '',
        expression: existing?.expression || '',
        type: schemaCol?.type,
        isPrimaryKey: schemaCol?.isPrimaryKey,
        aggregate: existing?.aggregate || 'NONE',
      };
    });
    onChangeSelectColumns(newSelectCols);
    updateProjectionClause(newSelectCols, useTableAlias, tableAlias);
  };

  // Toggle single column selection
  const handleToggleColumn = (columnName: string) => {
    if (selectAllColumns) {
      onToggleSelectAllColumns(false);
    }
    let updated: SelectColumn[];
    if (selectedColumnNames.has(columnName)) {
      updated = selectColumns.filter((c) => c.name !== columnName);
    } else {
      const schemaCol = schemaColumns.find((c) => c.name === columnName);
      updated = [
        ...selectColumns,
        {
          id: `sel-${columnName}-${Date.now()}`,
          name: columnName,
          type: schemaCol?.type,
          isPrimaryKey: schemaCol?.isPrimaryKey,
          aggregate: 'NONE',
        },
      ];
    }
    onChangeSelectColumns(updated);
    onChangeSelectedUseCase('custom-selection');
    updateProjectionClause(updated, useTableAlias, tableAlias);
  };

  // Update alias
  const handleUpdateAlias = (columnName: string, alias: string) => {
    const updated = selectColumns.map((c) => {
      if (c.name === columnName) {
        return { ...c, alias };
      }
      return c;
    });
    onChangeSelectColumns(updated);
    updateProjectionClause(updated, useTableAlias, tableAlias);
  };

  // Update aggregate
  const handleUpdateAggregate = (columnName: string, aggregate: ColumnAggregate) => {
    const updated = selectColumns.map((c) => {
      if (c.name === columnName) {
        return { ...c, aggregate };
      }
      return c;
    });
    onChangeSelectColumns(updated);
    updateProjectionClause(updated, useTableAlias, tableAlias);
  };

  // Helper to recompute projection clause text
  const updateProjectionClause = (cols: SelectColumn[], aliasActive: boolean, prefix: string) => {
    if (cols.length === 0) {
      onChangeCustomSelectClause('*');
      return;
    }
    const parts = cols.map((col) => {
      const pfx = aliasActive && prefix ? `${prefix}.` : '';
      let baseExpr = `${pfx}${col.name}`;
      if (col.aggregate && col.aggregate !== 'NONE') {
        if (col.aggregate === 'DISTINCT') {
          baseExpr = `DISTINCT ${baseExpr}`;
        } else if (col.aggregate === 'DATE') {
          baseExpr = `DATE(${baseExpr})`;
        } else {
          baseExpr = `${col.aggregate}(${baseExpr})`;
        }
      }
      if (col.alias && col.alias.trim()) {
        baseExpr += ` AS ${col.alias.trim()}`;
      }
      return baseExpr;
    });
    onChangeCustomSelectClause(parts.join(', '));
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectAllColumns) {
      onToggleSelectAllColumns(false);
    }
    const all = schemaColumns.map((col) => {
      const existing = selectColumns.find((c) => c.name === col.name);
      return {
        id: existing?.id || `sel-${col.name}-${Date.now()}`,
        name: col.name,
        type: col.type,
        isPrimaryKey: col.isPrimaryKey,
        alias: existing?.alias || '',
        aggregate: existing?.aggregate || 'NONE',
      };
    });
    onChangeSelectColumns(all);
    onChangeSelectedUseCase('all');
    updateProjectionClause(all, useTableAlias, tableAlias);
  };

  const handleDeselectAll = () => {
    onChangeSelectColumns([]);
    onChangeSelectedUseCase('custom-selection');
    onChangeCustomSelectClause('*');
  };

  const handleInvertSelection = () => {
    if (selectAllColumns) {
      onToggleSelectAllColumns(false);
    }
    const inverted = schemaColumns
      .filter((col) => !selectedColumnNames.has(col.name))
      .map((col) => ({
        id: `sel-${col.name}-${Date.now()}`,
        name: col.name,
        type: col.type,
        isPrimaryKey: col.isPrimaryKey,
        aggregate: 'NONE' as ColumnAggregate,
      }));
    onChangeSelectColumns(inverted);
    onChangeSelectedUseCase('custom-selection');
    updateProjectionClause(inverted, useTableAlias, tableAlias);
  };

  // Save custom use case
  const handleSaveCurrentAsUseCase = () => {
    if (!newUseCaseName.trim()) return;
    const newCase: SchemaUseCase = {
      id: `custom-uc-${Date.now()}`,
      name: newUseCaseName.trim(),
      description: newUseCaseDesc.trim() || `Custom use case with ${selectColumns.length} selected columns`,
      isCustom: true,
      columnNames: selectColumns.map((c) => c.name),
    };
    onSaveCustomUseCase(newCase);
    onChangeSelectedUseCase(newCase.id);
    setIsSavingUseCase(false);
    setNewUseCaseName('');
    setNewUseCaseDesc('');
  };

  const handleCopyProjection = () => {
    const textToCopy = selectAllColumns
      ? (useTableAlias && tableAlias ? `${tableAlias}.*` : '*')
      : customSelectClause;
    navigator.clipboard.writeText(textToCopy);
    setCopiedProjection(true);
    setTimeout(() => setCopiedProjection(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-3">
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Columns className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            Columns to Select (Projection)
          </span>
          {schemaColumns.length > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
              {selectAllColumns
                ? 'All Columns (*)'
                : `${selectColumns.length} of ${schemaColumns.length} Selected`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switch: Schema vs Manual */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5 text-[11px]">
            <button
              onClick={() => onChangeProjectionMode('schema')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                projectionMode === 'schema'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3 h-3" />
              Schema Picker
            </button>
            <button
              onClick={() => onChangeProjectionMode('custom')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                projectionMode === 'custom'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3 h-3" />
              Manual Expression
            </button>
          </div>

          {/* Toggle SELECT * */}
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none ml-1">
            <input
              type="checkbox"
              checked={selectAllColumns}
              onChange={(e) => {
                const checked = e.target.checked;
                onToggleSelectAllColumns(checked);
                if (checked) {
                  onChangeSelectedUseCase('all');
                }
              }}
              className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px] font-medium text-slate-300">SELECT *</span>
          </label>
        </div>
      </div>

      {/* IF NO SCHEMA LOADED, SHOW PROMPT TO IMPORT SCHEMA */}
      {schemaColumns.length === 0 ? (
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 text-center space-y-2">
          <Database className="w-8 h-8 text-indigo-400 mx-auto opacity-75" />
          <h4 className="text-xs font-semibold text-slate-200">
            No Table Schema Loaded
          </h4>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            Import your PostgreSQL table DDL to unlock interactive column selection for different use cases (Keys, Identity, Audit, Metrics, Safe/Non-Sensitive).
          </p>
          <button
            onClick={onOpenImportSchema}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Import Table Schema (DDL)
          </button>
        </div>
      ) : (
        <>
          {/* USE CASES TOOLBAR */}
          {projectionMode === 'schema' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Select Columns for Use Case:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsSavingUseCase(true)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Save current column selection as a custom use case"
                  >
                    <Bookmark className="w-3 h-3" />
                    Save as Use Case...
                  </button>
                  <button
                    onClick={onOpenImportSchema}
                    className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3 text-indigo-400" />
                    Change Schema
                  </button>
                </div>
              </div>

              {/* Use Case Chips */}
              <div className="flex flex-wrap gap-1.5">
                {BUILTIN_SCHEMA_USE_CASES.map((uc) => {
                  const isActive = selectedUseCase === uc.id && !selectAllColumns;
                  return (
                    <button
                      key={uc.id}
                      onClick={() => handleSelectUseCase(uc.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
                        isActive
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-semibold shadow-xs'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700'
                      }`}
                      title={uc.description}
                    >
                      {uc.id === 'keys' && <Key className="w-3 h-3 text-amber-400" />}
                      {uc.id === 'audit' && <Activity className="w-3 h-3 text-sky-400" />}
                      {uc.id === 'safe_public' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                      <span>{uc.name}</span>
                    </button>
                  );
                })}

                {/* Custom User-Defined Use Cases */}
                {customUseCases.map((uc) => {
                  const isActive = selectedUseCase === uc.id && !selectAllColumns;
                  return (
                    <div
                      key={uc.id}
                      className={`inline-flex items-center rounded text-xs border ${
                        isActive
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <button
                        onClick={() => handleSelectUseCase(uc.id)}
                        className="px-2 py-1 cursor-pointer hover:text-white flex items-center gap-1"
                        title={uc.description}
                      >
                        <Bookmark className="w-3 h-3 text-purple-400" />
                        <span>{uc.name}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomUseCase(uc.id);
                        }}
                        className="px-1.5 py-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer border-l border-slate-800"
                        title="Delete custom use case"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* SAVE USE CASE FORM DIALOG */}
              {isSavingUseCase && (
                <div className="bg-slate-950 border border-indigo-500/40 rounded-lg p-3 space-y-2.5 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                      Save Current Selection ({selectColumns.length} columns) as Custom Use Case
                    </span>
                    <button
                      onClick={() => setIsSavingUseCase(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={newUseCaseName}
                      onChange={(e) => setNewUseCaseName(e.target.value)}
                      placeholder="e.g. Order Fulfillment, User Profile Sync"
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={newUseCaseDesc}
                      onChange={(e) => setNewUseCaseDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsSavingUseCase(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCurrentAsUseCase}
                      disabled={!newUseCaseName.trim()}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Save Use Case
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCHEMA COLUMNS INTERACTIVE LIST VIEW */}
          {projectionMode === 'schema' && !selectAllColumns && (
            <div className="space-y-2">
              {/* Filter & Bulk Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search columns by name or type..."
                    className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    onClick={handleSelectAll}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleInvertSelection}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Invert
                  </button>
                </div>
              </div>

              {/* Scrollable Columns Table */}
              <div className="border border-slate-800 rounded-md overflow-hidden bg-slate-950/60 max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-850/80 text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-1.5 px-2.5 w-8 text-center">Sel</th>
                      <th className="py-1.5 px-2">Column</th>
                      <th className="py-1.5 px-2">Type</th>
                      <th className="py-1.5 px-2">Alias (AS ...)</th>
                      <th className="py-1.5 px-2">Aggregate</th>
                      <th className="py-1.5 px-2 text-right">Filter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {filteredColumns.map((col) => {
                      const isSelected = selectedColumnNames.has(col.name);
                      const currentSelectCol = selectColumns.find((c) => c.name === col.name);
                      return (
                        <tr
                          key={col.name}
                          className={`hover:bg-slate-850/50 transition-colors ${
                            isSelected ? 'bg-indigo-950/15 text-slate-100' : 'text-slate-400'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-1.5 px-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleColumn(col.name)}
                              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                            />
                          </td>

                          {/* Column Name with PK badge */}
                          <td className="py-1.5 px-2 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span className={isSelected ? 'text-emerald-300' : 'text-slate-300'}>
                                {col.name}
                              </span>
                              {col.isPrimaryKey && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                                  PK
                                </span>
                              )}
                              {!col.nullable && !col.isPrimaryKey && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-normal shrink-0">
                                  NOT NULL
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Column Type */}
                          <td className="py-1.5 px-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                              {col.type}
                            </span>
                          </td>

                          {/* Custom Alias */}
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              value={currentSelectCol?.alias || ''}
                              onChange={(e) => handleUpdateAlias(col.name, e.target.value)}
                              disabled={!isSelected}
                              placeholder="optional alias"
                              className="w-24 bg-slate-900 border border-slate-800 disabled:opacity-30 rounded px-1.5 py-0.5 text-[11px] text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                            />
                          </td>

                          {/* Aggregate Selector */}
                          <td className="py-1.5 px-2">
                            <select
                              value={currentSelectCol?.aggregate || 'NONE'}
                              onChange={(e) =>
                                handleUpdateAggregate(col.name, e.target.value as ColumnAggregate)
                              }
                              disabled={!isSelected}
                              className="bg-slate-900 border border-slate-800 disabled:opacity-30 rounded px-1.5 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer font-sans"
                            >
                              <option value="NONE">None</option>
                              <option value="COUNT">COUNT()</option>
                              <option value="SUM">SUM()</option>
                              <option value="AVG">AVG()</option>
                              <option value="MIN">MIN()</option>
                              <option value="MAX">MAX()</option>
                              <option value="DISTINCT">DISTINCT</option>
                              <option value="UPPER">UPPER()</option>
                              <option value="LOWER">LOWER()</option>
                              <option value="DATE">DATE()</option>
                            </select>
                          </td>

                          {/* 1-Click Add to Match Filter */}
                          <td className="py-1.5 px-2 text-right">
                            <button
                              onClick={() => onAddMatchFilter(col)}
                              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-indigo-300 transition-colors text-[10px] inline-flex items-center gap-1 cursor-pointer"
                              title={`Add "${col.name}" to WHERE / Match filter criteria`}
                            >
                              <Filter className="w-2.5 h-2.5" />
                              <span>+ Match</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MANUAL EXPRESSION OR PROJECTION CLAUSE VIEW */}
          {(projectionMode === 'custom' || selectAllColumns) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-400">
                  Custom SELECT expression or comma-separated columns:
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      onChangeCustomSelectClause(
                        useTableAlias
                          ? `${tableAlias || 't'}.id, ${tableAlias || 't'}.status, COUNT(*) AS count`
                          : 'id, status, COUNT(*) AS count'
                      )
                    }
                    className="text-[10px] text-slate-400 hover:text-emerald-400 px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
                  >
                    Group summary
                  </button>
                  <button
                    onClick={() => onChangeCustomSelectClause('COUNT(*) AS total_count')}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
                  >
                    Count aggregation
                  </button>
                </div>
              </div>

              <textarea
                value={customSelectClause}
                onChange={(e) => onChangeCustomSelectClause(e.target.value)}
                placeholder={
                  useTableAlias
                    ? `e.g. ${tableAlias || 't'}.id, ${tableAlias || 't'}.name, ${tableAlias || 't'}.email`
                    : 'e.g. id, name, email'
                }
                rows={2}
                className="w-full bg-slate-950 border border-slate-750 rounded p-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* LIVE PROJECTION PREVIEW BAR */}
          <div className="bg-slate-950 border border-slate-800 rounded-md p-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono shrink-0">
                PROJECTION:
              </span>
              <span className="font-mono text-emerald-300 truncate text-[11px]">
                {selectAllColumns
                  ? (useTableAlias && tableAlias ? `${tableAlias}.*` : '*')
                  : customSelectClause || '*'}
              </span>
            </div>

            <button
              onClick={handleCopyProjection}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors text-[11px] font-medium flex items-center gap-1 shrink-0 cursor-pointer"
              title="Copy projected columns"
            >
              {copiedProjection ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
