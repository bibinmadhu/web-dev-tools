import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Pencil,
  Check,
  X,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import { formatJsonPath } from '../../../utils/jsonEditorUtils';

export type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

interface JsonTreeNodeProps {
  nodeKey: string | number;
  value: any;
  path: (string | number)[];
  depth: number;
  isRoot?: boolean;
  expandedPaths: Set<string>;
  onToggleExpand: (pathStr: string) => void;
  onUpdateValue: (path: (string | number)[], newVal: any) => void;
  onRenameKey: (parentPath: (string | number)[], oldKey: string, newKey: string) => void;
  onDeleteNode: (path: (string | number)[]) => void;
  onDuplicateNode: (path: (string | number)[]) => void;
  onInsertChild: (targetPath: (string | number)[], keyOrIdx: string | number, value: any) => void;
  onSelectPath?: (path: (string | number)[]) => void;
  searchQuery?: string;
  isFilterActive?: boolean;
}

export const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({
  nodeKey,
  value,
  path,
  depth,
  isRoot = false,
  expandedPaths,
  onToggleExpand,
  onUpdateValue,
  onRenameKey,
  onDeleteNode,
  onDuplicateNode,
  onInsertChild,
  onSelectPath,
  searchQuery = '',
  isFilterActive = false,
}) => {
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [editingKeyText, setEditingKeyText] = useState(String(nodeKey));
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editingValueText, setEditingValueText] = useState(
    value === null ? 'null' : typeof value === 'object' ? '' : String(value)
  );
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildKey, setNewChildKey] = useState('');
  const [newChildType, setNewChildType] = useState<JsonValueType>('string');
  const [newChildValue, setNewChildValue] = useState('');

  const pathStr = path.join('.');
  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isContainer = isObject || isArray;
  const isExpanded = expandedPaths.has(pathStr);

  const getNodeType = (v: any): JsonValueType => {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    const t = typeof v;
    if (t === 'string') return 'string';
    if (t === 'number') return 'number';
    if (t === 'boolean') return 'boolean';
    return 'object';
  };

  const currentType = getNodeType(value);

  // Search match evaluation
  const searchLower = searchQuery.toLowerCase().trim();
  const keyMatches = searchLower ? String(nodeKey).toLowerCase().includes(searchLower) : false;
  const valueMatches =
    searchLower && !isContainer && value !== null && value !== undefined
      ? String(value).toLowerCase().includes(searchLower)
      : false;
  const hasDirectMatch = keyMatches || valueMatches;

  // Filter check for recursive containers
  const containsMatchingDescendant = (node: any): boolean => {
    if (!searchLower) return true;
    if (node === null || node === undefined) return false;
    if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
      return String(node).toLowerCase().includes(searchLower);
    }
    if (Array.isArray(node)) {
      return node.some((child) => containsMatchingDescendant(child));
    }
    if (typeof node === 'object') {
      for (const k of Object.keys(node)) {
        if (k.toLowerCase().includes(searchLower)) return true;
        if (containsMatchingDescendant(node[k])) return true;
      }
    }
    return false;
  };

  if (isFilterActive && searchLower && !hasDirectMatch && !containsMatchingDescendant(value)) {
    return null;
  }

  // Type change converter
  const handleTypeChange = (newType: JsonValueType) => {
    if (newType === currentType) return;
    let converted: any = '';
    switch (newType) {
      case 'string':
        converted = value === null ? '' : String(value);
        break;
      case 'number':
        converted = Number(value) || 0;
        break;
      case 'boolean':
        converted = Boolean(value);
        break;
      case 'null':
        converted = null;
        break;
      case 'object':
        converted = {};
        break;
      case 'array':
        converted = [];
        break;
    }
    onUpdateValue(path, converted);
  };

  const handleSaveKeyEdit = () => {
    const trimmed = editingKeyText.trim();
    if (trimmed && trimmed !== String(nodeKey)) {
      const parentPath = path.slice(0, -1);
      onRenameKey(parentPath, String(nodeKey), trimmed);
    }
    setIsEditingKey(false);
  };

  const handleSaveValueEdit = () => {
    let newVal: any = editingValueText;
    if (currentType === 'number') {
      const parsed = Number(editingValueText);
      newVal = isNaN(parsed) ? 0 : parsed;
    } else if (currentType === 'boolean') {
      newVal = editingValueText.toLowerCase() === 'true';
    } else if (currentType === 'null') {
      newVal = null;
    }
    onUpdateValue(path, newVal);
    setIsEditingValue(false);
  };

  const handleAddChildSubmit = () => {
    let childVal: any = '';
    switch (newChildType) {
      case 'string':
        childVal = newChildValue || 'new value';
        break;
      case 'number':
        childVal = Number(newChildValue) || 0;
        break;
      case 'boolean':
        childVal = newChildValue === 'true';
        break;
      case 'null':
        childVal = null;
        break;
      case 'object':
        childVal = {};
        break;
      case 'array':
        childVal = [];
        break;
    }

    if (isArray) {
      onInsertChild(path, (value as any[]).length, childVal);
    } else if (isObject) {
      let keyToAdd = newChildKey.trim();
      if (!keyToAdd) {
        keyToAdd = `newKey_${Object.keys(value).length + 1}`;
      }
      onInsertChild(path, keyToAdd, childVal);
    }

    // Reset adding state
    setIsAddingChild(false);
    setNewChildKey('');
    setNewChildValue('');
    if (!isExpanded) {
      onToggleExpand(pathStr);
    }
  };

  const renderValueBadge = () => {
    if (isObject) {
      const count = Object.keys(value).length;
      return (
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
          {`{ ${count} ${count === 1 ? 'key' : 'keys'} }`}
        </span>
      );
    }
    if (isArray) {
      const count = value.length;
      return (
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
          {`[ ${count} ${count === 1 ? 'item' : 'items'} ]`}
        </span>
      );
    }
    return null;
  };

  const childEntries = isObject
    ? Object.keys(value).map((k) => ({ key: k, val: value[k] }))
    : isArray
    ? (value as any[]).map((val, idx) => ({ key: idx, val }))
    : [];

  return (
    <div className="font-mono text-xs select-none">
      {/* Node Row Header */}
      <div
        className={`group flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors ${
          hasDirectMatch ? 'bg-amber-100/60 dark:bg-amber-950/40 border-l-2 border-amber-500' : ''
        }`}
        style={{ paddingLeft: `${Math.max(4, depth * 16)}px` }}
        onClick={() => onSelectPath?.(path)}
      >
        {/* Expand / Collapse Icon for Container */}
        {isContainer ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(pathStr);
            }}
            className="p-0.5 rounded text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-3.5 text-center text-slate-300 dark:text-slate-600">•</span>
        )}

        {/* Node Key or Index */}
        {!isRoot && (
          <div className="flex items-center gap-1">
            {isEditingKey ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  autoFocus
                  value={editingKeyText}
                  onChange={(e) => setEditingKeyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveKeyEdit();
                    if (e.key === 'Escape') setIsEditingKey(false);
                  }}
                  className="px-1.5 py-0.5 rounded text-xs bg-white dark:bg-slate-900 border border-indigo-400 text-indigo-600 dark:text-indigo-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveKeyEdit}
                  className="p-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingKey(false)}
                  className="p-0.5 rounded bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (typeof nodeKey === 'string') {
                    setEditingKeyText(String(nodeKey));
                    setIsEditingKey(true);
                  }
                }}
                className={`font-semibold cursor-pointer ${
                  typeof nodeKey === 'number'
                    ? 'text-slate-400 dark:text-slate-500'
                    : 'text-indigo-600 dark:text-indigo-400 hover:underline'
                } ${keyMatches ? 'bg-amber-300 dark:bg-amber-800 text-slate-900 dark:text-amber-100 px-0.5 rounded' : ''}`}
                title={typeof nodeKey === 'string' ? 'Double-click to rename key' : `Index ${nodeKey}`}
              >
                {typeof nodeKey === 'number' ? `[${nodeKey}]` : `"${nodeKey}"`}
              </span>
            )}
            <span className="text-slate-400 dark:text-slate-500">:</span>
          </div>
        )}

        {/* Node Value or Container Tag */}
        {isContainer ? (
          renderValueBadge()
        ) : (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isEditingValue ? (
              <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                {currentType === 'boolean' ? (
                  <select
                    value={editingValueText}
                    onChange={(e) => setEditingValueText(e.target.value)}
                    className="px-1.5 py-0.5 rounded text-xs bg-white dark:bg-slate-900 border border-emerald-400 text-emerald-600 dark:text-emerald-400 focus:outline-none"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <input
                    type={currentType === 'number' ? 'number' : 'text'}
                    autoFocus
                    value={editingValueText}
                    onChange={(e) => setEditingValueText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveValueEdit();
                      if (e.key === 'Escape') setIsEditingValue(false);
                    }}
                    className="px-1.5 py-0.5 rounded text-xs bg-white dark:bg-slate-900 border border-emerald-400 text-emerald-600 dark:text-emerald-400 focus:outline-none flex-1 max-w-[280px]"
                  />
                )}
                <button
                  type="button"
                  onClick={handleSaveValueEdit}
                  className="p-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingValue(false)}
                  className="p-0.5 rounded bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingValueText(value === null ? 'null' : String(value));
                  setIsEditingValue(true);
                }}
                className={`cursor-pointer hover:underline truncate max-w-[340px] ${
                  currentType === 'string'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : currentType === 'number'
                    ? 'text-amber-600 dark:text-amber-400'
                    : currentType === 'boolean'
                    ? 'text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-slate-400 italic'
                } ${valueMatches ? 'bg-amber-300 dark:bg-amber-800 text-slate-900 dark:text-amber-100 px-0.5 rounded' : ''}`}
                title="Double click to edit value"
              >
                {currentType === 'string'
                  ? `"${value}"`
                  : currentType === 'null'
                  ? 'null'
                  : String(value)}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons (Visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto pl-2">
          {/* Change Type Dropdown */}
          <select
            value={currentType}
            onChange={(e) => handleTypeChange(e.target.value as JsonValueType)}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] py-0.5 px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none"
            title="Change data type"
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="null">null</option>
            <option value="object">object</option>
            <option value="array">array</option>
          </select>

          {/* Add Child Button (if Object or Array) */}
          {isContainer && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingChild(!isAddingChild);
              }}
              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title={isArray ? 'Append item to array' : 'Add property to object'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Edit value button for primitives */}
          {!isContainer && !isEditingValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditingValueText(value === null ? 'null' : String(value));
                setIsEditingValue(true);
              }}
              className="p-1 rounded text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Edit value"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}

          {/* Duplicate Button (non-root) */}
          {!isRoot && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateNode(path);
              }}
              className="p-1 rounded text-slate-400 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Duplicate node"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}

          {/* Delete Button (non-root) */}
          {!isRoot && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNode(path);
              }}
              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete node"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Add Child Form */}
      {isAddingChild && (
        <div
          className="flex flex-wrap items-center gap-2 p-2 my-1 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800"
          style={{ marginLeft: `${Math.max(8, (depth + 1) * 16)}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            {isArray ? `Add Item [${(value as any[]).length}]` : 'Add Property'}:
          </span>

          {/* If Object, require key input */}
          {isObject && (
            <input
              type="text"
              placeholder="property_name"
              value={newChildKey}
              onChange={(e) => setNewChildKey(e.target.value)}
              className="px-2 py-1 rounded text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          )}

          {/* Value Type Selection */}
          <select
            value={newChildType}
            onChange={(e) => setNewChildType(e.target.value as JsonValueType)}
            className="px-2 py-1 rounded text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="null">Null</option>
            <option value="object">Object {"{}"}</option>
            <option value="array">Array {"[]"}</option>
          </select>

          {/* Initial value input for primitives */}
          {['string', 'number', 'boolean'].includes(newChildType) && (
            newChildType === 'boolean' ? (
              <select
                value={newChildValue}
                onChange={(e) => setNewChildValue(e.target.value)}
                className="px-2 py-1 rounded text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <input
                type={newChildType === 'number' ? 'number' : 'text'}
                placeholder="value"
                value={newChildValue}
                onChange={(e) => setNewChildValue(e.target.value)}
                className="px-2 py-1 rounded text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            )
          )}

          <button
            type="button"
            onClick={handleAddChildSubmit}
            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
          <button
            type="button"
            onClick={() => setIsAddingChild(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Render Nested Children if Container and Expanded */}
      {isContainer && isExpanded && (
        <div className="border-l border-slate-200 dark:border-slate-800 ml-3">
          {childEntries.map(({ key, val }) => (
            <JsonTreeNode
              key={String(key)}
              nodeKey={key}
              value={val}
              path={[...path, key]}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              onToggleExpand={onToggleExpand}
              onUpdateValue={onUpdateValue}
              onRenameKey={onRenameKey}
              onDeleteNode={onDeleteNode}
              onDuplicateNode={onDuplicateNode}
              onInsertChild={onInsertChild}
              onSelectPath={onSelectPath}
              searchQuery={searchQuery}
              isFilterActive={isFilterActive}
            />
          ))}
        </div>
      )}
    </div>
  );
};
