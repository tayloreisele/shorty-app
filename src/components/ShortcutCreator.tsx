import React, { useState, useEffect, useCallback } from 'react';
import useShortcutStore from '../store/useShortcutStore';
import type { Application } from '../types/shortcuts';

interface ShortcutCreatorProps {
  onClose: () => void;
  isOpen: boolean;
  editingShortcutId?: string | null;
}

const ShortcutCreator: React.FC<ShortcutCreatorProps> = ({ onClose, isOpen, editingShortcutId }) => {
  const [shortcutKeys, setShortcutKeys] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showModifierPulse, setShowModifierPulse] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [shortcutName, setShortcutName] = useState('');
  const [shortcutDescription, setShortcutDescription] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSystemShortcut, setIsSystemShortcut] = useState(false);

  // Get store actions and data
  const applications = useShortcutStore(state => state.applications);
  const addShortcut = useShortcutStore(state => state.addShortcut);
  const addApplication = useShortcutStore(state => state.addApplication);
  const shortcuts = useShortcutStore(state => state.shortcuts);
  const updateShortcut = useShortcutStore(state => state.updateShortcut);

  // Reset error when inputs change
  useEffect(() => {
    setError(null);
  }, [shortcutName, shortcutKeys, selectedApp, newAppName]);

  // Load shortcut data when editing
  useEffect(() => {
    if (editingShortcutId && shortcuts[editingShortcutId]) {
      const shortcut = shortcuts[editingShortcutId];
      setShortcutKeys(shortcut.keys.split(''));
      setShortcutName(shortcut.name);
      setShortcutDescription(shortcut.description || '');
      setIsSystemShortcut(shortcut.isGlobal);
      setSelectedApp(shortcut.isGlobal ? null : applications[shortcut.application] || null);
      setShowDetails(true);
    }
  }, [editingShortcutId, shortcuts]);

  // Clear form when closing
  useEffect(() => {
    if (!isOpen) {
      clearShortcut();
    }
  }, [isOpen]);

  const handleSave = async () => {
    // Validate inputs
    if (!shortcutName.trim()) {
      setError('Please enter a shortcut name');
      return;
    }
    if (shortcutKeys.length === 0) {
      setError('Please enter a keyboard shortcut');
      return;
    }
    if (!isSystemShortcut && !selectedApp && !newAppName.trim()) {
      setError('Please select or add an app');
      return;
    }

    try {
      // If adding a new app, create it first
      let appId = selectedApp?.id;
      if (!isSystemShortcut && !appId && newAppName.trim()) {
        const result = await addApplication({
          name: newAppName.trim()
        });
        if (!result.success) {
          throw new Error(result.error);
        }
        appId = result.data!.id;
      }

      if (editingShortcutId) {
        // Update existing shortcut
        const result = await updateShortcut(editingShortcutId, {
          name: shortcutName.trim(),
          keys: shortcutKeys.join(''),
          description: shortcutDescription.trim() || undefined,
          application: isSystemShortcut ? 'macos' : (appId as string),
          isGlobal: isSystemShortcut,
        });

        if (!result.success) {
          throw new Error(result.error);
        }
      } else {
        // Create new shortcut
        const result = await addShortcut({
          name: shortcutName.trim(),
          keys: shortcutKeys.join(''),
          description: shortcutDescription.trim() || undefined,
          application: isSystemShortcut ? 'macos' : (appId as string),
          isGlobal: isSystemShortcut,
          isFavorite: false
        });

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      // Clear form and close
      clearShortcut();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save shortcut');
    }
  };

  const clearShortcut = () => {
    setShortcutKeys([]);
    setIsListening(false);
    setShowModifierPulse(true);
    setShowDetails(false);
    setShortcutName('');
    setShortcutDescription('');
    setSelectedApp(null);
    setIsAddingApp(false);
    setNewAppName('');
    setIsSystemShortcut(false);
  };

  const handleBack = () => {
    setShowDetails(false);
    setIsListening(true);
  };

  const addModifier = (key: string) => {
    if (!shortcutKeys.includes(key)) {
      setShortcutKeys([...shortcutKeys, key]);
      setIsListening(true);
      setShowModifierPulse(false);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isListening) return;

    e.preventDefault();
    
    // Ignore modifier key presses by themselves
    if (['Meta', 'Shift', 'Alt', 'Control'].includes(e.key)) {
      return;
    }

    // Get the main key
    let key = e.key.toUpperCase();
    if (key === ' ') key = 'SPACE';
    if (key === 'ESCAPE') key = 'ESC';
    if (key === 'ARROWUP') key = '↑';
    if (key === 'ARROWDOWN') key = '↓';
    if (key === 'ARROWLEFT') key = '←';
    if (key === 'ARROWRIGHT') key = '→';
    if (key === 'ENTER') key = '↵';
    if (key === 'BACKSPACE') key = '⌫';
    if (key === 'TAB') key = '⇥';

    setShortcutKeys(prev => [...prev, key]);
    setIsListening(false);
    setShowDetails(true);
  }, [isListening]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isListening) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, isListening]);

  // Reset pulse when drawer opens
  useEffect(() => {
    if (isOpen) {
      setShowModifierPulse(true);
    }
  }, [isOpen]);

  const handleAddApp = async () => {
    if (newAppName.trim()) {
      try {
        const result = await addApplication({
          name: newAppName.trim()
        });
        
        if (!result.success) {
          throw new Error(result.error);
        }

        setSelectedApp(result.data!);
        setIsAddingApp(false);
        setNewAppName('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add app');
      }
    }
  };

  return (
    <>
      <div className={`shortcut-creator-backdrop ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`shortcut-creator ${isOpen ? 'active' : ''}`}>
        <div className="shortcut-creator-header">
          <h2>Create Shortcut</h2>
          <button
            className="close-button"
            onClick={onClose}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <p className="shortcut-creator-instruction">
          Create a shortcut by selecting modifiers and pressing any key
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className={`shortcut-input-container ${showDetails ? 'dimmed' : ''}`}>
          <div className={`modifier-buttons ${showModifierPulse ? 'pulse' : ''}`}>
            <div className="modifier-key-wrapper">
              <div className="modifier-tooltip">Command</div>
              <button 
                className={`modifier-key ${shortcutKeys.includes('⌘') ? 'active' : ''}`}
                onClick={() => addModifier('⌘')}
              >
                ⌘
              </button>
            </div>
            <div className="modifier-key-wrapper">
              <div className="modifier-tooltip">Shift</div>
              <button 
                className={`modifier-key ${shortcutKeys.includes('⇧') ? 'active' : ''}`}
                onClick={() => addModifier('⇧')}
              >
                ⇧
              </button>
            </div>
            <div className="modifier-key-wrapper">
              <div className="modifier-tooltip">Option</div>
              <button 
                className={`modifier-key ${shortcutKeys.includes('⌥') ? 'active' : ''}`}
                onClick={() => addModifier('⌥')}
              >
                ⌥
              </button>
            </div>
            <div className="modifier-key-wrapper">
              <div className="modifier-tooltip">Control</div>
              <button 
                className={`modifier-key ${shortcutKeys.includes('⌃') ? 'active' : ''}`}
                onClick={() => addModifier('⌃')}
              >
                ⌃
              </button>
            </div>
          </div>

          <div className={`shortcut-preview ${!showModifierPulse && isListening ? 'pulse' : ''}`}>
            {shortcutKeys.map((key, index) => (
              <span key={index} className="key">{key}</span>
            ))}
            {isListening && (
              <span className="listening-text">Type any key...</span>
            )}
          </div>

          {shortcutKeys.length > 0 && (
            <button 
              className="clear-button"
              onClick={showDetails ? handleBack : clearShortcut}
            >
              {showDetails ? 'Back' : 'Clear'}
            </button>
          )}
        </div>

        {showDetails && (
          <div className={`shortcut-details ${showDetails ? 'active' : ''}`}>
            <input
              type="text"
              className="details-input"
              placeholder="Shortcut name"
              value={shortcutName}
              onChange={(e) => setShortcutName(e.target.value)}
              autoFocus
            />
            <textarea
              className="details-input details-description"
              placeholder="Description (optional)"
              value={shortcutDescription}
              onChange={(e) => setShortcutDescription(e.target.value)}
            />
            
            <div className="app-selector">
              {!isAddingApp ? (
                <div className="dropdown-container">
                  <select
                    className="details-input app-dropdown"
                    value={isSystemShortcut ? 'system' : selectedApp?.id || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'system') {
                        setIsSystemShortcut(true);
                        setSelectedApp(null);
                      } else if (value === 'add') {
                        setIsAddingApp(true);
                        setIsSystemShortcut(false);
                      } else {
                        setIsSystemShortcut(false);
                        setSelectedApp(Object.values(applications).find(app => app.id === value) || null);
                      }
                    }}
                  >
                    <option value="">Select an app...</option>
                    <option value="add" className="add-new-app-option">✨ Add new app</option>
                    <option value="system">macOS Shortcuts</option>
                    {Object.values(applications)
                      .filter(app => app.id !== 'macos') // Exclude the macOS app if it exists
                      .map(app => (
                        <option key={app.id} value={app.id}>{app.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="new-app-input">
                  <input
                    type="text"
                    className="details-input"
                    placeholder="Enter app name"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    autoFocus
                  />
                  <div className="new-app-actions">
                    <button 
                      className="app-action-button"
                      onClick={() => setIsAddingApp(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="app-action-button confirm"
                      onClick={handleAddApp}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="shortcut-actions">
              <button 
                className="save-button"
                onClick={handleSave}
                disabled={!shortcutName || shortcutKeys.length === 0 || (!isSystemShortcut && !selectedApp && !newAppName)}
              >
                Save Shortcut
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ShortcutCreator; 
