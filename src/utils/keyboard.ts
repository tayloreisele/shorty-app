export const formatKeys = (modifiers: string[], key: string | null): string => {
    const modifierSymbols: Record<string, string> = {
      'Meta': '⌘',
      'Control': '⌃',
      'Alt': '⌥',
      'Shift': '⇧'
    };
  
    const specialKeys: Record<string, string> = {
      ' ': 'Space',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Enter': '↵',
      'Backspace': '⌫',
      'Delete': '⌦',
      'Escape': 'esc'
    };
  
    const formattedModifiers = modifiers
      .map(mod => modifierSymbols[mod] || mod)
      .sort((a, b) => {
        const order: Record<string, number> = { '⌃': 1, '⌥': 2, '⇧': 3, '⌘': 4 };
        return (order[a] || 5) - (order[b] || 5);
      });
  
    if (key) {
      const formattedKey = specialKeys[key] || (key.length === 1 ? key.toUpperCase() : key);
      formattedModifiers.push(formattedKey);
    }
  
    return formattedModifiers.join(' ');
  };