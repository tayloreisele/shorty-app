import React, { useState, useEffect, useRef } from 'react';
import useShortcutStore from '../store/useShortcutStore';
import KeyboardShortcut from './KeyboardShortcut';
import HighlightedText from './HighlightedText';
import ShortcutCreator from './ShortcutCreator';

const MAX_VISIBLE_SHORTCUTS = 10;

type ExpandedView = {
  type: 'system' | 'favorites' | null;
};

type Selection = {
  column: 'left' | 'right' | 'back';
  index: number;
};

const CommandPalette: React.FC = () => {
  console.log('CommandPalette rendering...');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedView, setExpandedView] = useState<ExpandedView>({ type: null });
  const [selectedItem, setSelectedItem] = useState<Selection>({ column: 'left', index: 0 });
  const [isShortcutCreatorOpen, setIsShortcutCreatorOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const store = useShortcutStore();
  const toggleFavorite = useShortcutStore(state => state.toggleFavorite);
  console.log('Full store state:', store);
  
  // Focus search input when window becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Also focus when the window gains focus
    window.addEventListener('focus', () => searchInputRef.current?.focus());

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => searchInputRef.current?.focus());
    };
  }, []);
  
  // Filter shortcuts based on search query
  const filterShortcuts = (shortcuts: any[]) => {
    if (!searchQuery.trim()) return shortcuts;
    
    const query = searchQuery.toLowerCase().trim();
    return shortcuts.filter(shortcut => 
      shortcut.name.toLowerCase().includes(query) || 
      shortcut.keys.toLowerCase().includes(query)
    );
  };
  
  // Split shortcuts into system and favorites
  const allShortcuts = Object.values(store.shortcuts || {});
  const systemShortcuts = filterShortcuts(allShortcuts.filter(s => s.isGlobal));
  const favoriteShortcuts = filterShortcuts(allShortcuts.filter(s => s.isFavorite));

  // Get visible shortcuts for each section
  const visibleSystemShortcuts = systemShortcuts.slice(0, MAX_VISIBLE_SHORTCUTS);
  const hasMoreSystem = systemShortcuts.length > MAX_VISIBLE_SHORTCUTS;

  const visibleFavoriteShortcuts = favoriteShortcuts.slice(0, MAX_VISIBLE_SHORTCUTS);
  const hasMoreFavorites = favoriteShortcuts.length > MAX_VISIBLE_SHORTCUTS;

  // Reset selection when search query changes
  useEffect(() => {
    setSelectedItem({ column: 'left', index: 0 });
  }, [searchQuery]);

  // Handle keyboard navigation for expanded view
  const handleExpandedKeyDown = (e: KeyboardEvent) => {
    if (!expandedView.type) return;

    const shortcuts = expandedView.type === 'system' ? systemShortcuts : favoriteShortcuts;
    const midPoint = Math.ceil(shortcuts.length / 2);
    const leftColumnShortcuts = shortcuts.slice(0, midPoint);
    const rightColumnShortcuts = shortcuts.slice(midPoint);
    
    if (e.key === 'Enter' && selectedItem.column === 'back') {
      e.preventDefault();
      handleBack();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selectedItem.column === 'back') {
        setSelectedItem({ column: 'left', index: 0 });
      } else {
        const currentShortcuts = selectedItem.column === 'left' ? leftColumnShortcuts : rightColumnShortcuts;
        const maxIndex = currentShortcuts.length - 1;
        let newIndex = selectedItem.index;
        newIndex = newIndex < maxIndex ? newIndex + 1 : 0;
        setSelectedItem({ ...selectedItem, index: newIndex });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedItem.column === 'back') {
        return;
      }
      const currentShortcuts = selectedItem.column === 'left' ? leftColumnShortcuts : rightColumnShortcuts;
      const maxIndex = currentShortcuts.length - 1;
      let newIndex = selectedItem.index;
      if (newIndex > 0) {
        newIndex = newIndex - 1;
        setSelectedItem({ ...selectedItem, index: newIndex });
      } else {
        setSelectedItem({ column: 'back', index: 0 });
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (selectedItem.column === 'back') {
        return;
      }
      const newColumn = selectedItem.column === 'left' ? 'right' : 'left';
      const newShortcuts = newColumn === 'left' ? leftColumnShortcuts : rightColumnShortcuts;
      setSelectedItem({
        column: newColumn,
        index: Math.min(selectedItem.index, newShortcuts.length - 1)
      });
    }
  };

  // Handle keyboard navigation for main view
  const handleMainViewKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentColumn = selectedItem.column;
      const shortcuts = currentColumn === 'left' ? visibleSystemShortcuts : favoriteShortcuts;
      const hasMore = currentColumn === 'left' ? hasMoreSystem : hasMoreFavorites;
      
      // Include the "See More" button in navigation when it exists
      const maxIndex = hasMore ? shortcuts.length : shortcuts.length - 1;

      let newIndex = selectedItem.index;
      if (e.key === 'ArrowDown') {
        newIndex = newIndex < maxIndex ? newIndex + 1 : 0;
      } else {
        newIndex = newIndex > 0 ? newIndex - 1 : maxIndex;
      }

      setSelectedItem({ ...selectedItem, index: newIndex });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const newColumn = selectedItem.column === 'left' ? 'right' : 'left';
      const shortcuts = newColumn === 'left' ? visibleSystemShortcuts : favoriteShortcuts;
      const hasMore = newColumn === 'left' ? hasMoreSystem : hasMoreFavorites;
      
      // Include the "See More" button in navigation when it exists
      const maxIndex = hasMore ? shortcuts.length : shortcuts.length - 1;
      
      setSelectedItem({
        column: newColumn,
        index: Math.min(selectedItem.index, maxIndex)
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentColumn = selectedItem.column;
      const shortcuts = currentColumn === 'left' ? visibleSystemShortcuts : favoriteShortcuts;
      
      if (selectedItem.index === shortcuts.length) {
        // Selected the See More button
        handleSeeMore(currentColumn === 'left' ? 'system' : 'favorites');
      } else {
        // Selected a shortcut - toggle favorite
        const shortcut = shortcuts[selectedItem.index];
        if (shortcut) {
          toggleFavorite(shortcut.id);
        }
      }
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (expandedView.type) {
        handleExpandedKeyDown(e);
      } else {
        handleMainViewKeyDown(e);
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedItem, expandedView, systemShortcuts, favoriteShortcuts, visibleSystemShortcuts]);

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
    setSelectedItem({ column: 'left', index: 0 });
  };

  const handleBack = () => {
    setExpandedView({ type: null });
    // Reset selection to first item in left column when returning to main view
    setSelectedItem({ column: 'left', index: 0 });
  };

  const handleToggleFavorite = async (shortcutId: string) => {
    await toggleFavorite(shortcutId);
  };

  return (
    <div className="command-palette">
      <div className="command-content">
        <div className="search-header">
          <input 
            ref={searchInputRef}
            type="text" 
            className="search-input"
            placeholder="Find a shortcut..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="add-shortcut-button"
            onClick={() => setIsShortcutCreatorOpen(true)}
            title="Add Shortcut"
          >
            <svg 
              className="plus-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="1.25"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 4v16m8-8H4" 
              />
            </svg>
          </button>
        </div>

        {systemShortcuts.length === 0 && favoriteShortcuts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg 
                className="w-8 h-8" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
                />
              </svg>
            </div>
            <h3 className="empty-state-title">No shortcuts found</h3>
            <p className="empty-state-description">
              Try searching with different keywords
            </p>
          </div>
        ) : expandedView.type ? (
          <>
            <div className="expanded-header">
              <button 
                className={`back-button ${selectedItem.column === 'back' ? 'bg-gray-800/50' : ''}`}
                onClick={handleBack}
              >
                ← Back
              </button>
              <span className="expanded-title">
                {expandedView.type === 'system' ? 'System Shortcuts' : 'Favorite Shortcuts'}
              </span>
            </div>
            <div className="command-list expanded">
              {/* Left Column */}
              <div className="column">
                {(expandedView.type === 'system' ? systemShortcuts : favoriteShortcuts)
                  .slice(0, Math.ceil((expandedView.type === 'system' ? systemShortcuts : favoriteShortcuts).length / 2))
                  .map((shortcut, index) => (
                    <div 
                      key={shortcut.id} 
                      className={`command-item ${
                        selectedItem.column === 'left' && selectedItem.index === index 
                          ? 'bg-gray-800/50' 
                          : ''
                      }`}
                      onClick={() => handleToggleFavorite(shortcut.id)}
                    >
                      <div className="command-item-content">
                        {shortcut.isGlobal && (
                          <svg 
                            className="w-5 h-5" 
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
                        <HighlightedText text={shortcut.name} highlight={searchQuery.trim()} />
                        <button
                          className={`favorite-button ${shortcut.isFavorite ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(shortcut.id);
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill={shortcut.isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1"
                            className={shortcut.isFavorite ? 'text-yellow-400' : 'text-gray-400'}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                          </svg>
                        </button>
                      </div>
                      <KeyboardShortcut shortcut={shortcut.keys} />
                    </div>
                  ))}
              </div>
              {/* Right Column */}
              <div className="column">
                {(expandedView.type === 'system' ? systemShortcuts : favoriteShortcuts)
                  .slice(Math.ceil((expandedView.type === 'system' ? systemShortcuts : favoriteShortcuts).length / 2))
                  .map((shortcut, index) => (
                    <div 
                      key={shortcut.id} 
                      className={`command-item ${
                        selectedItem.column === 'right' && selectedItem.index === index 
                          ? 'bg-gray-800/50' 
                          : ''
                      }`}
                      onClick={() => handleToggleFavorite(shortcut.id)}
                    >
                      <div className="command-item-content">
                        {shortcut.isGlobal && (
                          <svg 
                            className="w-5 h-5" 
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
                        <HighlightedText text={shortcut.name} highlight={searchQuery.trim()} />
                        <button
                          className={`favorite-button ${shortcut.isFavorite ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(shortcut.id);
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill={shortcut.isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1"
                            className={shortcut.isFavorite ? 'text-yellow-400' : 'text-gray-400'}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                            />
                          </svg>
                        </button>
                      </div>
                      <KeyboardShortcut shortcut={shortcut.keys} />
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="columns-container">
            {/* System Shortcuts Column */}
            <div className="column">
              <h2 className="column-title">System</h2>
              <div className="command-list">
                {visibleSystemShortcuts.map((shortcut, index) => (
                  <div 
                    key={shortcut.id} 
                    className={`command-item ${
                      selectedItem.column === 'left' && selectedItem.index === index 
                        ? 'bg-gray-800/50' 
                        : ''
                    }`}
                    onClick={() => handleToggleFavorite(shortcut.id)}
                  >
                    <div className="command-item-content">
                      {shortcut.isGlobal && (
                        <svg 
                          className="w-5 h-5" 
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
                      <HighlightedText text={shortcut.name} highlight={searchQuery.trim()} />
                      <button
                        className={`favorite-button ${shortcut.isFavorite ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(shortcut.id);
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={shortcut.isFavorite ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="1"
                          className={shortcut.isFavorite ? 'text-yellow-400' : 'text-gray-400'}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                          />
                        </svg>
                      </button>
                    </div>
                    <KeyboardShortcut shortcut={shortcut.keys} />
                  </div>
                ))}
                {hasMoreSystem && (
                  <div 
                    className={`see-more ${
                      selectedItem.column === 'left' && selectedItem.index === visibleSystemShortcuts.length 
                        ? 'bg-gray-800/50' 
                        : ''
                    }`} 
                    onClick={() => handleSeeMore('system')}
                  >
                    See More →
                  </div>
                )}
              </div>
            </div>

            {/* Favorites Column */}
            <div className="column">
              <h2 className="column-title">Favorites</h2>
              <div className="command-list">
                {favoriteShortcuts.length === 0 ? (
                  <div className="empty-state favorites-empty">
                    <div className="empty-state-icon">
                      <svg 
                        className="w-8 h-8" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </div>
                    <h3 className="empty-state-title">No favorites yet</h3>
                    <p className="empty-state-description">
                      Star your most-used shortcuts to access them quickly
                    </p>
                  </div>
                ) : (
                  <>
                    {favoriteShortcuts.map((shortcut, index) => (
                      <div 
                        key={shortcut.id} 
                        className={`command-item ${
                          selectedItem.column === 'right' && selectedItem.index === index 
                            ? 'bg-gray-800/50' 
                            : ''
                        }`}
                        onClick={() => handleToggleFavorite(shortcut.id)}
                      >
                        <div className="command-item-content">
                          {shortcut.isGlobal && (
                            <svg 
                              className="w-5 h-5" 
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
                          <HighlightedText text={shortcut.name} highlight={searchQuery.trim()} />
                          <button
                            className={`favorite-button ${shortcut.isFavorite ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(shortcut.id);
                            }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill={shortcut.isFavorite ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="1"
                              className={shortcut.isFavorite ? 'text-yellow-400' : 'text-gray-400'}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                              />
                            </svg>
                          </button>
                        </div>
                        <KeyboardShortcut shortcut={shortcut.keys} />
                      </div>
                    ))}
                    {hasMoreFavorites && (
                      <div 
                        className={`see-more ${
                          selectedItem.column === 'right' && selectedItem.index === favoriteShortcuts.length 
                            ? 'bg-gray-800/50' 
                            : ''
                        }`} 
                        onClick={() => handleSeeMore('favorites')}
                      >
                        See More →
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
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
          <KeyboardShortcut shortcut="↵" />
          <span>toggle favorite</span>
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

      <ShortcutCreator
        isOpen={isShortcutCreatorOpen}
        onClose={() => setIsShortcutCreatorOpen(false)}
      />
    </div>
  );
};

export default CommandPalette; 