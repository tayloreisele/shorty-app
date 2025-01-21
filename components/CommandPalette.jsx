import React from 'react';

export default function CommandPalette() {
  return (
    <div className="gradient-bg">
      <div className="command-palette">
        <input 
          type="text" 
          className="search-input"
          placeholder="Type a command or search"
        />
        
        <div className="command-list">
          <div className="command-item">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 mr-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            <span>Create new project</span>
            <span className="shortcut-badge">⌘N</span>
          </div>
          
          {/* Add more command items as needed */}
        </div>
        
        <div className="footer-shortcuts">
          <span className="shortcut-badge">↑↓</span>
          <span>navigate</span>
          <span className="shortcut-badge">↵</span>
          <span>open</span>
          <span className="shortcut-badge">esc</span>
          <span>close</span>
        </div>
      </div>
    </div>
  );
} 