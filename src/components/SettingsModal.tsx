import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Settings,
  Download,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Star,
  Clock,
  Sun,
  Moon,
  Shield,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Trash2,
  Sparkles,
  RefreshCw,
  Sliders,
  FolderArchive
} from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';
import {
  createUserBackup,
  validateUserBackupJson,
  applyUserBackup,
  downloadUserBackupJson,
  UserSettingsBackup,
  ImportValidationResult
} from '../utils/userBackupManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  recentToolIds: string[];
  darkMode: boolean;
  activeCategory: string;
  onUpdateFavorites: (newFavorites: string[]) => void;
  onUpdateRecentTools: (newRecents: string[]) => void;
  onUpdateDarkMode: (isDark: boolean) => void;
  onUpdateCategory?: (category: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  favorites,
  recentToolIds,
  darkMode,
  activeCategory,
  onUpdateFavorites,
  onUpdateRecentTools,
  onUpdateDarkMode,
  onUpdateCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'general'>('export');

  // Export State
  const currentBackup: UserSettingsBackup = useMemo(() => {
    return createUserBackup({
      favorites,
      recentToolIds,
      darkMode,
      activeCategory,
    });
  }, [favorites, recentToolIds, darkMode, activeCategory]);

  const [copiedExport, setCopiedExport] = useState<boolean>(false);
  const [copiedImportSample, setCopiedImportSample] = useState<boolean>(false);

  // Import State
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importValidation, setImportValidation] = useState<ImportValidationResult | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [restoreSuccessMessage, setRestoreSuccessMessage] = useState<string | null>(null);

  // General Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Export Download
  const handleDownloadBackup = () => {
    downloadUserBackupJson(currentBackup);
  };

  // Handle Copy Export JSON
  const handleCopyExportJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentBackup, null, 2));
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  // Handle File Upload for Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      const valRes = validateUserBackupJson(content);
      setImportValidation(valRes);
      setRestoreSuccessMessage(null);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Validate user typed/pasted JSON
  const handleValidateInput = () => {
    const valRes = validateUserBackupJson(importJsonText);
    setImportValidation(valRes);
    setRestoreSuccessMessage(null);
  };

  // Apply Restore
  const handleApplyRestore = () => {
    if (!importValidation?.isValid || !importValidation.parsedData) return;

    const result = applyUserBackup({
      backup: importValidation.parsedData,
      mode: importMode,
      currentFavorites: favorites,
      currentRecents: recentToolIds,
    });

    onUpdateFavorites(result.newFavorites);
    onUpdateRecentTools(result.newRecents);
    onUpdateDarkMode(result.newTheme === 'dark');
    if (result.newCategory && onUpdateCategory) {
      onUpdateCategory(result.newCategory);
    }

    setRestoreSuccessMessage(
      `Successfully restored ${result.newFavorites.length} favorites and ${result.newRecents.length} recent tool entries in ${importMode} mode!`
    );

    setTimeout(() => {
      setRestoreSuccessMessage(null);
    }, 4000);
  };

  // Factory Reset
  const handleFactoryReset = () => {
    const defaultFavs = ['json-beautifier', 'code-obfuscator', 'regex-tester'];
    const defaultRecents = ['json-beautifier', 'base64-encoder', 'regex-tester'];

    onUpdateFavorites(defaultFavs);
    onUpdateRecentTools(defaultRecents);
    onUpdateDarkMode(true);

    try {
      localStorage.setItem('devhub_favorites', JSON.stringify(defaultFavs));
      localStorage.setItem('devhub_recents', JSON.stringify(defaultRecents));
      localStorage.setItem('devhub_theme', 'dark');
    } catch {
      // ignore
    }

    setShowResetConfirm(false);
    setActiveTab('export');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-50 w-full max-w-4xl bg-white dark:bg-[#1E293B] text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                Workspace Settings & Data Backup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Export and restore user preferences, favorites, and recent tool history via JSON
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Settings Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-2.5 rounded-t-lg flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1E293B]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
              {favorites.length} Favs
            </span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-3.5 py-2.5 rounded-t-lg flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1E293B]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import & Restore</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-2.5 rounded-t-lg flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#1E293B]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>General Preferences</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: EXPORT BACKUP */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              {/* Stat Cards Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Favorites</span>
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {favorites.length}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">Bookmarked tools</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Recent History</span>
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {recentToolIds.length}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">Recent session tools</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Theme</span>
                    {darkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize">
                    {darkMode ? 'Dark Mode' : 'Light Mode'}
                  </div>
                  <div className="text-[11px] text-slate-400">UI color scheme</div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Stored Configs</span>
                    <FolderArchive className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {Object.keys(currentBackup.toolStorageData || {}).length}
                  </div>
                  <div className="text-[11px] text-slate-400">Templates & Profiles</div>
                </div>
              </div>

              {/* JSON Code Preview Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-indigo-500" />
                  CURRENT BACKUP PAYLOAD (JSON)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyExportJson}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
                  >
                    {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedExport ? 'Copied JSON!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadBackup}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON File</span>
                  </button>
                </div>
              </div>

              {/* JSON Preview Content */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 overflow-hidden">
                <textarea
                  readOnly
                  value={JSON.stringify(currentBackup, null, 2)}
                  rows={10}
                  className="w-full font-mono text-xs text-indigo-300 bg-transparent focus:outline-none resize-none leading-relaxed select-all"
                />
              </div>

              {/* Active Favorites Badges Preview */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Included Favorites ({favorites.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {favorites.map((favId) => {
                    const tool = TOOLS_DATA.find((t) => t.id === favId);
                    return (
                      <span
                        key={favId}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium shadow-2xs"
                      >
                        <span className="text-amber-500">★</span>
                        <span>{tool ? tool.name : favId}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT & RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              {/* File Drop & Upload Bar */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Import Backup JSON File
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select a previously downloaded <code>devhub_backup_*.json</code> file to restore
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse File</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Paste JSON Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider">
                    OR PASTE BACKUP JSON DIRECTLY:
                  </span>
                  <button
                    onClick={handleValidateInput}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Validate & Parse
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-3">
                  <textarea
                    value={importJsonText}
                    onChange={(e) => {
                      setImportJsonText(e.target.value);
                      if (importValidation) setImportValidation(null);
                    }}
                    placeholder='Paste backup JSON content here (e.g. {"favorites": ["json-beautifier", "python-obfuscator"], ...})'
                    rows={6}
                    className="w-full font-mono text-xs text-slate-200 bg-transparent focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Validation Feedback Banner */}
              {importValidation && !importValidation.isValid && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>Validation Error: {importValidation.error}</span>
                </div>
              )}

              {importValidation?.warning && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>{importValidation.warning}</span>
                </div>
              )}

              {/* Valid Backup Summary Preview */}
              {importValidation?.isValid && importValidation.summary && (
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Backup Payload Validated:
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Exported: {new Date(importValidation.summary.exportedAt || '').toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Favorites Found</span>
                      <strong className="text-base text-slate-900 dark:text-slate-100 font-mono">
                        {importValidation.summary.favoritesCount}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Recent Tools</span>
                      <strong className="text-base text-slate-900 dark:text-slate-100 font-mono">
                        {importValidation.summary.recentsCount}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Target Theme</span>
                      <strong className="text-base text-slate-900 dark:text-slate-100 capitalize">
                        {importValidation.summary.theme || 'Dark'}
                      </strong>
                    </div>
                  </div>

                  {/* Badges of favorites to restore */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                      Tools to be added to Favorites:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {importValidation.summary.validFavorites.map((id) => {
                        const tool = TOOLS_DATA.find((t) => t.id === id);
                        return (
                          <span
                            key={id}
                            className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                          >
                            {tool ? tool.name : id}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mode & Execute Bar */}
                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Restore Mode:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-indigo-600"
                        />
                        <span>Replace (Overwrite)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="merge"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="text-indigo-600"
                        />
                        <span>Merge (Combine)</span>
                      </label>
                    </div>

                    <button
                      onClick={handleApplyRestore}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm & Restore Workspace</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Success Message Banner */}
              {restoreSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{restoreSuccessMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GENERAL SETTINGS & FACTORY RESET */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Theme Settings */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  Theme & Visual Appearance
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => onUpdateDarkMode(true)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      darkMode
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">Dark Theme</span>
                    </div>
                    {darkMode && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => onUpdateDarkMode(false)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      !darkMode
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">Light Theme</span>
                    </div>
                    {!darkMode && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                </div>
              </div>

              {/* Manage Favorites Fast Clear */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Manage Active Favorites ({favorites.length})
                  </h4>
                  {favorites.length > 0 && (
                    <button
                      onClick={() => onUpdateFavorites([])}
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      Clear All Favorites
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {favorites.map((favId) => {
                    const tool = TOOLS_DATA.find((t) => t.id === favId);
                    return (
                      <span
                        key={favId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs"
                      >
                        <span>{tool ? tool.name : favId}</span>
                        <button
                          onClick={() => onUpdateFavorites(favorites.filter((id) => id !== favId))}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Remove favorite"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  {favorites.length === 0 && (
                    <span className="text-xs text-slate-400">No favorite tools bookmarked.</span>
                  )}
                </div>
              </div>

              {/* Clear History & Reset Section */}
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 space-y-3">
                <h4 className="font-bold text-sm text-rose-900 dark:text-rose-300 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-500" />
                  History & Factory Reset
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Reset your workspace preferences or clear recent tool session history.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      onUpdateRecentTools([]);
                      try {
                        localStorage.removeItem('devhub_recents');
                      } catch {
                        // ignore
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-xs text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                  >
                    Clear Recent Tool History
                  </button>

                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Reset All to Factory Defaults
                  </button>
                </div>

                {/* Reset Confirmation Prompt */}
                {showResetConfirm && (
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 space-y-2 mt-2">
                    <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">
                      Are you sure you want to reset all favorites, recents, and settings to factory defaults?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleFactoryReset}
                        className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Yes, Reset Everything
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
