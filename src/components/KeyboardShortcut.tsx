import React from 'react';

// Map of key names to their Mac symbols
const KEY_SYMBOLS = {
  'cmd': '⌘',
  'command': '⌘',
  'shift': '⇧',
  'option': '⌥',
  'alt': '⌥',
  'ctrl': '⌃',
  'control': '⌃',
  'return': '↵',
  'delete': '⌫',
  'backspace': '⌫',
  'esc': '⎋',
  'tab': '⇥',
  'right': '→',
  'left': '←',
  'up': '↑',
  'down': '↓',
  'space': 'Space',
} as const;

interface KeyboardShortcutProps {
  shortcut: string;
}

const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({ shortcut }) => {
  // Convert the shortcut string into individual keys
  const keys = shortcut.split('').reduce((acc: string[], char) => {
    // Check if it's a special key symbol
    const specialKey = Object.values(KEY_SYMBOLS).find(symbol => symbol === char);
    if (specialKey) {
      acc.push(char);
    } else if (char === '+') {
      // Skip the plus sign as we'll handle spacing differently
      return acc;
    } else {
      // Regular character
      acc.push(char);
    }
    return acc;
  }, []);
  
  return (
    <div className="keyboard-shortcut">
      {keys.map((key, index) => (
        <span key={index} className="key">{key}</span>
      ))}
    </div>
  );
};

export default KeyboardShortcut; 