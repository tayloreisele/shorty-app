import React, { useState, useEffect } from 'react';
import useShortcutStore from '../store/useShortcutStore';

const CommandPalette: React.FC = () => {
  console.log('CommandPalette rendering...');
  
  const [searchQuery, setSearchQuery] = useState('');
  const store = useShortcutStore();
  console.log('Full store state:', store);
  
  const shortcuts = searchQuery 
    ? store.searchShortcuts(searchQuery)
    : Object.values(store.shortcuts || {});
  
  useEffect(() => {
    console.log('CommandPalette mounted');
    return () => console.log('CommandPalette unmounted');
  }, []);

  console.log('Shortcuts to render:', shortcuts);

  const applications = useShortcutStore(state => state.applications);

  return (
    <div className="command-palette">
      <div className="command-content">
        <input 
          type="text" 
          className="search-input"
          placeholder="Type a command or search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="command-list">
          {Array.isArray(shortcuts) && shortcuts.map((shortcut) => (
            <div key={shortcut.id} className="command-item">
              {shortcut.isGlobal && (
                <svg 
                  className="w-5 h-5 mr-3" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" 
                  />
                </svg>
              )}
              <span>{shortcut.name}</span>
              <span className="shortcut-badge ml-auto">{shortcut.keys}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="footer-shortcuts">
        <div>
          <span className="shortcut-badge">↑↓</span>
          <span>navigate</span>
        </div>
        <div>
          <span className="shortcut-badge">↵</span>
          <span>open</span>
        </div>
        <div>
          <span className="shortcut-badge">esc</span>
          <span>close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette; 