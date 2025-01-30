import React, { useState, useEffect, useCallback } from 'react';

interface ShortcutCreatorProps {
  onClose: () => void;
  isOpen: boolean;
}

const ShortcutCreator: React.FC<ShortcutCreatorProps> = ({ onClose, isOpen }) => {
  const [shortcutKeys, setShortcutKeys] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showModifierPulse, setShowModifierPulse] = useState(true);

  const clearShortcut = () => {
    setShortcutKeys([]);
    setIsListening(false);
    setShowModifierPulse(true);
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

        <div className="shortcut-input-container">
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
              onClick={clearShortcut}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ShortcutCreator; 
