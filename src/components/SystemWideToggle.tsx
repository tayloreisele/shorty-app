import React from 'react';
import { Globe2 } from 'lucide-react';

interface SystemWideToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const SystemWideToggle: React.FC<SystemWideToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          value ? 'bg-gray-600' : 'bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
      <div className="flex items-center gap-1 text-sm text-gray-400">
        <Globe2 className="w-3.5 h-3.5" />
        <span>System-wide shortcut</span>
      </div>
    </div>
  );
};