import React, { useState, useEffect, useRef } from 'react';
import useShortcutStore from '../store/useShortcutStore';
import KeyboardShortcut from './KeyboardShortcut';

const MAX_VISIBLE_SHORTCUTS = 10;

type ExpandedView = {
  type: 'system' | 'favorites' | null;
};

type Selection = {
  column: 'system' | 'favorites';
  index: number;
};

const CommandPalette: React.FC = () => {
  console.log('CommandPalette rendering...');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedView, setExpandedView] = useState<ExpandedView>({ type: null });
  const [selectedItem, setSelectedItem] = useState<Selection>({ column: 'system', index: 0 });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const store = useShortcutStore();
  console.log('Full store state:', store);
  
  // Split shortcuts into system and app-specific
  const allShortcuts = Object.values(store.shortcuts || {});
  const systemShortcuts = allShortcuts.filter(s => s.isGlobal);
  const appShortcuts = allShortcuts.filter(s => !s.isGlobal);

  // Get visible shortcuts for each section
  const visibleSystemShortcuts = systemShortcuts.slice(0, MAX_VISIBLE_SHORTCUTS);
  const hasMoreSystem = systemShortcuts.length > MAX_VISIBLE_SHORTCUTS;

  // For now, we'll use system shortcuts as favorites (we'll implement proper favorites later)
  const favoriteShortcuts = systemShortcuts.slice(0, MAX_VISIBLE_SHORTCUTS);
  const hasMoreFavorites = systemShortcuts.length > MAX_VISIBLE_SHORTCUTS;

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentColumn = selectedItem.column;
      const shortcuts = currentColumn === 'system' ? visibleSystemShortcuts : favoriteShortcuts;
      const maxIndex = shortcuts.length - 1;

      let newIndex = selectedItem.index;
      if (e.key === 'ArrowDown') {
        newIndex = newIndex < maxIndex ? newIndex + 1 : 0;
      } else {
        newIndex = newIndex > 0 ? newIndex - 1 : maxIndex;
      }

      setSelectedItem({ ...selectedItem, index: newIndex });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const newColumn = selectedItem.column === 'system' ? 'favorites' : 'system';
      const shortcuts = newColumn === 'system' ? visibleSystemShortcuts : favoriteShortcuts;
      const maxIndex = shortcuts.length - 1;
      
      setSelectedItem({
        column: newColumn,
        index: Math.min(selectedItem.index, maxIndex)
      });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, visibleSystemShortcuts, favoriteShortcuts]);

  useEffect(() => {
    console.log('CommandPalette mounted');
    // Focus the search input when component mounts
    searchInputRef.current?.focus();
    return () => console.log('CommandPalette unmounted');
  }, []);

  console.log('Shortcuts to render:', allShortcuts);

  const applications = useShortcutStore(state => state.applications);

  const handleSeeMore = (type: 'system' | 'favorites') => {
    setExpandedView({ type });
  };

  const handleBack = () => {
    setExpandedView({ type: null });
  };

  // Render expanded view
  if (expandedView.type) {
    const shortcuts = expandedView.type === 'system' ? systemShortcuts : favoriteShortcuts;
    const title = expandedView.type === 'system' ? 'System' : 'Favorites';
    const midPoint = Math.ceil(shortcuts.length / 2);
    const leftColumnShortcuts = shortcuts.slice(0, midPoint);
    const rightColumnShortcuts = shortcuts.slice(midPoint);

    return (
      <div className="command-palette">
        <div className="command-content">
          <div className="expanded-header">
            <button onClick={handleBack} className="back-button">
              ← Back
            </button>
            <h2 className="expanded-title">{title} Shortcuts</h2>
          </div>
          
          <div className="command-list expanded">
            <div className="column">
              {leftColumnShortcuts.map((shortcut) => (
                <div key={shortcut.id} className="command-item">
                  {expandedView.type === 'system' && (
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
                  <KeyboardShortcut shortcut={shortcut.keys} />
                </div>
              ))}
            </div>
            <div className="column">
              {rightColumnShortcuts.map((shortcut) => (
                <div key={shortcut.id} className="command-item">
                  {expandedView.type === 'system' && (
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
                  <KeyboardShortcut shortcut={shortcut.keys} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render main view
  return (
    <div className="command-palette">
      <div className="command-content">
        <input 
          ref={searchInputRef}
          type="text" 
          className="search-input"
          placeholder="Find a shortcut..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="columns-container">
          {/* System Shortcuts Column */}
          <div className="column">
            <h2 className="column-title">System</h2>
            <div className="command-list">
              {visibleSystemShortcuts.map((shortcut, index) => (
                <div 
                  key={shortcut.id} 
                  className={`command-item ${
                    selectedItem.column === 'system' && selectedItem.index === index 
                      ? 'bg-gray-800/50' 
                      : ''
                  }`}
                >
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
                  <span>{shortcut.name}</span>
                  <KeyboardShortcut shortcut={shortcut.keys} />
                </div>
              ))}
              {hasMoreSystem && (
                <div className="see-more" onClick={() => handleSeeMore('system')}>
                  See More →
                </div>
              )}
            </div>
          </div>

          {/* Favorites Column */}
          <div className="column">
            <h2 className="column-title">Favorites</h2>
            <div className="command-list">
              {favoriteShortcuts.map((shortcut, index) => (
                <div 
                  key={shortcut.id} 
                  className={`command-item ${
                    selectedItem.column === 'favorites' && selectedItem.index === index 
                      ? 'bg-gray-800/50' 
                      : ''
                  }`}
                >
                  <span>{shortcut.name}</span>
                  <KeyboardShortcut shortcut={shortcut.keys} />
                </div>
              ))}
              {hasMoreFavorites && (
                <div className="see-more" onClick={() => handleSeeMore('favorites')}>
                  See More →
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-shortcuts">
        <div>
          <KeyboardShortcut shortcut="↑↓" />
          <span>navigate</span>
        </div>
        <div>
          <KeyboardShortcut shortcut="←→" />
          <span>switch column</span>
        </div>
        <div>
          <div className="keyboard-shortcut">
            <span className="key">⌘</span>
            <span className="key">⇧</span>
            <span className="key" style={{ minWidth: '50px' }}>space</span>
          </div>
          <span>close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette; 