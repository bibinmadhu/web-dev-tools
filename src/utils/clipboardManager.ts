/**
 * DevHub Clipboard Manager Utility
 * 
 * Persists and manages the last 10 copied strings or code snippets within the application,
 * providing type detection, deduplication, localStorage persistence, and quick retrieval.
 */

export type SnippetType =
  | 'json'
  | 'sql'
  | 'python'
  | 'java'
  | 'javascript'
  | 'html'
  | 'css'
  | 'yaml'
  | 'url'
  | 'curl'
  | 'jwt'
  | 'base64'
  | 'uuid'
  | 'text';

export interface ClipboardItem {
  id: string;
  text: string;
  timestamp: number;
  characterCount: number;
  lineCount: number;
  byteSize: number;
  detectedType: SnippetType;
  preview: string;
  source?: string;
  pinned?: boolean;
}

export const MAX_CLIPBOARD_ITEMS = 10;
export const CLIPBOARD_STORAGE_KEY = 'devhub_clipboard_history';
export const CLIPBOARD_CHANGE_EVENT = 'devhub_clipboard_change';

/**
 * Heuristically detects the content type of a copied snippet
 */
export function detectSnippetType(rawText: string): SnippetType {
  const text = rawText.trim();
  if (!text) return 'text';

  // 1. UUID test (exact)
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(text)) {
    return 'uuid';
  }

  // 2. JWT token test
  if (/^eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/.test(text)) {
    return 'jwt';
  }

  // 3. URL test
  if (/^(https?|ftp|file|ws|wss):\/\/[^\s/$.?#].[^\s]*$/i.test(text)) {
    return 'url';
  }

  // 4. cURL test
  if (/^(curl|curl\.exe)\s+/i.test(text)) {
    return 'curl';
  }

  // 5. JSON test
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
    try {
      JSON.parse(text);
      return 'json';
    } catch {
      // Not strictly valid JSON, but could still be loose JSON
      if (/^\{[\s\S]*"[a-zA-Z0-9_]+"\s*:[\s\S]*\}$/.test(text)) {
        return 'json';
      }
    }
  }

  // 6. SQL test
  if (
    /^\s*(SELECT|INSERT\s+INTO|UPDATE\s+\w+|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|WITH\s+\w+\s+AS)\b/i.test(text) ||
    /\b(FROM\s+\w+|WHERE\s+\w+|GROUP\s+BY|ORDER\s+BY|INNER\s+JOIN|LEFT\s+JOIN)\b/i.test(text)
  ) {
    return 'sql';
  }

  // 7. HTML / XML / SVG test
  if (/^\s*<(?:!DOCTYPE\s+html|html|div|span|p|a|ul|ol|li|table|h[1-6]|form|script|style|svg|xml)[\s>]/i.test(text)) {
    return 'html';
  }

  // 8. Python test
  if (
    /^\s*(def\s+\w+\s*\(|class\s+\w+.*:|import\s+\w+|from\s+\w+\s+import|elif\s+|if\s+__name__\s*==\s*['"]__main__['"])/m.test(text) ||
    /:\s*$\s+(?:print|return|pass|yield|raise)\b/m.test(text)
  ) {
    return 'python';
  }

  // 9. Java test
  if (
    /\b(public|private|protected)\s+(class|interface|enum|void|int|String|boolean)\b/.test(text) ||
    /System\.out\.println\s*\(/.test(text) ||
    /@Override\b/.test(text)
  ) {
    return 'java';
  }

  // 10. YAML test
  if (/^---\s*$/.test(text) || (/^[a-zA-Z0-9_-]+\s*:\s*.+$/m.test(text) && !text.includes(';') && !text.includes('{'))) {
    return 'yaml';
  }

  // 11. CSS test
  if (/^[.#]?[a-zA-Z0-9_-]+\s*\{[^}]*:[^}]*\}/m.test(text)) {
    return 'css';
  }

  // 12. JavaScript / TypeScript test
  if (
    /\b(const|let|var|function|async|await|console\.log|export\s+default|export\s+const|import\s+.*from)\b/.test(text) ||
    /=>\s*\{/.test(text)
  ) {
    return 'javascript';
  }

  // 13. Base64 test (string of reasonable length without whitespace that decodes)
  if (/^[A-Za-z0-9+/]{32,}={0,2}$/.test(text)) {
    return 'base64';
  }

  return 'text';
}

/**
 * Creates a clean 1-line preview for a snippet
 */
export function generateSnippetPreview(text: string, maxLength = 90): string {
  const firstLine = text.trim().split('\n')[0] || '';
  const collapsed = firstLine.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= maxLength) return collapsed;
  return collapsed.slice(0, maxLength - 3) + '...';
}

/**
 * Generates a unique ID
 */
export function generateSnippetId(): string {
  return 'clip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
}

/**
 * In-memory fallback if localStorage is unavailable
 */
let inMemoryHistory: ClipboardItem[] = [];

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {
    // ignore security / storage restrictions
  }
  return null;
}

/**
 * Retrieves the current persisted clipboard history (up to MAX_CLIPBOARD_ITEMS)
 */
export function getClipboardHistory(): ClipboardItem[] {
  const storage = getStorage();
  if (!storage) {
    return inMemoryHistory.slice(0, MAX_CLIPBOARD_ITEMS);
  }
  try {
    const raw = storage.getItem(CLIPBOARD_STORAGE_KEY);
    if (!raw) return inMemoryHistory.slice(0, MAX_CLIPBOARD_ITEMS);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return inMemoryHistory.slice(0, MAX_CLIPBOARD_ITEMS);
    return parsed.slice(0, MAX_CLIPBOARD_ITEMS);
  } catch {
    return inMemoryHistory.slice(0, MAX_CLIPBOARD_ITEMS);
  }
}

/**
 * Saves clipboard items to localStorage and dispatches change event
 */
function persistAndNotify(items: ClipboardItem[]): ClipboardItem[] {
  const capped = items.slice(0, MAX_CLIPBOARD_ITEMS);
  inMemoryHistory = capped;
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(capped));
    } catch {
      // ignore quota errors
    }
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(CLIPBOARD_CHANGE_EVENT, { detail: capped }));
    } catch {
      // ignore event errors
    }
  }
  return capped;
}

/**
 * Adds a new string or code snippet to the clipboard history.
 * - Deduplicates: If the exact text already exists, moves it to the front and refreshes timestamp.
 * - Enforces the last 10 items limit.
 */
export function addClipboardItem(rawText: string, source?: string): ClipboardItem[] {
  if (!rawText || rawText.trim().length === 0) {
    return getClipboardHistory();
  }

  const current = getClipboardHistory();
  const trimmed = rawText;

  // Check if identical text already exists
  const existingIndex = current.findIndex((item) => item.text === trimmed);
  let isPinned = false;
  let existingId: string | undefined;

  if (existingIndex !== -1) {
    isPinned = current[existingIndex].pinned || false;
    existingId = current[existingIndex].id;
    current.splice(existingIndex, 1);
  }

  const lines = trimmed.split('\n');
  const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  const byteSize = encoder ? encoder.encode(trimmed).length : trimmed.length;

  const newItem: ClipboardItem = {
    id: existingId || generateSnippetId(),
    text: trimmed,
    timestamp: Date.now(),
    characterCount: trimmed.length,
    lineCount: lines.length,
    byteSize,
    detectedType: detectSnippetType(trimmed),
    preview: generateSnippetPreview(trimmed),
    source: source || 'Application Copy',
    pinned: isPinned,
  };

  const updated = [newItem, ...current];
  return persistAndNotify(updated);
}

/**
 * Removes a specific snippet by ID
 */
export function removeClipboardItem(id: string): ClipboardItem[] {
  const current = getClipboardHistory();
  const filtered = current.filter((item) => item.id !== id);
  return persistAndNotify(filtered);
}

/**
 * Toggles the pinned status of a snippet
 */
export function togglePinClipboardItem(id: string): ClipboardItem[] {
  const current = getClipboardHistory();
  const updated = current.map((item) =>
    item.id === id ? { ...item, pinned: !item.pinned } : item
  );
  return persistAndNotify(updated);
}

/**
 * Clears all clipboard history (unpinned only if keepPinned=true, or all if keepPinned=false)
 */
export function clearClipboardHistory(keepPinned = false): ClipboardItem[] {
  if (keepPinned) {
    const current = getClipboardHistory();
    const pinnedOnly = current.filter((item) => item.pinned);
    return persistAndNotify(pinnedOnly);
  }
  return persistAndNotify([]);
}

/**
 * Formats relative time (e.g., "Just now", "2m ago", "1h ago")
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
}

/**
 * Formats byte size into human readable string
 */
export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Exports current clipboard history as a formatted JSON string
 */
export function exportClipboardHistoryJson(): string {
  const items = getClipboardHistory();
  return JSON.stringify(
    {
      app: 'DevHub',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      itemCount: items.length,
      history: items,
    },
    null,
    2
  );
}

/**
 * Imports clipboard history from JSON string
 */
export function importClipboardHistoryJson(rawJson: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(rawJson);
    const items = Array.isArray(parsed) ? parsed : parsed.history;
    if (!Array.isArray(items)) {
      return { success: false, count: 0, error: 'Expected an array of clipboard items or a valid DevHub backup.' };
    }

    const current = getClipboardHistory();
    const existingTexts = new Set(current.map((item) => item.text));

    let importedCount = 0;
    const newItems: ClipboardItem[] = [];

    for (const raw of items) {
      if (typeof raw?.text === 'string' && raw.text.trim()) {
        if (!existingTexts.has(raw.text)) {
          existingTexts.add(raw.text);
          newItems.push({
            id: generateSnippetId(),
            text: raw.text,
            timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : Date.now(),
            characterCount: raw.text.length,
            lineCount: raw.text.split('\n').length,
            byteSize: raw.text.length,
            detectedType: detectSnippetType(raw.text),
            preview: generateSnippetPreview(raw.text),
            source: raw.source || 'Imported Snippet',
            pinned: Boolean(raw.pinned),
          });
          importedCount++;
        }
      }
    }

    const merged = [...newItems, ...current].slice(0, MAX_CLIPBOARD_ITEMS);
    persistAndNotify(merged);
    return { success: true, count: importedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Invalid JSON format' };
  }
}

/**
 * Global interceptor that automatically registers any copy actions across the app
 */
let interceptorInstalled = false;

export function initClipboardInterceptor(): () => void {
  if (typeof window === 'undefined' || interceptorInstalled) {
    return () => {};
  }

  interceptorInstalled = true;

  // 1. Monkey-patch navigator.clipboard.writeText so any button in any tool automatically adds to history
  let originalWriteText: ((text: string) => Promise<void>) | null = null;
  if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
    originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = async (text: string) => {
      try {
        if (text && text.trim().length > 0) {
          addClipboardItem(text);
        }
      } catch {
        // ignore errors
      }
      return originalWriteText ? originalWriteText(text) : Promise.resolve();
    };
  }

  // 2. Global copy event listener for keyboard copy (Cmd+C / Ctrl+C or browser menu)
  const handleCopyEvent = () => {
    // Delay slightly to let the copy event finish and text to be populated
    setTimeout(() => {
      try {
        const selection = window.getSelection()?.toString();
        if (selection && selection.trim().length > 0) {
          addClipboardItem(selection, 'Document Selection');
        }
      } catch {
        // ignore errors
      }
    }, 40);
  };

  document.addEventListener('copy', handleCopyEvent);

  // Return cleanup function
  return () => {
    document.removeEventListener('copy', handleCopyEvent);
    if (originalWriteText && navigator?.clipboard) {
      navigator.clipboard.writeText = originalWriteText;
    }
    interceptorInstalled = false;
  };
}
