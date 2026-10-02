import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Layers, Table, FileSpreadsheet } from 'lucide-react';
import {
  generateTypeScriptTypes,
  jsonToYaml,
  jsonToCsv,
  flattenJson,
} from '../../../utils/jsonEditorUtils';

interface JsonConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: any;
}

type ConvertTab = 'typescript' | 'yaml' | 'csv' | 'flattened';

export const JsonConvertModal: React.FC<JsonConvertModalProps> = ({
  isOpen,
  onClose,
  jsonData,
}) => {
  const [activeTab, setActiveTab] = useState<ConvertTab>('typescript');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  let convertedContent = '';
  let fileExtension = 'txt';
  let mimeType = 'text/plain';

  switch (activeTab) {
    case 'typescript':
      convertedContent = generateTypeScriptTypes(jsonData, 'RootType');
      fileExtension = 'ts';
      mimeType = 'text/typescript';
      break;
    case 'yaml':
      convertedContent = jsonToYaml(jsonData);
      fileExtension = 'yaml';
      mimeType = 'text/yaml';
      break;
    case 'csv':
      convertedContent = jsonToCsv(jsonData);
      fileExtension = 'csv';
      mimeType = 'text/csv';
      break;
    case 'flattened':
      convertedContent = JSON.stringify(flattenJson(jsonData), null, 2);
      fileExtension = 'json';
      mimeType = 'application/json';
      break;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([convertedContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `json_export_${activeTab}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Export & Convert JSON
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate TypeScript types, YAML, CSV tabular data, or flattened dot-notation
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

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('typescript')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'typescript'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileCode className="w-4 h-4" /> TypeScript Interfaces
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('yaml')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'yaml'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" /> YAML
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'csv'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> CSV Format
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flattened')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'flattened'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Table className="w-4 h-4" /> Flattened (Dot Notation)
          </button>
        </div>

        {/* Content Viewer */}
        <div className="p-4 flex-1 flex flex-col min-h-[300px] overflow-hidden bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono">
              Generated {activeTab.toUpperCase()} Output
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .{fileExtension}</span>
              </button>
            </div>
          </div>

          <pre className="flex-1 p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-auto border border-slate-800 max-h-[440px]">
            {convertedContent || '/* No content available for conversion */'}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
