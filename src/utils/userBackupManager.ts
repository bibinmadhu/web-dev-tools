import { TOOLS_DATA } from '../data/toolsData';

export interface UserSettingsBackup {
  version: string;
  app: string;
  exportedAt: string;
  settings: {
    theme: 'dark' | 'light';
    activeCategory?: string;
    fullscreenPreferences?: Record<string, boolean>;
    customPreferences?: Record<string, unknown>;
  };
  favorites: string[];
  recentToolHistory: string[];
  toolStorageData?: Record<string, unknown>;
}

export interface ImportValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  parsedData?: UserSettingsBackup;
  summary?: {
    favoritesCount: number;
    validFavorites: string[];
    unknownFavorites: string[];
    recentsCount: number;
    validRecents: string[];
    theme?: 'dark' | 'light';
    exportedAt?: string;
  };
}

const KNOWN_FULLSCREEN_KEYS = [
  'devhub_fullscreen_java_dual',
  'devhub_fullscreen_java_single',
  'devhub_fullscreen_db_update',
  'devhub_fullscreen_db_select',
  'devhub_fullscreen_db_category_matcher',
  'devhub_fullscreen_db_query_builder',
  'devhub_fullscreen_data_grid',
  'devhub_fullscreen_data_set_matcher',
  'devhub_fullscreen_query_obfuscator',
  'devhub_fullscreen_python_obfuscator',
  'devhub_fullscreen_chess_converter',
  'devhub_fullscreen_db_insert',
];

const KNOWN_STORAGE_KEYS = [
  'devhub_db_update_saved_configs',
  'devhub_db_select_saved_configs',
  'devhub_db_insert_saved_options',
  'devhub_query_builder_saved_templates',
  'devhub_db_category_matcher_saved_configs',
  'devhub_sql_obfuscator_options',
  'devhub_sql_obfuscator_profiles',
  'devhub_java_project_profiles',
  'devflow_saved_invoice',
  'devflow_invoice_templates_list',
  'devhub_clipboard_history',
];

/**
 * Creates a complete structured backup object of current user settings, favorites, recents, and storage
 */
export function createUserBackup(params: {
  favorites: string[];
  recentToolIds: string[];
  darkMode: boolean;
  activeCategory?: string;
}): UserSettingsBackup {
  const fullscreenPrefs: Record<string, boolean> = {};
  const toolStorageSnapshot: Record<string, unknown> = {};

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    // Collect fullscreen preferences
    for (const key of KNOWN_FULLSCREEN_KEYS) {
      try {
        const val = localStorage.getItem(key);
        if (val !== null) {
          fullscreenPrefs[key] = val === 'true';
        }
      } catch {
        // ignore
      }
    }

    // Collect saved configs and templates
    for (const key of KNOWN_STORAGE_KEYS) {
      try {
        const val = localStorage.getItem(key);
        if (val !== null) {
          try {
            toolStorageSnapshot[key] = JSON.parse(val);
          } catch {
            toolStorageSnapshot[key] = val;
          }
        }
      } catch {
        // ignore
      }
    }
  }

  return {
    version: '1.0',
    app: 'DevFlow Pro / DevHub',
    exportedAt: new Date().toISOString(),
    settings: {
      theme: params.darkMode ? 'dark' : 'light',
      activeCategory: params.activeCategory,
      fullscreenPreferences: fullscreenPrefs,
    },
    favorites: [...params.favorites],
    recentToolHistory: [...params.recentToolIds],
    toolStorageData: toolStorageSnapshot,
  };
}

/**
 * Validates any JSON input string or object intended for restore
 */
export function validateUserBackupJson(
  rawJson: string | Record<string, unknown>,
  validToolIdsSet?: Set<string>
): ImportValidationResult {
  const validIds = validToolIdsSet || new Set(TOOLS_DATA.map((t) => t.id));

  let data: any;
  if (typeof rawJson === 'string') {
    const trimmed = rawJson.trim();
    if (!trimmed) {
      return { isValid: false, error: 'Backup JSON content is empty.' };
    }
    try {
      data = JSON.parse(trimmed);
    } catch (e: any) {
      return { isValid: false, error: `Invalid JSON syntax: ${e.message}` };
    }
  } else {
    data = rawJson;
  }

  if (typeof data !== 'object' || data === null) {
    return { isValid: false, error: 'Backup content must be a JSON object.' };
  }

  // Handle lenient/partial inputs:
  // e.g. user provided raw array of favorites ["json-beautifier", ...]
  if (Array.isArray(data)) {
    const validFavs = data.filter((id) => typeof id === 'string' && validIds.has(id));
    const unknownFavs = data.filter((id) => typeof id === 'string' && !validIds.has(id));
    const normalizedBackup: UserSettingsBackup = {
      version: '1.0',
      app: 'DevFlow Pro / DevHub',
      exportedAt: new Date().toISOString(),
      settings: { theme: 'dark' },
      favorites: validFavs,
      recentToolHistory: validFavs.slice(0, 5),
    };
    return {
      isValid: true,
      warning: 'Parsed simple favorites array into full backup structure.',
      parsedData: normalizedBackup,
      summary: {
        favoritesCount: validFavs.length,
        validFavorites: validFavs,
        unknownFavorites: unknownFavs,
        recentsCount: validFavs.slice(0, 5).length,
        validRecents: validFavs.slice(0, 5),
        theme: 'dark',
        exportedAt: normalizedBackup.exportedAt,
      },
    };
  }

  // Extract favorites
  const rawFavorites = Array.isArray(data.favorites) ? data.favorites : [];
  const validFavorites: string[] = [];
  const unknownFavorites: string[] = [];

  for (const item of rawFavorites) {
    if (typeof item === 'string') {
      if (validIds.has(item)) {
        validFavorites.push(item);
      } else {
        unknownFavorites.push(item);
      }
    }
  }

  // Extract recents
  const rawRecents = Array.isArray(data.recentToolHistory)
    ? data.recentToolHistory
    : Array.isArray(data.recents)
    ? data.recents
    : [];
  const validRecents: string[] = [];
  for (const item of rawRecents) {
    if (typeof item === 'string' && validIds.has(item) && !validRecents.includes(item)) {
      validRecents.push(item);
    }
  }

  // Extract theme
  let theme: 'dark' | 'light' | undefined;
  if (data.settings && (data.settings.theme === 'dark' || data.settings.theme === 'light')) {
    theme = data.settings.theme;
  } else if (data.theme === 'dark' || data.theme === 'light') {
    theme = data.theme;
  }

  const normalized: UserSettingsBackup = {
    version: data.version || '1.0',
    app: data.app || 'DevFlow Pro / DevHub',
    exportedAt: data.exportedAt || new Date().toISOString(),
    settings: {
      theme: theme || 'dark',
      activeCategory: data.settings?.activeCategory,
      fullscreenPreferences: data.settings?.fullscreenPreferences || {},
    },
    favorites: validFavorites,
    recentToolHistory: validRecents,
    toolStorageData: data.toolStorageData || {},
  };

  let warning: string | undefined;
  if (unknownFavorites.length > 0) {
    warning = `${unknownFavorites.length} unrecognized tool IDs in backup were ignored (${unknownFavorites.join(', ')}).`;
  }

  return {
    isValid: true,
    warning,
    parsedData: normalized,
    summary: {
      favoritesCount: validFavorites.length,
      validFavorites,
      unknownFavorites,
      recentsCount: validRecents.length,
      validRecents,
      theme,
      exportedAt: normalized.exportedAt,
    },
  };
}

/**
 * Applies a validated backup to localStorage and returns updated memory state
 */
export function applyUserBackup(params: {
  backup: UserSettingsBackup;
  mode: 'replace' | 'merge';
  currentFavorites: string[];
  currentRecents: string[];
}): {
  newFavorites: string[];
  newRecents: string[];
  newTheme: 'dark' | 'light';
  newCategory?: string;
  totalRestored: number;
} {
  const { backup, mode, currentFavorites, currentRecents } = params;

  let newFavorites: string[] = [];
  let newRecents: string[] = [];

  if (mode === 'replace') {
    newFavorites = [...backup.favorites];
    newRecents = [...backup.recentToolHistory];
  } else {
    // Merge: combine unique items preserving backup additions
    const favSet = new Set(currentFavorites);
    for (const f of backup.favorites) favSet.add(f);
    newFavorites = Array.from(favSet);

    const recentOrder = [...backup.recentToolHistory, ...currentRecents];
    newRecents = Array.from(new Set(recentOrder)).slice(0, 10);
  }

  const newTheme = backup.settings.theme || 'dark';
  const newCategory = backup.settings.activeCategory;

  // Persist to localStorage
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('devhub_favorites', JSON.stringify(newFavorites));
      localStorage.setItem('devhub_recents', JSON.stringify(newRecents));
      localStorage.setItem('devhub_theme', newTheme);

      // Restore fullscreen preferences
      if (backup.settings.fullscreenPreferences) {
        for (const [key, val] of Object.entries(backup.settings.fullscreenPreferences)) {
          localStorage.setItem(key, String(val));
        }
      }

      // Restore tool-specific saved configurations
      if (backup.toolStorageData) {
        for (const [key, val] of Object.entries(backup.toolStorageData)) {
          if (typeof val === 'string') {
            localStorage.setItem(key, val);
          } else {
            localStorage.setItem(key, JSON.stringify(val));
          }
        }
      }
    } catch (e) {
      console.error('Failed to write backup to localStorage', e);
    }
  }

  return {
    newFavorites,
    newRecents,
    newTheme,
    newCategory,
    totalRestored: newFavorites.length + newRecents.length,
  };
}

/**
 * Downloads backup JSON as a formatted file to client disk
 */
export function downloadUserBackupJson(backup: UserSettingsBackup, filename?: string) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const targetFilename = filename || `devhub_backup_${dateStr}.json`;
  const jsonContent = JSON.stringify(backup, null, 2);

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = targetFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
