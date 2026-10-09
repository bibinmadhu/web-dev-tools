import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Filter,
  Key,
  Database,
  Tag,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import {
  YamlObfuscatorMapping,
  YamlObfuscatorOptions,
} from '../../../utils/yamlObfuscator';

export interface YamlMappingManagerProps {
  mapping: YamlObfuscatorMapping | null;
  onUpdateMapping: (updated: YamlObfuscatorMapping) => void;
  onOpenConfigModal: (tab: 'export' | 'import') => void;
}

export const YamlMappingManager: React.FC<YamlMappingManagerProps> = ({
  mapping,
  onUpdateMapping,
  onOpenConfigModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'keys' | 'values' | 'anchors'>('all');

  // New mapping pair input
  const [newCategory, setNewCategory] = useState<'keys' | 'values' | 'anchors'>('keys');
  const [newOrig, setNewOrig] = useState<string>('');
  const [newObf, setNewObf] = useState<string>('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const keysList = useMemo(() => {
    if (!mapping?.keys) return [];
    return Object.entries(mapping.keys).map(([orig, obf]) => ({
      category: 'keys' as const,
      original: orig,
      obfuscated: obf,
    }));
  }, [mapping?.keys]);

  const valuesList = useMemo(() => {
    if (!mapping?.values) return [];
    return Object.entries(mapping.values).map(([orig, obf]) => ({
      category: 'values' as const,
      original: orig,
      obfuscated: obf,
    }));
  }, [mapping?.values]);

  const anchorsList = useMemo(() => {
    if (!mapping?.anchors) return [];
    return Object.entries(mapping.anchors).map(([orig, obf]) => ({
      category: 'anchors' as const,
      original: orig,
      obfuscated: obf,
    }));
  }, [mapping?.anchors]);

  const allItems = useMemo(() => {
    return [...keysList, ...valuesList, ...anchorsList];
  }, [keysList, valuesList, anchorsList]);

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (filterCategory !== 'all') {
      items = items.filter((i) => i.category === filterCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(
        (i) => i.original.toLowerCase().includes(q) || i.obfuscated.toLowerCase().includes(q)
      );
    }
    return items;
  }, [allItems, filterCategory, searchTerm]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  const handleAddCustomPair = () => {
    if (!newOrig.trim() || !newObf.trim() || !mapping) return;

    const updatedKeys = { ...mapping.keys };
    const updatedValues = { ...mapping.values };
    const updatedAnchors = { ...mapping.anchors };
    const updatedRevKeys = { ...mapping.reverseMapping.keys };
    const updatedRevValues = { ...mapping.reverseMapping.values };
    const updatedRevAnchors = { ...mapping.reverseMapping.anchors };

    const cleanOrig = newOrig.trim();
    const cleanObf = newObf.trim();

    if (newCategory === 'keys') {
      updatedKeys[cleanOrig] = cleanObf;
      updatedRevKeys[cleanObf] = cleanOrig;
    } else if (newCategory === 'values') {
      updatedValues[cleanOrig] = cleanObf;
      updatedRevValues[cleanObf] = cleanOrig;
    } else {
      updatedAnchors[cleanOrig] = cleanObf;
      updatedRevAnchors[cleanObf] = cleanOrig;
    }

    const updatedMapping: YamlObfuscatorMapping = {
      ...mapping,
      keys: updatedKeys,
      values: updatedValues,
      anchors: updatedAnchors,
      reverseMapping: {
        keys: updatedRevKeys,
        values: updatedRevValues,
        anchors: updatedRevAnchors,
      },
      stats: {
        keysCount: Object.keys(updatedKeys).length,
        valuesCount: Object.keys(updatedValues).length,
        anchorsCount: Object.keys(updatedAnchors).length,
        commentsCount: mapping.stats.commentsCount,
        totalReplacements:
          Object.keys(updatedKeys).length +
          Object.keys(updatedValues).length +
          Object.keys(updatedAnchors).length,
      },
    };

    onUpdateMapping(updatedMapping);
    setNewOrig('');
    setNewObf('');
  };

  const handleDeletePair = (category: 'keys' | 'values' | 'anchors', orig: string, obf: string) => {
    if (!mapping) return;

    const updatedKeys = { ...mapping.keys };
    const updatedValues = { ...mapping.values };
    const updatedAnchors = { ...mapping.anchors };
    const updatedRevKeys = { ...mapping.reverseMapping.keys };
    const updatedRevValues = { ...mapping.reverseMapping.values };
    const updatedRevAnchors = { ...mapping.reverseMapping.anchors };

    if (category === 'keys') {
      delete updatedKeys[orig];
      delete updatedRevKeys[obf];
    } else if (category === 'values') {
      delete updatedValues[orig];
      delete updatedRevValues[obf];
    } else {
      delete updatedAnchors[orig];
      delete updatedRevAnchors[obf];
    }

    const updatedMapping: YamlObfuscatorMapping = {
      ...mapping,
      keys: updatedKeys,
      values: updatedValues,
      anchors: updatedAnchors,
      reverseMapping: {
        keys: updatedRevKeys,
        values: updatedRevValues,
        anchors: updatedRevAnchors,
      },
      stats: {
        keysCount: Object.keys(updatedKeys).length,
        valuesCount: Object.keys(updatedValues).length,
        anchorsCount: Object.keys(updatedAnchors).length,
        commentsCount: mapping.stats.commentsCount,
        totalReplacements:
          Object.keys(updatedKeys).length +
          Object.keys(updatedValues).length +
          Object.keys(updatedAnchors).length,
      },
    };

    onUpdateMapping(updatedMapping);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-full text-slate-900 dark:text-slate-100">
      {/* HEADER & FILTER BAR */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 space-y-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-500" />
              Active Bi-Directional Mapping Dictionary
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {allItems.length} Total Tokens
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Review and manage original-to-obfuscated substitutions. All entries are losslessly reversible.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenConfigModal('export')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export Mappings JSON
            </button>
          </div>
        </div>

        {/* Filter and Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by original or obfuscated name..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded p-0.5 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                filterCategory === 'all'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({allItems.length})
            </button>
            <button
              onClick={() => setFilterCategory('keys')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                filterCategory === 'keys'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Keys ({keysList.length})
            </button>
            <button
              onClick={() => setFilterCategory('values')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                filterCategory === 'values'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Values ({valuesList.length})
            </button>
            <button
              onClick={() => setFilterCategory('anchors')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-medium ${
                filterCategory === 'anchors'
                  ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Anchors ({anchorsList.length})
            </button>
          </div>
        </div>
      </div>

      {/* ADD CUSTOM MAPPING FORM */}
      <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs shrink-0">
        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0">
          <Plus className="w-3.5 h-3.5 text-indigo-500" />
          Add Custom Pair:
        </span>

        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as any)}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
        >
          <option value="keys">Property Key</option>
          <option value="values">Sensitive Value</option>
          <option value="anchors">Anchor / Alias</option>
        </select>

        <input
          type="text"
          value={newOrig}
          onChange={(e) => setNewOrig(e.target.value)}
          placeholder="Original identifier (e.g. database_url)"
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono flex-1 min-w-[140px] focus:outline-none focus:border-indigo-500"
        />

        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

        <input
          type="text"
          value={newObf}
          onChange={(e) => setNewObf(e.target.value)}
          placeholder="Obfuscated alias (e.g. k_db_host)"
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono flex-1 min-w-[140px] focus:outline-none focus:border-indigo-500"
        />

        <button
          onClick={handleAddCustomPair}
          disabled={!newOrig.trim() || !newObf.trim() || !mapping}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Pair
        </button>
      </div>

      {/* MAPPINGS TABLE */}
      <div className="flex-1 overflow-auto">
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            {allItems.length === 0
              ? 'No mappings recorded yet. Run an obfuscation in the main editor or import a configuration.'
              : 'No mappings match your search criteria.'}
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2 px-3 w-24">Type</th>
                <th className="py-2 px-3">Original Identifier / Value</th>
                <th className="py-2 px-3 w-8 text-center">→</th>
                <th className="py-2 px-3">Obfuscated Alias</th>
                <th className="py-2 px-3 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {filteredItems.map((item, idx) => (
                <tr
                  key={`${item.category}-${item.original}-${idx}`}
                  className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                >
                  <td className="py-2 px-3 font-sans">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        item.category === 'keys'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                          : item.category === 'values'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                          : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
                      }`}
                    >
                      {item.category === 'keys' ? 'Key' : item.category === 'values' ? 'Value' : 'Anchor'}
                    </span>
                  </td>

                  <td className="py-2 px-3 text-slate-900 dark:text-slate-200 break-all">
                    {item.original}
                  </td>

                  <td className="py-2 px-3 text-center text-slate-400 font-sans">→</td>

                  <td className="py-2 px-3 text-indigo-600 dark:text-indigo-300 font-semibold break-all">
                    {item.obfuscated}
                  </td>

                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleCopy(item.obfuscated)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                        title="Copy alias"
                      >
                        {copiedToken === item.obfuscated ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeletePair(item.category, item.original, item.obfuscated)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                        title="Delete pair"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
