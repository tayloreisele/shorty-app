import React, { useState, useEffect, useCallback } from 'react';

interface App {
  id: string;
  name: string;
  icon?: string;
}

interface ShortcutCreatorProps {
  onClose: () => void;
  isOpen: boolean;
}

const ShortcutCreator: React.FC<ShortcutCreatorProps> = ({ onClose, isOpen }) => {
  const [shortcutKeys, setShortcutKeys] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showModifierPulse, setShowModifierPulse] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [shortcutName, setShortcutName] = useState('');
  const [shortcutDescription, setShortcutDescription] = useState('');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [apps, setApps] = useState<App[]>([
    { id: '1', name: 'Chrome' },
    { id: '2', name: 'VS Code' },
    { id: '3', name: 'Finder' },
  ]);

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

  const handleAddApp = () => {
    if (newAppName.trim()) {
      const newApp = {
        id: Date.now().toString(),
        name: newAppName.trim()
      };
      setApps(prev => [...prev, newApp]);
      setSelectedApp(newApp);
      setIsAddingApp(false);
      setNewAppName('');
    }
  };

  return (
    <>
      <div 
        className={`shortcut-creator-backdrop ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />
      <div className={`shortcut-creator ${isOpen ? 'active' : ''}`}>
        <div className="shortcut-creator-header">
          <h2>Create Shortcut</h2>
          <button onClick={onClose} className="close-button">
            <svg 
              className="w-5 h-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        <p className="shortcut-creator-instruction">
          Create a shortcut by selecting modifiers and pressing any key
        </p>

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
                    value={selectedApp?.id || ''}
                    onChange={(e) => {
                      if (e.target.value === 'add') {
                        setIsAddingApp(true);
                      } else {
                        setSelectedApp(apps.find(app => app.id === e.target.value) || null);
                      }
                    }}
                  >
                    <option value="">Select an app...</option>
                    <option value="add">+ Add new app</option>
                    {apps.map(app => (
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
                      disabled={!newAppName.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button 
              className="save-button"
              disabled={!shortcutName.trim() || !selectedApp}
            >
              Save Shortcut
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ShortcutCreator; 
