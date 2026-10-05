import React, { useState } from 'react';
import {
  Table,
  Plus,
  Trash2,
  Key,
  Code2,
  Sparkles,
  ArrowDown,
  ArrowUp,
  FileCode,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  TableColumn,
  ColumnDataType,
  COMMON_DATA_TYPES,
  parseCreateTableDdl,
  createDefaultIdColumn,
} from '../../../utils/dbRowCopyGenerator';

interface TableDefinitionEditorProps {
  tableName: string;
  schemaName?: string;
  columns: TableColumn[];
  onUpdateTableName: (name: string) => void;
  onUpdateSchemaName: (schema: string | undefined) => void;
  onUpdateColumns: (cols: TableColumn[]) => void;
  onSelectLookupColumn?: (colName: string) => void;
}

export const TableDefinitionEditor: React.FC<TableDefinitionEditorProps> = ({
  tableName,
  schemaName,
  columns,
  onUpdateTableName,
  onUpdateSchemaName,
  onUpdateColumns,
  onSelectLookupColumn,
}) => {
  const [isDdlModalOpen, setIsDdlModalOpen] = useState(false);
  const [pastedDdl, setPastedDdl] = useState('');
  const [ddlError, setDdlError] = useState<string | null>(null);

  const handleAddColumn = () => {
    const newIdx = columns.length + 1;
    const newCol: TableColumn = {
      id: `col_${Date.now()}_${newIdx}`,
      name: `column_${newIdx}`,
      type: 'VARCHAR',
      isPrimaryKey: false,
      isNullable: true,
    };
    onUpdateColumns([...columns, newCol]);
  };

  const handleRemoveColumn = (id: string) => {
    if (columns.length <= 1) return;
    onUpdateColumns(columns.filter((c) => c.id !== id));
  };

  const handleUpdateColumnField = <K extends keyof TableColumn>(
    id: string,
    field: K,
    value: TableColumn[K]
  ) => {
    onUpdateColumns(
      columns.map((col) => {
        if (col.id !== id) return col;
        const updated = { ...col, [field]: value };
        // If set as primary key, also make it not-null
        if (field === 'isPrimaryKey' && value === true) {
          updated.isNullable = false;
        }
        return updated;
      })
    );
  };

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const reordered = [...columns];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    onUpdateColumns(reordered);
  };

  const handleApplyDdl = () => {
    setDdlError(null);
    try {
      const parsed = parseCreateTableDdl(pastedDdl);
      if (parsed.columns.length === 0) {
        setDdlError('Could not find any valid column definitions in the pasted DDL.');
        return;
      }
      onUpdateTableName(parsed.tableName);
      onUpdateSchemaName(parsed.schemaName);
      onUpdateColumns(parsed.columns);

      // Auto-select primary key as lookup column if found
      const pk = parsed.columns.find((c) => c.isPrimaryKey);
      if (pk && onSelectLookupColumn) {
        onSelectLookupColumn(pk.name);
      }

      setIsDdlModalOpen(false);
      setPastedDdl('');
    } catch (e: any) {
      setDdlError(`Failed to parse DDL: ${e.message}`);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Table Header & Quick DDL import */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Table Definition</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Specify table name and column schemas for row copying
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDdlModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Import CREATE TABLE DDL</span>
          </button>
        </div>
      </div>

      {/* Table & Schema Name Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Schema Name (Optional)
          </label>
          <input
            type="text"
            value={schemaName || ''}
            onChange={(e) => onUpdateSchemaName(e.target.value || undefined)}
            placeholder="e.g. public or sales"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Table Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => onUpdateTableName(e.target.value)}
            placeholder="e.g. orders or user_profiles"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono font-semibold"
          />
        </div>
      </div>

      {/* Column Schema Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Table Columns ({columns.length})
          </span>
          <button
            type="button"
            onClick={handleAddColumn}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Column</span>
          </button>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto max-h-[340px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="py-2 px-3 w-8 text-center">#</th>
                <th className="py-2 px-3">Column Name</th>
                <th className="py-2 px-3 w-36">Data Type</th>
                <th className="py-2 px-3 w-48">Auto-Gen / Identity</th>
                <th className="py-2 px-3 w-16 text-center">PK</th>
                <th className="py-2 px-3 w-16 text-center">Nullable</th>
                <th className="py-2 px-3 w-28">Default Value</th>
                <th className="py-2 px-3 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
              {columns.map((col, idx) => (
                <tr
                  key={col.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2 px-2 text-center text-slate-400 text-[11px]">{idx + 1}</td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleUpdateColumnField(col.id, 'name', e.target.value)}
                      placeholder="column_name"
                      className="w-full px-2 py-1 text-xs rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 bg-transparent text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={col.type}
                      onChange={(e) =>
                        handleUpdateColumnField(col.id, 'type', e.target.value as ColumnDataType)
                      }
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                    >
                      {COMMON_DATA_TYPES.map((dt) => (
                        <option key={dt.type} value={dt.type}>
                          {dt.type}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={col.identityType || (col.isIdentity ? 'by_default' : 'none')}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        if (val === 'none') {
                          onUpdateColumns(
                            columns.map((c) =>
                              c.id === col.id
                                ? { ...c, isIdentity: false, identityType: 'none', identityDefinition: undefined }
                                : c
                            )
                          );
                        } else {
                          const defMap: Record<string, string> = {
                            by_default: 'GENERATED BY DEFAULT AS IDENTITY',
                            always: 'GENERATED ALWAYS AS IDENTITY',
                            auto_increment: 'AUTO_INCREMENT',
                            identity: 'IDENTITY(1,1)',
                            serial: 'SERIAL',
                            autoincrement: 'AUTOINCREMENT',
                          };
                          onUpdateColumns(
                            columns.map((c) =>
                              c.id === col.id
                                ? {
                                    ...c,
                                    isIdentity: true,
                                    identityType: val,
                                    identityDefinition: defMap[val],
                                    isNullable: false,
                                    isPrimaryKey: true,
                                  }
                                : c
                            )
                          );
                        }
                      }}
                      className="w-full px-2 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 font-mono"
                    >
                      <option value="none">None (Standard)</option>
                      <option value="by_default">⚡ GENERATED BY DEFAULT AS IDENTITY</option>
                      <option value="always">⚡ GENERATED ALWAYS AS IDENTITY</option>
                      <option value="auto_increment">⚡ AUTO_INCREMENT (MySQL)</option>
                      <option value="identity">⚡ IDENTITY(1,1) (SQL Server)</option>
                      <option value="serial">⚡ SERIAL / BigSerial (PostgreSQL)</option>
                      <option value="autoincrement">⚡ AUTOINCREMENT (SQLite)</option>
                    </select>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={col.isPrimaryKey}
                      onChange={(e) => handleUpdateColumnField(col.id, 'isPrimaryKey', e.target.checked)}
                      title="Is Primary Key"
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={col.isNullable}
                      disabled={col.isPrimaryKey || col.isIdentity}
                      onChange={(e) => handleUpdateColumnField(col.id, 'isNullable', e.target.checked)}
                      title="Is Nullable"
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900 disabled:opacity-40"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={col.defaultValue || ''}
                      onChange={(e) =>
                        handleUpdateColumnField(col.id, 'defaultValue', e.target.value || undefined)
                      }
                      placeholder="e.g. NOW() or 0"
                      className="w-full px-2 py-1 text-xs rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 bg-transparent text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveColumn(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveColumn(idx, 'down')}
                        disabled={idx === columns.length - 1}
                        title="Move Down"
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-20"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(col.id)}
                        disabled={columns.length <= 1}
                        title="Remove Column"
                        className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TABLE DDL Import Modal */}
      {isDdlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-500" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Import Table Schema from DDL
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsDdlModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded"
              >
                Cancel
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paste any standard SQL <code className="font-mono text-indigo-500">CREATE TABLE</code> statement.
                  Columns, primary keys, and auto-generated identity clauses will be parsed automatically.
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setPastedDdl(
                        `CREATE TABLE finance.accounts (\n    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,\n    account_number VARCHAR(50) NOT NULL,\n    customer_id BIGINT NOT NULL,\n    balance NUMERIC(12,2) NOT NULL,\n    status VARCHAR(20) DEFAULT 'ACTIVE',\n    created_at TIMESTAMPTZ DEFAULT NOW()\n);`
                      )
                    }
                    className="px-2 py-0.5 text-[11px] rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-mono"
                  >
                    Load Postgres Identity DDL
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPastedDdl(
                        `CREATE TABLE public.products (\n    id bigint NOT NULL AUTO_INCREMENT PRIMARY KEY,\n    sku VARCHAR(64) NOT NULL,\n    title VARCHAR(255) NOT NULL,\n    unit_price NUMERIC(10,2) NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);`
                      )
                    }
                    className="px-2 py-0.5 text-[11px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-mono"
                  >
                    Load MySQL AUTO_INCREMENT
                  </button>
                </div>
              </div>
              <textarea
                value={pastedDdl}
                onChange={(e) => setPastedDdl(e.target.value)}
                placeholder={`CREATE TABLE finance.accounts (\n    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,\n    account_number VARCHAR(50) NOT NULL,\n    customer_id BIGINT NOT NULL,\n    balance NUMERIC(12,2) NOT NULL,\n    status VARCHAR(20) DEFAULT 'ACTIVE',\n    created_at TIMESTAMPTZ DEFAULT NOW()\n);`}
                rows={9}
                className="w-full p-3 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {ddlError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                {ddlError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDdlModalOpen(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApplyDdl}
                disabled={!pastedDdl.trim()}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-xs"
              >
                Parse & Apply Schema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
