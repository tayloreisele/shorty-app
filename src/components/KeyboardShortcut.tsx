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
  'space': 'SPACE',
} as const;

interface KeyboardShortcutProps {
  shortcut: string;
}

const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({ shortcut }) => {
  // Convert the shortcut string into individual keys
  const keys = shortcut.split('').reduce((acc: string[], char, index, array) => {
    // Check if it's a special key symbol
    const specialKey = Object.values(KEY_SYMBOLS).find(symbol => symbol === char);
    if (specialKey) {
      acc.push(char);
    } else if (char === '+') {
      // Skip the plus sign as we'll handle spacing differently
      return acc;
    } else if (char === 'S' && array.slice(index, index + 5).join('') === 'SPACE') {
      // If we found 'SPACE', add it as a single key and skip the next 4 characters
      acc.push('SPACE');
      array.splice(index + 1, 4);
    } else if (!array.slice(index - 4, index + 1).join('').includes('SPACE')) {
      // Only add the character if it's not part of 'SPACE'
      acc.push(char);
    }
    return acc;
  }, []);
  
  return (
    <div className="keyboard-shortcut">
      {keys.map((key, index) => (
        <span key={index} className="key" style={key === 'SPACE' ? { minWidth: '50px' } : undefined}>{key}</span>
      ))}
    </div>
  );
};

export default KeyboardShortcut; 