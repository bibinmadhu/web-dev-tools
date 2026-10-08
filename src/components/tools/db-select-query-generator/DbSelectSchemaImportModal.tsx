import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Database,
  Check,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileCode,
  Layers,
  ArrowRight,
  Key,
  Trash2,
} from 'lucide-react';
import {
  TableColumn,
  parseCreateTableDdl,
  SCHEMA_DDL_TEMPLATES,
} from '../../../utils/dbSelectQueryGenerator';

export interface DbSelectSchemaImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDdl?: string;
  currentTableName?: string;
  onApplySchema: (data: {
    ddl: string;
    tableName: string;
    schema: string;
    columns: TableColumn[];
    primaryKeys: string[];
  }) => void;
}

export const DbSelectSchemaImportModal: React.FC<DbSelectSchemaImportModalProps> = ({
  isOpen,
  onClose,
  currentDdl = '',
  currentTableName = 'users',
  onApplySchema,
}) => {
  const [ddlInput, setDdlInput] = useState<string>(currentDdl || SCHEMA_DDL_TEMPLATES[0].ddl);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(SCHEMA_DDL_TEMPLATES[0].id);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse DDL live
  const parsed = React.useMemo(() => {
    if (!ddlInput.trim()) return null;
    try {
      const res = parseCreateTableDdl(ddlInput);
      if (res.columns.length === 0) {
        return null;
      }
      return res;
    } catch (e: any) {
      return null;
    }
  }, [ddlInput]);

  if (!isOpen) return null;

  const handleSelectTemplate = (templateId: string) => {
    const tmpl = SCHEMA_DDL_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setActiveTemplateId(templateId);
      setDdlInput(tmpl.ddl);
      setParseError(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setDdlInput(content);
        setActiveTemplateId('uploaded-file');
        setParseError(null);
      }
    };
    reader.readAsText(file);
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleApply = () => {
    if (!parsed || parsed.columns.length === 0) {
      setParseError('Could not detect any valid column definitions. Please ensure you have a standard CREATE TABLE statement.');
      return;
    }

    onApplySchema({
      ddl: ddlInput,
      tableName: parsed.tableName || currentTableName || 'records',
      schema: parsed.schema || 'public',
      columns: parsed.columns,
      primaryKeys: parsed.primaryKeys,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-750 rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Import Table Schema (DDL)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
                  PostgreSQL / SQL DDL
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Import CREATE TABLE definitions to unlock use-case column selectors, types, and primary key awareness.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TEMPLATES ROW */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Presets:
          </span>
          {SCHEMA_DDL_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 border ${
                activeTemplateId === tmpl.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
              }`}
            >
              <span>{tmpl.name}</span>
            </button>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded text-xs font-medium shrink-0 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 ml-auto"
          >
            <Upload className="w-3 h-3 text-emerald-400" />
            <span>Upload .sql/.ddl</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.ddl,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 text-xs">
          {/* DDL Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                CREATE TABLE DDL Statement:
              </label>
              {ddlInput && (
                <button
                  onClick={() => setDdlInput('')}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            <textarea
              value={ddlInput}
              onChange={(e) => {
                setDdlInput(e.target.value);
                setParseError(null);
              }}
              placeholder={`CREATE TABLE public.orders (\n  id UUID PRIMARY KEY,\n  customer_id VARCHAR(64) NOT NULL,\n  status VARCHAR(32) DEFAULT 'pending',\n  total_amount NUMERIC(12, 2) NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);`}
              rows={9}
              className="w-full bg-slate-950 border border-slate-750 rounded-lg p-3 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* PARSE STATUS & PREVIEW */}
          {parsed && parsed.columns.length > 0 ? (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Successfully parsed schema for table &ldquo;{parsed.schema}.{parsed.tableName}&rdquo;
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 font-mono border border-emerald-700/40">
                    {parsed.columns.length} columns detected
                  </span>
                  {parsed.primaryKeys.length > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 font-mono border border-amber-700/40 flex items-center gap-1">
                      <Key className="w-3 h-3" />
                      PK: {parsed.primaryKeys.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick column pills preview */}
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto pr-1">
                {parsed.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded px-2 py-1 text-[11px]"
                  >
                    <span className="font-mono text-slate-200">{col.name}</span>
                    <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400 font-mono">
                      {col.type}
                    </span>
                    {col.isPrimaryKey && (
                      <span className="text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                        PK
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-slate-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Enter a valid SQL <code className="text-slate-200 font-mono">CREATE TABLE</code> statement above or choose a preset template.
              </span>
            </div>
          )}

          {parseError && (
            <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-3 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target table name and column projections will be synced automatically.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!parsed || parsed.columns.length === 0}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                parsed && parsed.columns.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Apply Schema &amp; Select Columns
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
