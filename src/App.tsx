import React, { useState, useEffect, useMemo } from 'react';
import { TOOLS_DATA } from './data/toolsData';
import { DevTool, ToolCategory } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RecentlyUsed } from './components/RecentlyUsed';
import { ToolGrid } from './components/ToolGrid';
import { ToolModal } from './components/ToolModal';
import { SearchModal } from './components/SearchModal';
import { UnitTestModal } from './components/UnitTestModal';
import { SettingsModal } from './components/SettingsModal';
import { ClipboardManagerOverlay } from './components/ClipboardManagerOverlay';
import { runAllUnitTests } from './utils/tests';
import {
  initClipboardInterceptor,
  getClipboardHistory,
  CLIPBOARD_CHANGE_EVENT,
} from './utils/clipboardManager';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('formatters');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('devhub_favorites');
      return saved ? JSON.parse(saved) : ['json-beautifier', 'code-obfuscator', 'regex-tester'];
    } catch (e) {
      return ['json-beautifier', 'code-obfuscator', 'regex-tester'];
    }
  });

  const [recentToolIds, setRecentToolIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('devhub_recents');
      return saved ? JSON.parse(saved) : ['json-beautifier', 'base64-encoder', 'regex-tester'];
    } catch (e) {
      return ['json-beautifier', 'base64-encoder', 'regex-tester'];
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('devhub_theme');
      return saved ? saved === 'dark' : true;
    } catch (e) {
      return true;
    }
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClipboardOpen, setIsClipboardOpen] = useState(false);
  const [clipboardCount, setClipboardCount] = useState<number>(() => getClipboardHistory().length);
  const [activeModalTool, setActiveModalTool] = useState<DevTool | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize automatic clipboard interceptor across the application
  useEffect(() => {
    const cleanup = initClipboardInterceptor();
    const handleClipboardChange = () => {
      setClipboardCount(getClipboardHistory().length);
    };

    window.addEventListener(CLIPBOARD_CHANGE_EVENT, handleClipboardChange);
    window.addEventListener('storage', handleClipboardChange);

    return () => {
      cleanup();
      window.removeEventListener(CLIPBOARD_CHANGE_EVENT, handleClipboardChange);
      window.removeEventListener('storage', handleClipboardChange);
    };
  }, []);

  // Sync dark mode class with HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('devhub_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('devhub_theme', 'light');
    }
  }, [darkMode]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('devhub_favorites', JSON.stringify(favorites));
    } catch (e) {
      // ignore storage errors
    }
  }, [favorites]);

  // Persist recents
  useEffect(() => {
    try {
      localStorage.setItem('devhub_recents', JSON.stringify(recentToolIds));
    } catch (e) {
      // ignore storage errors
    }
  }, [recentToolIds]);

  // Command + K and Clipboard Manager keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'v')) ||
        (e.altKey && e.key.toLowerCase() === 'c')
      ) {
        e.preventDefault();
        setIsClipboardOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle favorite
  const handleToggleFavorite = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  // Open tool & update recently used
  const handleOpenTool = (tool: DevTool) => {
    setActiveModalTool(tool);
    setRecentToolIds((prev) => [tool.id, ...prev.filter((id) => id !== tool.id)].slice(0, 5));
  };

  const recentTools = recentToolIds
    .map((id) => TOOLS_DATA.find((t) => t.id === id))
    .filter(Boolean) as DevTool[];

  const filteredTools = TOOLS_DATA.filter((tool) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'favorites') return favorites.includes(tool.id);
    return tool.category === activeCategory;
  });

  const testSummary = useMemo(() => runAllUnitTests(), []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header
          onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          onOpenSearch={() => setIsSearchOpen(true)}
          favoritesCount={favorites.length}
          onSelectFavoritesCategory={() => setActiveCategory('favorites')}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onOpenTestRunner={() => setIsTestRunnerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenClipboard={() => setIsClipboardOpen(true)}
          clipboardCount={clipboardCount}
          testPassCount={testSummary.passed}
          testTotalCount={testSummary.total}
        />

        {/* Main Container */}
        <div className="flex max-w-[1600px] mx-auto min-h-[calc(100vh-6.5rem)]">
          {/* Sidebar */}
          <Sidebar
            activeCategory={activeCategory}
            onSelectCategory={(cat) => setActiveCategory(cat)}
            favoritesCount={favorites.length}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Content Body */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
            {/* Recently Used Chips */}
            <RecentlyUsed recentTools={recentTools} onSelectTool={handleOpenTool} />

            {/* Tool Cards Grid */}
            <ToolGrid
              tools={filteredTools}
              activeCategory={activeCategory}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onOpenTool={handleOpenTool}
            />
          </main>
        </div>
      </div>

      {/* Sleek Interface Status Footer */}
      <footer className="h-10 border-t border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SYSTEM STABLE</span>
        </div>
        <div className="hidden sm:block text-slate-400 dark:text-slate-500">DEVFLOW PRO // V2.4.0</div>
        <div>SCALABILITY READY</div>
      </footer>

      {/* Interactive Tool Playground Modal */}
      <ToolModal
        tool={activeModalTool}
        onClose={() => setActiveModalTool(null)}
        isFavorite={activeModalTool ? favorites.includes(activeModalTool.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Cmd + K Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tools={TOOLS_DATA}
        favorites={favorites}
        onOpenTool={handleOpenTool}
        onToggleFavorite={handleToggleFavorite}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Unit Test Runner Modal */}
      <UnitTestModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />

      {/* Settings, Backup & Restore Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        favorites={favorites}
        recentToolIds={recentToolIds}
        darkMode={darkMode}
        activeCategory={activeCategory}
        onUpdateFavorites={setFavorites}
        onUpdateRecentTools={setRecentToolIds}
        onUpdateDarkMode={setDarkMode}
        onUpdateCategory={setActiveCategory}
      />

      {/* Clipboard History Overlay (Persists Last 10 Snippets) */}
      <ClipboardManagerOverlay
        isOpen={isClipboardOpen}
        onClose={() => setIsClipboardOpen(false)}
        onOpenTool={handleOpenTool}
      />
    </div>
  );
}
