import { Application, Shortcut, ShortcutStore } from '../types/shortcuts';

const macOS: Application = {
  id: 'macos',
  name: 'macOS',
  icon: '🍎', // We can replace with actual icon path later
};

const defaultShortcuts: Record<string, Shortcut> = {
  'macos-copy': {
    id: 'macos-copy',
    name: 'Copy',
    keys: '⌘C',
    application: 'macos',
    isGlobal: true,
    description: 'Copy selected content to clipboard',
    tags: ['system', 'clipboard'],
  },
  'macos-paste': {
    id: 'macos-paste',
    name: 'Paste',
    keys: '⌘V',
    application: 'macos',
    isGlobal: true,
    description: 'Paste content from clipboard',
    tags: ['system', 'clipboard'],
  },
  'macos-cut': {
    id: 'macos-cut',
    name: 'Cut',
    keys: '⌘X',
    application: 'macos',
    isGlobal: true,
    description: 'Cut selected content to clipboard',
    tags: ['system', 'clipboard'],
  },
  'macos-save': {
    id: 'macos-save',
    name: 'Save',
    keys: '⌘S',
    application: 'macos',
    isGlobal: true,
    description: 'Save current document',
    tags: ['system', 'file'],
  },
  'macos-undo': {
    id: 'macos-undo',
    name: 'Undo',
    keys: '⌘Z',
    application: 'macos',
    isGlobal: true,
    description: 'Undo last action',
    tags: ['system', 'edit'],
  },
  'macos-redo': {
    id: 'macos-redo',
    name: 'Redo',
    keys: '⌘⇧Z',
    application: 'macos',
    isGlobal: true,
    description: 'Redo last action',
    tags: ['system', 'edit'],
  },
};

export const initialStore: ShortcutStore = {
  applications: {
    macos: macOS,
  },
  shortcuts: defaultShortcuts,
}; 