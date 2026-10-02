import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  Sparkles,
  Sliders,
  Hash,
  Type,
  Calendar,
  Layers,
  HelpCircle,
  Eye,
  ListPlus,
  Trash2,
} from 'lucide-react';
import {
  CsvColumnRule,
  CsvGeneratorType,
  generateColumnValue,
} from '../../../utils/csvAutoPopulator';

interface ColumnRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: CsvColumnRule | null;
  onSave: (updatedRule: CsvColumnRule) => void;
  allHeaders: string[];
}

export const ColumnRuleModal: React.FC<ColumnRuleModalProps> = ({
  isOpen,
  onClose,
  rule,
  onSave,
  allHeaders,
}) => {
  if (!isOpen || !rule) return null;

  const [formData, setFormData] = useState<CsvColumnRule>({ ...rule });
  const [pickListInput, setPickListInput] = useState(
    rule.pickList ? rule.pickList.join(', ') : ''
  );

  const updateField = <K extends keyof CsvColumnRule>(key: K, value: CsvColumnRule[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Generate live sample values based on current modal form data
  const sampleValues = useMemo(() => {
    const samples: any[] = [];
    const dummySet = new Set<any>();
    const dummyRow: Record<string, any> = {};
    allHeaders.forEach((h) => {
      dummyRow[h] = 'sample_value';
    });

    const activeRule: CsvColumnRule = {
      ...formData,
      pickList: formData.generatorType === 'pick_list'
        ? pickListInput.split(',').map((s) => s.trim()).filter(Boolean)
        : formData.pickList,
    };

    for (let i = 0; i < 5; i++) {
      samples.push(generateColumnValue(activeRule, i, 5, dummySet, dummyRow));
    }
    return samples;
  }, [formData, pickListInput, allHeaders]);

  const handleSave = () => {
    const finalRule: CsvColumnRule = {
      ...formData,
      pickList: formData.generatorType === 'pick_list'
        ? pickListInput.split(',').map((s) => s.trim()).filter(Boolean)
        : formData.pickList,
    };
    onSave(finalRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Configure Rule for "{rule.header}"
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define data generation type, constraints, format masks, and preview outputs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Header Name & Generator Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Column Header Name:
              </label>
              <input
                type="text"
                value={formData.header}
                onChange={(e) => updateField('header', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Generator Type:
              </label>
              <select
                value={formData.generatorType}
                onChange={(e) => updateField('generatorType', e.target.value as CsvGeneratorType)}
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-medium text-xs focus:outline-none focus:border-indigo-500"
              >
                <optgroup label="Identifiers & Sequences">
                  <option value="sequence">Auto-increment Sequence (1, 2, 3...)</option>
                  <option value="uuid">Random UUID v4</option>
                  <option value="pattern">Pattern / Mask Template (e.g. SKU-###-???)</option>
                </optgroup>
                <optgroup label="People & Contact">
                  <option value="first_name">First Name</option>
                  <option value="last_name">Last Name</option>
                  <option value="full_name">Full Name</option>
                  <option value="email">Email Address</option>
                  <option value="phone">Phone Number</option>
                  <option value="company">Company / Organization</option>
                  <option value="job_title">Job Title</option>
                  <option value="department">Department</option>
                </optgroup>
                <optgroup label="Location & Address">
                  <option value="country">Country</option>
                  <option value="city">City</option>
                  <option value="state">State / Province</option>
                  <option value="street_address">Street Address</option>
                  <option value="postal_code">Postal / Zip Code</option>
                </optgroup>
                <optgroup label="Numeric & Financial">
                  <option value="integer_range">Integer Range (Min - Max)</option>
                  <option value="decimal_range">Decimal Float (Min - Max, Decimals)</option>
                  <option value="percentage">Percentage (0% - 100%)</option>
                  <option value="currency">Currency ($100.00)</option>
                </optgroup>
                <optgroup label="Dates & Times">
                  <option value="date_range">Date Range (Start - End Date)</option>
                  <option value="relative_date">Relative Date (Past / Future)</option>
                </optgroup>
                <optgroup label="Categories & Booleans">
                  <option value="pick_list">Pick from List (Categorical)</option>
                  <option value="boolean">Boolean (true/false, 1/0, yes/no)</option>
                  <option value="status_code">HTTP Status Code</option>
                </optgroup>
                <optgroup label="Technical & Computed">
                  <option value="formula">Computed Formula (JavaScript expression)</option>
                  <option value="ip_address">IPv4 Address</option>
                  <option value="url">Website URL</option>
                  <option value="lorem_words">Lorem Ipsum Text</option>
                  <option value="fixed">Fixed Constant Value</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Generator-Specific Options Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Generator Parameters</span>
            </h4>

            {/* Sequence */}
            {formData.generatorType === 'sequence' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Start Number:</label>
                  <input
                    type="number"
                    value={formData.startNumber !== undefined ? formData.startNumber : 1}
                    onChange={(e) => updateField('startNumber', parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Step (Increment):</label>
                  <input
                    type="number"
                    value={formData.stepNumber !== undefined ? formData.stepNumber : 1}
                    onChange={(e) => updateField('stepNumber', parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Numeric Ranges */}
            {(formData.generatorType === 'integer_range' ||
              formData.generatorType === 'decimal_range' ||
              formData.generatorType === 'percentage' ||
              formData.generatorType === 'currency') && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Min Value:</label>
                  <input
                    type="number"
                    value={formData.min !== undefined ? formData.min : 1}
                    onChange={(e) => updateField('min', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Max Value:</label>
                  <input
                    type="number"
                    value={formData.max !== undefined ? formData.max : 100}
                    onChange={(e) => updateField('max', parseFloat(e.target.value) || 100)}
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
                {formData.generatorType !== 'integer_range' && (
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Decimals:</label>
                    <input
                      type="number"
                      min={0}
                      max={6}
                      value={formData.decimals !== undefined ? formData.decimals : 2}
                      onChange={(e) => updateField('decimals', parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                )}
                {formData.generatorType === 'currency' && (
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1">Symbol:</label>
                    <input
                      type="text"
                      value={formData.currencySymbol || '$'}
                      onChange={(e) => updateField('currencySymbol', e.target.value)}
                      className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Date Range */}
            {formData.generatorType === 'date_range' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Start Date:</label>
                  <input
                    type="date"
                    value={formData.startDate || '2024-01-01'}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">End Date:</label>
                  <input
                    type="date"
                    value={formData.endDate || '2026-12-31'}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Format:</label>
                  <select
                    value={formData.dateFormat || 'YYYY-MM-DD'}
                    onChange={(e) => updateField('dateFormat', e.target.value as any)}
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                    <option value="YYYY-MM-DD HH:mm:ss">Datetime (24h)</option>
                    <option value="timestamp">Unix Timestamp</option>
                  </select>
                </div>
              </div>
            )}

            {/* Pattern Mask */}
            {formData.generatorType === 'pattern' && (
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Pattern Template (<span className="font-mono text-indigo-500">#</span>=Digit, <span className="font-mono text-indigo-500">?</span>=Letter, <span className="font-mono text-indigo-500">*</span>=Any):
                </label>
                <input
                  type="text"
                  placeholder="e.g. SKU-###-??? or VEND-????-##"
                  value={formData.patternTemplate || 'SKU-###-???'}
                  onChange={(e) => updateField('patternTemplate', e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            )}

            {/* Pick List */}
            {formData.generatorType === 'pick_list' && (
              <div className="space-y-2">
                <label className="block text-slate-600 dark:text-slate-400">
                  Allowed Values (comma-separated):
                </label>
                <textarea
                  rows={2}
                  value={pickListInput}
                  onChange={(e) => setPickListInput(e.target.value)}
                  placeholder="Active, Pending, Suspended, Inactive"
                  className="w-full p-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                />
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 dark:text-slate-400">Selection Mode:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="pickListMode"
                      value="random"
                      checked={formData.pickListMode !== 'sequential'}
                      onChange={() => updateField('pickListMode', 'random')}
                    />
                    Random
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="pickListMode"
                      value="sequential"
                      checked={formData.pickListMode === 'sequential'}
                      onChange={() => updateField('pickListMode', 'sequential')}
                    />
                    Sequential (Round-Robin)
                  </label>
                </div>
              </div>
            )}

            {/* Boolean options */}
            {formData.generatorType === 'boolean' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Boolean Format:</label>
                  <select
                    value={formData.booleanFormat || 'true/false'}
                    onChange={(e) => updateField('booleanFormat', e.target.value as any)}
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                  >
                    <option value="true/false">true / false</option>
                    <option value="TRUE/FALSE">TRUE / FALSE</option>
                    <option value="1/0">1 / 0</option>
                    <option value="yes/no">yes / no</option>
                    <option value="Y/N">Y / N</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    True Probability: {formData.trueProbability !== undefined ? formData.trueProbability : 50}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={formData.trueProbability !== undefined ? formData.trueProbability : 50}
                    onChange={(e) => updateField('trueProbability', parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            )}

            {/* Formula Expression */}
            {formData.generatorType === 'formula' && (
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  JavaScript Expression (<span className="font-mono text-indigo-500">row</span> object provides other column values):
                </label>
                <input
                  type="text"
                  placeholder="e.g. `${row.first_name.toLowerCase()}.${row.last_name.toLowerCase()}@domain.com`"
                  value={formData.formulaExpr || ''}
                  onChange={(e) => updateField('formulaExpr', e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-indigo-600 dark:text-indigo-400"
                />
              </div>
            )}

            {/* Email Domain */}
            {formData.generatorType === 'email' && (
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Email Domain:</label>
                <input
                  type="text"
                  placeholder="example.com or techcorp.io"
                  value={formData.emailDomain || 'example.com'}
                  onChange={(e) => updateField('emailDomain', e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            )}

            {/* Fixed Text */}
            {formData.generatorType === 'fixed' && (
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Constant String:</label>
                <input
                  type="text"
                  value={formData.fixedText || ''}
                  onChange={(e) => updateField('fixedText', e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            )}
          </div>

          {/* Constraints & Transformations Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Constraints, Nullability & Formatting</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Unique Constraint */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.unique)}
                  onChange={(e) => updateField('unique', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Enforce Unique Values</span>
                  <p className="text-[10px] text-slate-500">Prevent duplicate values across generated rows</p>
                </div>
              </label>

              {/* Nullable Constraint */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.nullable)}
                  onChange={(e) => updateField('nullable', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Allow Empty / Null Values</span>
                  <p className="text-[10px] text-slate-500">Randomly emit blank/null cells</p>
                </div>
              </label>
            </div>

            {formData.nullable && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">
                    Null Rate: {formData.nullProbability !== undefined ? formData.nullProbability : 10}%
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={formData.nullProbability !== undefined ? formData.nullProbability : 10}
                    onChange={(e) => updateField('nullProbability', parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1">Null Representation:</label>
                  <select
                    value={formData.nullValueRepresentation || ''}
                    onChange={(e) => updateField('nullValueRepresentation', e.target.value)}
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                  >
                    <option value="">Blank (Empty String)</option>
                    <option value="NULL">NULL</option>
                    <option value="N/A">N/A</option>
                    <option value="-">-</option>
                  </select>
                </div>
              </div>
            )}

            {/* Prefix & Suffix & Case Transform */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Prefix:</label>
                <input
                  type="text"
                  placeholder="e.g. EMP-"
                  value={formData.prefix || ''}
                  onChange={(e) => updateField('prefix', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Suffix:</label>
                <input
                  type="text"
                  placeholder="e.g. _USD"
                  value={formData.suffix || ''}
                  onChange={(e) => updateField('suffix', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Transform Case:</label>
                <select
                  value={formData.transformCase || 'none'}
                  onChange={(e) => updateField('transformCase', e.target.value as any)}
                  className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                >
                  <option value="none">Original Case</option>
                  <option value="uppercase">UPPERCASE</option>
                  <option value="lowercase">lowercase</option>
                  <option value="titlecase">Title Case</option>
                  <option value="camelcase">camelCase</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Samples Preview */}
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60">
            <span className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 mb-2">
              <Eye className="w-3.5 h-3.5" />
              <span>Live Sample Output Preview (5 Rows):</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleValues.map((val, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 font-mono text-[11px]"
                >
                  {val === '' ? '<blank>' : String(val)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Apply Rule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
