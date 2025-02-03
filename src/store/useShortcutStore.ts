import { create } from 'zustand';
import { 
  ShortcutStore, 
  Shortcut, 
  Application, 
  AddShortcutResult, 
  AddApplicationResult,
  UpdateResult,
  DeleteResult,
  StorageData 
} from '../types/shortcuts';
import { initialStore } from './defaultShortcuts';

const STORAGE_KEY = 'shorty_data';
const CURRENT_VERSION = 1;

interface ShortcutActions {
  // Core CRUD operations
  addShortcut: (shortcut: Omit<Shortcut, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AddShortcutResult>;
  updateShortcut: (id: string, shortcut: Partial<Shortcut>) => Promise<UpdateResult>;
  removeShortcut: (id: string) => Promise<DeleteResult>;
  
  // Application management
  addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => Promise<AddApplicationResult>;
  updateApplication: (id: string, application: Partial<Application>) => Promise<UpdateResult>;
  removeApplication: (id: string) => Promise<DeleteResult>;
  
  // Search and filter
  searchShortcuts: (query: string) => Shortcut[];
  toggleFavorite: (id: string) => Promise<UpdateResult>;
  
  // Storage operations
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const loadInitialState = (): ShortcutStore => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialStore;

    const data: StorageData = JSON.parse(stored);
    if (data.version !== CURRENT_VERSION) return initialStore;

    return {
      applications: data.applications,
      shortcuts: data.shortcuts,
    };
  } catch (error) {
    console.error('Failed to load state:', error);
    return initialStore;
  }
};

const useShortcutStore = create<ShortcutStore & ShortcutActions>((set, get) => ({
  ...loadInitialState(),

  addShortcut: async (shortcutData) => {
    try {
      const id = crypto.randomUUID();
      const now = Date.now();
      
      const shortcut: Shortcut = {
        ...shortcutData,
        id,
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
      };

      set((state) => ({
        shortcuts: {
          ...state.shortcuts,
          [id]: shortcut,
        },
      }));

      await get().saveToStorage();
      return { success: true, data: shortcut };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add shortcut' 
      };
    }
  },

  updateShortcut: async (id, shortcutData) => {
    try {
      const current = get().shortcuts[id];
      if (!current) {
        return { success: false, error: 'Shortcut not found' };
      }

      const updated: Shortcut = {
        ...current,
        ...shortcutData,
        updatedAt: Date.now(),
      };

      set((state) => ({
        shortcuts: {
          ...state.shortcuts,
          [id]: updated,
        },
      }));

      await get().saveToStorage();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update shortcut' 
      };
    }
  },

  removeShortcut: async (id) => {
    try {
      set((state) => {
        const { [id]: removed, ...shortcuts } = state.shortcuts;
        return { shortcuts };
      });

      await get().saveToStorage();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove shortcut' 
      };
    }
  },

  addApplication: async (applicationData) => {
    try {
      const id = crypto.randomUUID();
      const now = Date.now();
      
      const application: Application = {
        ...applicationData,
        id,
        createdAt: now,
        updatedAt: now,
      };

      set((state) => ({
        applications: {
          ...state.applications,
          [id]: application,
        },
      }));

      await get().saveToStorage();
      return { success: true, data: application };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add application' 
      };
    }
  },

  updateApplication: async (id, applicationData) => {
    try {
      const current = get().applications[id];
      if (!current) {
        return { success: false, error: 'Application not found' };
      }

      const updated: Application = {
        ...current,
        ...applicationData,
        updatedAt: Date.now(),
      };

      set((state) => ({
        applications: {
          ...state.applications,
          [id]: updated,
        },
      }));

      await get().saveToStorage();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update application' 
      };
    }
  },

  removeApplication: async (id) => {
    try {
      // Check if any shortcuts are using this application
      const shortcuts = Object.values(get().shortcuts);
      if (shortcuts.some(s => s.application === id)) {
        return { 
          success: false, 
          error: 'Cannot remove application while shortcuts are using it' 
        };
      }

      set((state) => {
        const { [id]: removed, ...applications } = state.applications;
        return { applications };
      });

      await get().saveToStorage();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove application' 
      };
    }
  },

  searchShortcuts: (query) => {
    const state = get();
    const searchLower = query.toLowerCase();
    
    return Object.values(state.shortcuts).filter((shortcut) => {
      const app = state.applications[shortcut.application];
      return (
        shortcut.name.toLowerCase().includes(searchLower) ||
        shortcut.description?.toLowerCase().includes(searchLower) ||
        shortcut.keys.toLowerCase().includes(searchLower) ||
        shortcut.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        app?.name.toLowerCase().includes(searchLower)
      );
    });
  },

  toggleFavorite: async (id) => {
    try {
      const current = get().shortcuts[id];
      if (!current) {
        return { success: false, error: 'Shortcut not found' };
      }

      const updated: Shortcut = {
        ...current,
        isFavorite: !current.isFavorite,
        updatedAt: Date.now(),
      };

      set((state) => ({
        shortcuts: {
          ...state.shortcuts,
          [id]: updated,
        },
      }));

      await get().saveToStorage();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to toggle favorite' 
      };
    }
  },

  loadFromStorage: async () => {
    const state = loadInitialState();
    set(state);
  },

  saveToStorage: async () => {
    const state = get();
    const data: StorageData = {
      applications: state.applications,
      shortcuts: state.shortcuts,
      version: CURRENT_VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
}));

export default useShortcutStore; 