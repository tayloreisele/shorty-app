export interface Shortcut {
  id: string;
  name: string;
  keys: string;
  application: string;
  isGlobal: boolean;
  description?: string;
  tags?: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Application {
  id: string;
  name: string;
  icon?: string;
  isPremium?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ShortcutStore {
  applications: Record<string, Application>;
  shortcuts: Record<string, Shortcut>;
}

export interface StorageData {
  applications: Record<string, Application>;
  shortcuts: Record<string, Shortcut>;
  version: number;
}

// Action return types
export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AddShortcutResult = ActionResult<Shortcut>;
export type AddApplicationResult = ActionResult<Application>;
export type UpdateResult = ActionResult<void>;
export type DeleteResult = ActionResult<void>; 