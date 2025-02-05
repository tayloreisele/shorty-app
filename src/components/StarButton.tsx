import React from 'react';

interface StarButtonProps {
  isFavorite: boolean;
  onClick: () => void;
  className?: string;
}

const StarButton: React.FC<StarButtonProps> = ({ isFavorite, onClick, className = '' }) => {
  return (
    <button
      className={`star-button ${isFavorite ? 'is-favorite' : ''} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
};

export default StarButton; 