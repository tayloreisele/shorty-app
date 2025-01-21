import { app, BrowserWindow, globalShortcut, screen } from 'electron';
import * as path from 'path';
import './styles/globals.css'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // Get screen dimensions for centering
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  console.log('Creating window with dimensions:', { screenWidth, screenHeight });
  
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false,
    transparent: true,
    titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // Window behavior
    skipTaskbar: true,
    show: false,
    alwaysOnTop: true,
    // Appearance
    hasShadow: false,
    backgroundColor: '#00000000',
    // Position in exact center of screen
    x: Math.floor(screenWidth / 2 - 450),
    y: Math.floor(screenHeight / 2 - 300),
    // Window behavior
    movable: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    // Vibrancy (macOS)
    vibrancy: 'under-window',
    visualEffectState: 'active'
  });

  // Debug window state
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('Window failed to load:', errorDescription);
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Register global shortcut to toggle window
  const registered = globalShortcut.register('CommandOrControl+Shift+Space', () => {
    console.log('Shortcut triggered!');
    if (!mainWindow) {
      console.log('No window found');
      return;
    }

    if (mainWindow.isVisible()) {
      console.log('Hiding window');
      mainWindow.hide();
    } else {
      console.log('Showing window');
      // Force window to be visible
      mainWindow.setAlwaysOnTop(true);
      mainWindow.show();
      mainWindow.focus();
      // Position window in center screen
      const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
      mainWindow.setPosition(
        Math.floor(screenWidth / 2 - 450),
        Math.floor(screenHeight / 2 - 300)
      );
      // Ensure window is visible by bringing it to front
      mainWindow.moveTop();
      
      // Log window bounds for debugging
      const bounds = mainWindow.getBounds();
      console.log('Window bounds:', bounds);
      console.log('Window visible:', mainWindow.isVisible());
    }
  });

  console.log('Shortcut registered:', registered);

  // Hide from dock
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  // When window is ready
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    if (mainWindow) {
      // Initial positioning
      const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
      mainWindow.setPosition(
        Math.floor(screenWidth / 2 - 450),
        Math.floor(screenHeight / 2 - 300)
      );
      // Log initial window state
      const bounds = mainWindow.getBounds();
      console.log('Initial window bounds:', bounds);
    }
  });

  // Hide window when focus is lost
  mainWindow.on('blur', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    }
  });
};

// Set the app name to ensure proper window type
app.name = 'Shorty';

// Handle activation
app.whenReady().then(() => {
  // Unregister any existing shortcuts first
  globalShortcut.unregisterAll();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Unregister shortcuts when quitting
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});