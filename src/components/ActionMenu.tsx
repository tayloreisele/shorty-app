import React, { useState, useRef, useEffect } from 'react';

interface ActionMenuProps {
  isFavorite: boolean;
  onFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  isFavorite,
  onFavorite,
  onEdit,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="action-menu-container">
      <button
        ref={buttonRef}
        className="action-menu-button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Actions"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div ref={menuRef} className="action-menu">
          <button 
            className="action-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
              setIsOpen(false);
            }}
          >
            <span className="action-menu-icon">⭐️</span>
            {isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
          <button 
            className="action-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setIsOpen(false);
            }}
          >
            <span className="action-menu-icon">✏️</span>
            Edit
          </button>
          <button 
            className="action-menu-item delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setIsOpen(false);
            }}
          >
            <span className="action-menu-icon">🗑️</span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionMenu; 