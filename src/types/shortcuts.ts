export interface Shortcut {
  id: string;
  name: string;
  keys: string;
  application: string;
  isGlobal: boolean;
  description?: string;
  tags?: string[];
}

export interface Application {
  id: string;
  name: string;
  icon?: string;
  isPremium?: boolean;
}

export interface ShortcutStore {
  applications: Record<string, Application>;
  shortcuts: Record<string, Shortcut>;
} 