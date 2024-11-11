export interface ElectronAPI {
  unregisterAllShortcuts: () => Promise<void>;
  registerShortcuts: () => Promise<void>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
} 