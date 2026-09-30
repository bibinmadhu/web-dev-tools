import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Sparkles, Trash2, ListFilter, ClipboardPaste, ArrowRight } from 'lucide-react';
import { parsePreferredValuesInput } from '../../../utils/dbInsertQueryGenerator';

interface PreferredValuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnName: string;
  columnType: string;
  maxLength?: number;
  precision?: number;
  scale?: number;
  initialValues: string[];
  onSave: (values: string[]) => void;
}

const PRESET_POOLS: { name: string; category: string; values: string[] }[] = [
  {
    name: 'SME Business Categories',
    category: 'Business',
    values: ['Micro SME', 'SME', 'Small Midcap', 'Large Enterprise', 'Startup'],
  },
  {
    name: 'Order / Process Statuses',
    category: 'E-Commerce',
    values: ['PENDING', 'PROCESSING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
  },
  {
    name: 'User Account Roles',
    category: 'Auth',
    values: ['admin', 'manager', 'developer', 'analyst', 'member', 'guest'],
  },
  {
    name: 'Payment Methods',
    category: 'Finance',
    values: ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'CRYPTO'],
  },
  {
    name: 'Priority Levels',
    category: 'Workflow',
    values: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL', 'BLOCKER'],
  },
  {
    name: 'Corporate Departments',
    category: 'Organization',
    values: ['Engineering', 'Product', 'Marketing', 'Sales', 'Finance', 'Human Resources', 'Legal'],
  },
  {
    name: 'Country Codes (ISO-2)',
    category: 'Location',
    values: ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'JP', 'SG', 'IN', 'BR'],
  },
  {
    name: 'Server Environments',
    category: 'DevOps',
    values: ['development', 'staging', 'qa', 'production', 'sandbox'],
  },
];

export const PreferredValuesModal: React.FC<PreferredValuesModalProps> = ({
  isOpen,
  onClose,
  columnName,
  columnType,
  maxLength,
  precision,
  scale,
  initialValues,
  onSave,
}) => {
  const [inputText, setInputText] = useState('');
  const [deduplicate, setDeduplicate] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputText(initialValues.join('\n'));
      setDeduplicate(false);
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const parsedValues = parsePreferredValuesInput(inputText);
  const finalValues = deduplicate ? Array.from(new Set(parsedValues)) : parsedValues;

  const handleApplyPreset = (presetValues: string[]) => {
    setInputText(presetValues.join('\n'));
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText((prev) => (prev.trim() ? `${prev.trim()}\n${text}` : text));
      }
    } catch {
      // fallback
    }
  };

  const handleSave = () => {
    onSave(finalValues);
    onClose();
  };

  const typeLabel = maxLength
    ? `${columnType}(${maxLength})`
    : precision
    ? `${columnType}(${precision}${scale !== undefined && scale > 0 ? `, ${scale}` : ''})`
    : columnType;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ListFilter className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">Preferred Values Pool</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800/60">
                  {columnName} : {typeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste values from Excel/spreadsheets or pick a standard preset. The generator cycles through this pool.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Size Constraint Notice */}
          {maxLength !== undefined && maxLength > 0 && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300">
              <strong>Size Constraint Active:</strong> This column is restricted to a maximum length of <strong>{maxLength}</strong> characters. Any preferred value exceeding {maxLength} characters will be automatically truncated upon SQL generation to satisfy the database constraint.
            </div>
          )}
          {precision !== undefined && precision > 0 && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300">
              <strong>Numeric Constraint Active:</strong> NUMERIC({precision}{scale !== undefined && scale > 0 ? `, ${scale}` : ''}) bounds maximum absolute value to <strong>{Math.pow(10, Math.max(0, precision - (scale ?? 0))) - 1}</strong> with <strong>{scale ?? 0}</strong> decimal places. Values will be automatically constrained.
            </div>
          )}
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quick Industry Presets:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_POOLS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset.values)}
                  className="px-2 py-1 rounded-md text-[11px] font-medium border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Values List (one per line, or comma-separated)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Paste Clipboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="text-slate-400 hover:text-rose-500 font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste rows copied from Excel/CSV or enter items:&#10;Micro SME&#10;SME&#10;Small Midcap&#10;Large Enterprise"
              rows={8}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Controls: Deduplicate & Stats */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={deduplicate}
                onChange={(e) => setDeduplicate(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Remove duplicate values automatically</span>
            </label>

            <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              {finalValues.length} value(s) in pool
            </div>
          </div>

          {/* Chips Preview */}
          {finalValues.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Parsed Values Preview:
              </label>
              <div className="max-h-28 overflow-y-auto p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-wrap gap-1.5">
                {finalValues.map((v, i) => (
                  <span
                    key={`${v}-${i}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
                  >
                    <span>{v}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...finalValues];
                        next.splice(i, 1);
                        setInputText(next.join('\n'));
                      }}
                      className="text-slate-400 hover:text-rose-500 font-bold ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Preferred Values ({finalValues.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
