import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Table,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Sliders,
  Settings2,
  FileSpreadsheet,
  FileCode,
  Database,
  Check,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Maximize2,
  Minimize2,
  ArrowUp,
  ArrowDown,
  Pencil,
  X,
  Layers,
  BarChart2,
  Code,
  Info,
} from 'lucide-react';
import {
  CsvColumnRule,
  CsvPopulatorOptions,
  DEFAULT_CSV_OPTIONS,
  CSV_POPULATOR_PRESETS,
  parseHeadersInput,
  inferColumnRule,
  generateCsvDataset,
  generateColumnValue,
  extractHeadersAndInferRulesFromCsv,
} from '../../../utils/csvAutoPopulator';
import { ColumnRuleModal } from './ColumnRuleModal';
import { ConfigImportExportModal } from './ConfigImportExportModal';
import { SqlExportModal } from './SqlExportModal';

interface CsvAutoPopulatorToolProps {
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const CsvAutoPopulatorTool: React.FC<CsvAutoPopulatorToolProps> = ({
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  // Initialize with first preset: Employee Directory
  const initialPreset = CSV_POPULATOR_PRESETS[0];

  const [headerTextInput, setHeaderTextInput] = useState(initialPreset.headers);
  const [options, setOptions] = useState<CsvPopulatorOptions>(() => ({
    ...DEFAULT_CSV_OPTIONS,
    ...initialPreset.options,
  }));

  // Modals & Active editing state
  const [activeEditingRule, setActiveEditingRule] = useState<CsvColumnRule | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Resultant Data Grid cell editing state
  const [editingCell, setEditingCell] = useState<{ rowIdx: number; colHeader: string } | null>(null);
  const [editingCellText, setEditingCellText] = useState('');

  // Active view tab in results: 'grid' | 'raw' | 'stats'
  const [activeTab, setActiveTab] = useState<'grid' | 'raw' | 'stats'>('grid');

  // Pagination for grid
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Refresh trigger state
  const [refreshSeed, setRefreshSeed] = useState(0);

  // Notification status
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Generate dataset based on current options & refreshSeed
  const dataset = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshSeed; // trigger dependency
    return generateCsvDataset(options);
  }, [options, refreshSeed]);

  // Headers list
  const currentHeaders = useMemo(() => {
    return options.columns.map((c) => c.header);
  }, [options.columns]);

  // Handle header text input apply
  const handleApplyHeadersText = () => {
    const parsed = parseHeadersInput(headerTextInput, options.delimiter);
    if (parsed.length === 0) {
      showStatus('Please specify at least 1 valid header name');
      return;
    }

    // Preserve existing column rules if header matches, else infer new rule
    const newColumns: CsvColumnRule[] = parsed.map((h, idx) => {
      const existing = options.columns.find((c) => c.header.toLowerCase() === h.toLowerCase());
      if (existing) {
        return { ...existing, header: h };
      }
      return inferColumnRule(h, idx);
    });

    setOptions((prev) => ({
      ...prev,
      columns: newColumns,
      customGridRows: undefined, // reset cell overrides on structure change
    }));
    showStatus(`Applied ${newColumns.length} headers with auto-inferred rules`);
  };

  // Quick add single column
  const handleAddColumn = () => {
    const newIdx = options.columns.length + 1;
    const newHeader = `custom_field_${newIdx}`;
    const newRule = inferColumnRule(newHeader, newIdx - 1);
    setOptions((prev) => ({
      ...prev,
      columns: [...prev.columns, newRule],
    }));
    setHeaderTextInput((prev) => (prev ? `${prev}, ${newHeader}` : newHeader));
    setActiveEditingRule(newRule);
  };

  // Delete column
  const handleDeleteColumn = (colId: string) => {
    if (options.columns.length <= 1) {
      showStatus('At least 1 column must be retained');
      return;
    }
    const updated = options.columns.filter((c) => c.id !== colId);
    setOptions((prev) => ({
      ...prev,
      columns: updated,
    }));
    setHeaderTextInput(updated.map((c) => c.header).join(', '));
  };

  // Duplicate column
  const handleDuplicateColumn = (col: CsvColumnRule) => {
    const newHeader = `${col.header}_copy`;
    const duplicated: CsvColumnRule = {
      ...col,
      id: `col_${Date.now().toString(36)}`,
      header: newHeader,
    };
    const colIndex = options.columns.findIndex((c) => c.id === col.id);
    const updated = [...options.columns];
    updated.splice(colIndex + 1, 0, duplicated);

    setOptions((prev) => ({
      ...prev,
      columns: updated,
    }));
    setHeaderTextInput(updated.map((c) => c.header).join(', '));
  };

  // Reorder column up/down
  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= options.columns.length) return;

    const updated = [...options.columns];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setOptions((prev) => ({
      ...prev,
      columns: updated,
    }));
    setHeaderTextInput(updated.map((c) => c.header).join(', '));
  };

  // Update specific column rule from modal
  const handleSaveRule = (updatedRule: CsvColumnRule) => {
    setOptions((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.id === updatedRule.id ? updatedRule : c)),
    }));
    setHeaderTextInput((prev) => {
      return options.columns
        .map((c) => (c.id === updatedRule.id ? updatedRule.header : c.header))
        .join(', ');
    });
    showStatus(`Updated rule for "${updatedRule.header}"`);
  };

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const preset = CSV_POPULATOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setHeaderTextInput(preset.headers);
    setOptions({
      ...DEFAULT_CSV_OPTIONS,
      ...preset.options,
      customGridRows: undefined,
    });
    setCurrentPage(1);
    showStatus(`Loaded "${preset.name}" preset`);
  };

  // Upload existing CSV file to extract headers & rules
  const handleUploadCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { headers, rules, detectedRowCount } = extractHeadersAndInferRulesFromCsv(content);

      if (headers.length === 0) {
        showStatus('Could not extract headers from uploaded file');
        return;
      }

      setHeaderTextInput(headers.join(', '));
      setOptions((prev) => ({
        ...prev,
        columns: rules,
        rowCount: detectedRowCount > 0 ? Math.min(detectedRowCount, 100) : prev.rowCount,
        customGridRows: undefined,
      }));
      showStatus(`Extracted ${headers.length} headers and inferred rules from "${file.name}"`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Resultant Data Grid cell editing handlers
  const handleStartCellEdit = (rowIdx: number, colHeader: string, currentVal: any) => {
    setEditingCell({ rowIdx, colHeader });
    setEditingCellText(currentVal === null || currentVal === undefined ? '' : String(currentVal));
  };

  const handleSaveCellEdit = (rowIdx: number, colHeader: string, newVal: any) => {
    const currentCustomRows = options.customGridRows
      ? options.customGridRows.map((r) => ({ ...r }))
      : dataset.rows.map((r) => ({ ...r }));

    if (!currentCustomRows[rowIdx]) {
      currentCustomRows[rowIdx] = {};
    }
    currentCustomRows[rowIdx][colHeader] = newVal;

    setOptions((prev) => ({
      ...prev,
      customGridRows: currentCustomRows,
    }));
    setEditingCell(null);
  };

  const handleCancelCellEdit = () => {
    setEditingCell(null);
  };

  const handleAddGridRow = () => {
    const currentRows = options.customGridRows
      ? options.customGridRows.map((r) => ({ ...r }))
      : dataset.rows.map((r) => ({ ...r }));

    const dummySet = new Set<any>();
    const newRowObj: Record<string, any> = {};
    const newIdx = currentRows.length;

    options.columns.forEach((col) => {
      newRowObj[col.header] = generateColumnValue(col, newIdx, newIdx + 1, dummySet, newRowObj);
    });

    currentRows.push(newRowObj);

    setOptions((prev) => ({
      ...prev,
      rowCount: currentRows.length,
      customGridRows: currentRows,
    }));
    showStatus(`Added row #${currentRows.length}`);
  };

  const handleDeleteGridRow = (rowIdx: number) => {
    const currentRows = options.customGridRows
      ? options.customGridRows.map((r) => ({ ...r }))
      : dataset.rows.map((r) => ({ ...r }));

    if (currentRows.length <= 1) {
      showStatus('At least 1 row must be retained');
      return;
    }

    currentRows.splice(rowIdx, 1);
    setOptions((prev) => ({
      ...prev,
      rowCount: currentRows.length,
      customGridRows: currentRows,
    }));
    showStatus(`Deleted row #${rowIdx + 1}`);
  };

  const handleClearGridOverrides = () => {
    setOptions((prev) => ({
      ...prev,
      customGridRows: undefined,
    }));
    showStatus('Reset all manual grid cell edits');
  };

  // Copy CSV to clipboard
  const handleCopyCsv = () => {
    navigator.clipboard.writeText(dataset.csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showStatus('Copied CSV to clipboard');
  };

  // Download CSV file
  const handleDownloadCsv = () => {
    const blob = new Blob([dataset.csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autopopulated_dataset_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus('Downloaded CSV dataset file');
  };

  // Export JSON array of objects
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(dataset.rows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataset_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus('Exported JSON dataset file');
  };

  // Pagination calculation
  const totalPages = Math.ceil(dataset.rows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return dataset.rows.slice(start, start + pageSize);
  }, [dataset.rows, currentPage, pageSize]);

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 ${
        isFullScreen ? 'h-screen w-screen' : 'h-[85vh] w-full'
      } rounded-xl overflow-hidden`}
    >
      {/* Hidden file input for CSV upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadCsv}
        accept=".csv,text/csv,text/plain"
        className="hidden"
      />

      {/* Top Application Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                CSV Auto Populator
              </h2>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                {options.columns.length} Columns • {options.rowCount} Rows
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Provide headers, define column rules & constraints, edit resultant grid, and export CSV/SQL
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Preset Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) handleLoadPreset(e.target.value);
            }}
            defaultValue=""
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none"
          >
            <option value="" disabled>
              Load Preset Template...
            </option>
            {CSV_POPULATOR_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Import / Export Config */}
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
            title="Import or Export column configuration rules JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-500" />
            <span>Config Rules</span>
          </button>

          {/* Upload CSV */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
            title="Upload CSV to auto-detect headers and infer rules"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Upload CSV</span>
          </button>

          {/* Full Screen Toggle */}
          {onToggleFullScreen && (
            <button
              type="button"
              onClick={onToggleFullScreen}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area (Split into Left: Header & Rules Config, Right: Resultant Preview) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Side: Configuration Controls & Column Rules */}
        <div className="w-full lg:w-[48%] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 overflow-hidden">
          {/* Header Input Card */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-emerald-500" />
                <span>Provide Column Headers:</span>
              </label>
              <button
                type="button"
                onClick={handleAddColumn}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add Column
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={headerTextInput}
                onChange={(e) => setHeaderTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyHeadersText();
                }}
                placeholder="id, first_name, last_name, email, department, salary, hire_date..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleApplyHeadersText}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs shrink-0 transition-colors"
              >
                Apply
              </button>
            </div>

            {/* Quick Generator Parameters (Row Count, Delimiter, Quotes) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Rows to Generate:</label>
                <input
                  type="number"
                  min={1}
                  max={20000}
                  value={options.rowCount}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      rowCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                      customGridRows: undefined,
                    }))
                  }
                  className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Delimiter:</label>
                <select
                  value={options.delimiter}
                  onChange={(e) => setOptions((prev) => ({ ...prev, delimiter: e.target.value as any }))}
                  className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="&#9;">Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Quote Mode:</label>
                <select
                  value={options.quoteMode}
                  onChange={(e) => setOptions((prev) => ({ ...prev, quoteMode: e.target.value as any }))}
                  className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                >
                  <option value="needed">As Needed</option>
                  <option value="always">Always Quote</option>
                  <option value="never">Never Quote</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Header Row:</label>
                <select
                  value={options.includeHeader ? 'yes' : 'no'}
                  onChange={(e) => setOptions((prev) => ({ ...prev, includeHeader: e.target.value === 'yes' }))}
                  className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                >
                  <option value="yes">Include Headers</option>
                  <option value="no">Data Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Column Rules List Header */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0">
            <span>Configured Column Rules ({options.columns.length})</span>
            <span className="text-[10px] text-slate-400">Click column card to configure rule details</span>
          </div>

          {/* Scrollable Column Rules Cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {options.columns.map((col, idx) => {
              const ruleDetailSummary = (() => {
                if (col.generatorType === 'sequence') {
                  return `Seq: start ${col.startNumber || 1}, step ${col.stepNumber || 1}`;
                }
                if (col.generatorType === 'integer_range' || col.generatorType === 'decimal_range') {
                  return `${col.min || 0} to ${col.max || 100}${col.decimals ? ` (${col.decimals} dec)` : ''}`;
                }
                if (col.generatorType === 'date_range') {
                  return `${col.startDate || '2024'} to ${col.endDate || '2026'}`;
                }
                if (col.generatorType === 'pick_list') {
                  return `${col.pickList?.length || 3} items (${col.pickListMode || 'random'})`;
                }
                if (col.generatorType === 'pattern') {
                  return col.patternTemplate || 'SKU-###-???';
                }
                if (col.generatorType === 'boolean') {
                  return `${col.booleanFormat || 'true/false'} (${col.trueProbability || 50}% true)`;
                }
                if (col.generatorType === 'formula') {
                  return col.formulaExpr || 'Formula';
                }
                return col.generatorType.replace(/_/g, ' ');
              })();

              return (
                <div
                  key={col.id}
                  onClick={() => setActiveEditingRule(col)}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-5 text-center text-slate-400 font-mono text-[11px] shrink-0">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs truncate">
                          {col.header}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 shrink-0">
                          {col.generatorType}
                        </span>
                        {col.unique && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 shrink-0">
                            Unique
                          </span>
                        )}
                        {col.nullable && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 shrink-0">
                            Nullable
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {ruleDetailSummary}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Reorder & Delete */}
                  <div
                    className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity ml-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleMoveColumn(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveColumn(idx, 'down')}
                      disabled={idx === options.columns.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateColumn(col)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-500"
                      title="Duplicate Column"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteColumn(col.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500"
                      title="Delete Column"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Resultant Output (Data Grid, Raw CSV, Column Stats) */}
        <div className="w-full lg:w-[52%] flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
          {/* Results Tab Bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'grid'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Resultant Grid View</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'raw'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Raw CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'stats'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Column Metrics</span>
              </button>
            </div>

            {/* Quick Regeneration Button */}
            <div className="flex items-center gap-2">
              {options.customGridRows && options.customGridRows.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearGridOverrides}
                  className="text-[11px] font-semibold text-rose-500 hover:underline mr-1"
                >
                  Reset Edits
                </button>
              )}
              <button
                type="button"
                onClick={() => setRefreshSeed((s) => s + 1)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-200 dark:border-emerald-800 transition-colors"
                title="Regenerate all randomized rows"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Resultant Interactive Data Grid */}
          {activeTab === 'grid' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left font-mono text-[11px] border-collapse">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs z-10">
                    <tr>
                      <th className="p-2 w-10 text-slate-500 font-semibold select-none text-center">#</th>
                      {currentHeaders.map((header) => {
                        const colDef = options.columns.find((c) => c.header === header);
                        return (
                          <th key={header} className="p-2 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{header}</span>
                              {colDef && (
                                <span className="text-[9px] font-normal text-slate-400 px-1 rounded bg-slate-200/70 dark:bg-slate-800">
                                  {colDef.generatorType}
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                      <th className="p-2 w-16 text-slate-500 font-semibold text-right pr-3 select-none">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedRows.map((row, localIdx) => {
                      const actualRowIdx = (currentPage - 1) * pageSize + localIdx;
                      return (
                        <tr key={actualRowIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors group">
                          <td className="p-2 text-slate-400 font-mono text-[10px] select-none text-center">
                            {actualRowIdx + 1}
                          </td>
                          {currentHeaders.map((header) => {
                            const val = row[header];
                            const isEditing = editingCell?.rowIdx === actualRowIdx && editingCell?.colHeader === header;
                            const isCustom = options.customGridRows?.[actualRowIdx]?.[header] !== undefined;

                            return (
                              <td
                                key={header}
                                className={`p-1.5 whitespace-nowrap font-mono transition-colors relative ${
                                  isEditing ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                                }`}
                                onClick={() => {
                                  if (!isEditing) handleStartCellEdit(actualRowIdx, header, val);
                                }}
                                title="Click to edit cell value"
                              >
                                {isEditing ? (
                                  <div
                                    className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded border border-emerald-500 shadow-md"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingCellText}
                                      onChange={(e) => setEditingCellText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveCellEdit(actualRowIdx, header, editingCellText);
                                        if (e.key === 'Escape') handleCancelCellEdit();
                                      }}
                                      className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-950 rounded text-xs font-mono border border-slate-300 dark:border-slate-700 min-w-[120px] focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveCellEdit(actualRowIdx, header, editingCellText)}
                                      className="p-1 rounded bg-emerald-600 text-white"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelCellEdit}
                                      className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-1 px-1">
                                    <span className={val === '' || val === null || val === undefined ? 'text-slate-400 italic' : isCustom ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-800 dark:text-slate-200'}>
                                      {val === '' || val === null || val === undefined ? '<empty>' : String(val)}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {isCustom && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="Manually edited cell" />
                                      )}
                                      <Pencil className="w-2.5 h-2.5 text-slate-400 hover:text-emerald-500" />
                                    </div>
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          {/* Row actions */}
                          <td className="p-1.5 text-right pr-3 select-none">
                            <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleDeleteGridRow(actualRowIdx)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500"
                                title="Delete row"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Grid Pagination Footer */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs shrink-0">
                <button
                  type="button"
                  onClick={handleAddGridRow}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Append Row
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    Page {currentPage} of {totalPages} ({dataset.rows.length} total rows)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Raw CSV View */}
          {activeTab === 'raw' && (
            <div className="flex-1 flex flex-col p-3 bg-slate-950 overflow-hidden">
              <pre className="flex-1 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-auto border border-slate-800 whitespace-pre">
                {dataset.csv || '/* No data generated */'}
              </pre>
            </div>
          )}

          {/* Tab 3: Column Metrics Summary */}
          {activeTab === 'stats' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                Generated Dataset Column Cardinality & Null Metrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.columns.map((col) => {
                  const stat = dataset.columnStats[col.header];
                  return (
                    <div
                      key={col.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-xs text-slate-900 dark:text-white truncate">
                          {col.header}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                          {col.generatorType}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <div>Unique Values: <strong className="text-slate-900 dark:text-slate-100">{stat?.uniqueCount || 0}</strong></div>
                        <div>Empty / Nulls: <strong className="text-slate-900 dark:text-slate-100">{stat?.nullCount || 0}</strong></div>
                      </div>
                      {stat?.sampleValues && stat.sampleValues.length > 0 && (
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          Samples: {stat.sampleValues.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Main Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
          {statusMessage ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
              {statusMessage}
            </span>
          ) : (
            <>
              <span>Columns: {options.columns.length}</span>
              <span>•</span>
              <span>Rows: {dataset.rows.length}</span>
              <span>•</span>
              <span>Size: {(new Blob([dataset.csv]).size / 1024).toFixed(1)} KB</span>
            </>
          )}
        </div>

        {/* Primary Export & Download Buttons */}
        <div className="flex items-center gap-2">
          {/* Export SQL */}
          <button
            type="button"
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>SQL INSERT</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-500" />
            <span>JSON</span>
          </button>

          {/* Copy CSV */}
          <button
            type="button"
            onClick={handleCopyCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy CSV'}</span>
          </button>

          {/* Download CSV */}
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Deep Column Rule Configuration Modal */}
      <ColumnRuleModal
        isOpen={activeEditingRule !== null}
        onClose={() => setActiveEditingRule(null)}
        rule={activeEditingRule}
        onSave={handleSaveRule}
        allHeaders={currentHeaders}
      />

      {/* Import / Export JSON Configuration Modal */}
      <ConfigImportExportModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        options={options}
        onImportConfig={(importedConfig) => {
          setOptions(importedConfig);
          setHeaderTextInput(importedConfig.columns.map((c) => c.header).join(', '));
          showStatus(`Imported configuration with ${importedConfig.columns.length} columns`);
        }}
      />

      {/* SQL INSERT Export Modal */}
      <SqlExportModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        rows={dataset.rows}
        headers={currentHeaders}
      />
    </div>
  );
};
