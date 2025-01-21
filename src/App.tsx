import React, { useState } from 'react';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-container">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Type a command or search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>
      
      <div className="results-container">
        <div className="list-item">
          <span>Create new project ⌘N</span>
        </div>
        <div className="list-item">
          <span>Open recent file ⌘O</span>
        </div>
        <div className="list-item">
          <span>Search documentation ⌘D</span>
        </div>
        {/* Add more items as needed */}
      </div>

      <div className="toolbar">
        <span className="toolbar-item">⌘</span>
        <span className="toolbar-item">tags</span>
        <span className="toolbar-item">↑↓</span>
        <span className="toolbar-item">navigate</span>
        <span className="toolbar-item">↵</span>
        <span className="toolbar-item">open</span>
        <span className="toolbar-item">esc</span>
        <span className="toolbar-item">close</span>
      </div>
    </div>
  );
};

export default App;