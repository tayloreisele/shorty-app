import { Application, Shortcut, ShortcutStore } from '../types/shortcuts';

const now = Date.now();

const createShortcut = (shortcut: Omit<Shortcut, 'isFavorite' | 'createdAt' | 'updatedAt'>): Shortcut => ({
  ...shortcut,
  isFavorite: false,
  createdAt: now,
  updatedAt: now,
});

const macOS: Application = {
  id: 'macos',
  name: 'macOS',
  createdAt: now,
  updatedAt: now,
  icon: '🍎', // We can replace with actual icon path later
};

const defaultShortcuts: Record<string, Shortcut> = {
  'macos-copy': createShortcut({
    id: 'macos-copy',
    name: 'Copy',
    keys: '⌘C',
    application: 'macos',
    isGlobal: true,
    description: 'Copy selected content to clipboard',
    tags: ['system', 'clipboard'],
  }),
  'macos-paste': createShortcut({
    id: 'macos-paste',
    name: 'Paste',
    keys: '⌘V',
    application: 'macos',
    isGlobal: true,
    description: 'Paste content from clipboard',
    tags: ['system', 'clipboard'],
  }),
  'macos-cut': createShortcut({
    id: 'macos-cut',
    name: 'Cut',
    keys: '⌘X',
    application: 'macos',
    isGlobal: true,
    description: 'Cut selected content to clipboard',
    tags: ['system', 'clipboard'],
  }),
  'macos-save': createShortcut({
    id: 'macos-save',
    name: 'Save',
    keys: '⌘S',
    application: 'macos',
    isGlobal: true,
    description: 'Save current document',
    tags: ['system', 'file'],
  }),
  'macos-undo': createShortcut({
    id: 'macos-undo',
    name: 'Undo',
    keys: '⌘Z',
    application: 'macos',
    isGlobal: true,
    description: 'Undo last action',
    tags: ['system', 'edit'],
  }),
  'macos-redo': createShortcut({
    id: 'macos-redo',
    name: 'Redo',
    keys: '⌘⇧Z',
    application: 'macos',
    isGlobal: true,
    description: 'Redo last action',
    tags: ['system', 'edit'],
  }),
  'macos-find': createShortcut({
    id: 'macos-find',
    name: 'Find',
    keys: '⌘F',
    application: 'macos',
    isGlobal: true,
    description: 'Find in document',
    tags: ['system', 'search'],
  }),
  'macos-find-next': createShortcut({
    id: 'macos-find-next',
    name: 'Find Next',
    keys: '⌘G',
    application: 'macos',
    isGlobal: true,
    description: 'Find next occurrence',
    tags: ['system', 'search'],
  }),
  'macos-find-prev': createShortcut({
    id: 'macos-find-prev',
    name: 'Find Previous',
    keys: '⌘⇧G',
    application: 'macos',
    isGlobal: true,
    description: 'Find previous occurrence',
    tags: ['system', 'search'],
  }),
  'macos-select-all': createShortcut({
    id: 'macos-select-all',
    name: 'Select All',
    keys: '⌘A',
    application: 'macos',
    isGlobal: true,
    description: 'Select all content',
    tags: ['system', 'edit'],
  }),
  'macos-new': createShortcut({
    id: 'macos-new',
    name: 'New',
    keys: '⌘N',
    application: 'macos',
    isGlobal: true,
    description: 'Create new document',
    tags: ['system', 'file'],
  }),
  'macos-open': createShortcut({
    id: 'macos-open',
    name: 'Open',
    keys: '⌘O',
    application: 'macos',
    isGlobal: true,
    description: 'Open document',
    tags: ['system', 'file'],
  }),
  'macos-print': createShortcut({
    id: 'macos-print',
    name: 'Print',
    keys: '⌘P',
    application: 'macos',
    isGlobal: true,
    description: 'Print document',
    tags: ['system', 'file'],
  }),
  'macos-minimize': createShortcut({
    id: 'macos-minimize',
    name: 'Minimize',
    keys: '⌘M',
    application: 'macos',
    isGlobal: true,
    description: 'Minimize window',
    tags: ['system', 'window'],
  }),
  'macos-close': createShortcut({
    id: 'macos-close',
    name: 'Close',
    keys: '⌘W',
    application: 'macos',
    isGlobal: true,
    description: 'Close window',
    tags: ['system', 'window'],
  }),
};

export const initialStore: ShortcutStore = {
  applications: {
    macos: macOS,
  },
  shortcuts: defaultShortcuts,
}; 