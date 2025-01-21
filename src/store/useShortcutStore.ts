import { create } from 'zustand';
import { ShortcutStore, Shortcut, Application } from '../types/shortcuts';
import { initialStore } from './defaultShortcuts';

interface ShortcutActions {
  addShortcut: (shortcut: Shortcut) => void;
  removeShortcut: (id: string) => void;
  addApplication: (application: Application) => void;
  searchShortcuts: (query: string) => Shortcut[];
}

const useShortcutStore = create<ShortcutStore & ShortcutActions>((set, get) => ({
  ...initialStore,

  addShortcut: (shortcut) => {
    set((state) => ({
      shortcuts: {
        ...state.shortcuts,
        [shortcut.id]: shortcut,
      },
    }));
  },

  removeShortcut: (id) => {
    set((state) => {
      const { [id]: removed, ...shortcuts } = state.shortcuts;
      return { shortcuts };
    });
  },

  addApplication: (application) => {
    set((state) => ({
      applications: {
        ...state.applications,
        [application.id]: application,
      },
    }));
  },

  searchShortcuts: (query) => {
    const state = get();
    const searchLower = query.toLowerCase();
    
    return Object.values(state.shortcuts).filter((shortcut) => {
      return (
        shortcut.name.toLowerCase().includes(searchLower) ||
        shortcut.description?.toLowerCase().includes(searchLower) ||
        shortcut.keys.toLowerCase().includes(searchLower) ||
        shortcut.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        state.applications[shortcut.application].name.toLowerCase().includes(searchLower)
      );
    });
  },
}));

export default useShortcutStore; 