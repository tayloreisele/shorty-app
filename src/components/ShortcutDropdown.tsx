import React, { useState, useEffect } from 'react';
import { Settings, X, Search, Globe2 } from 'lucide-react';
import type { Shortcut } from '../types';

interface ShortcutDropdownProps {
  onOpenSettings: () => void;
}

export const ShortcutDropdown: React.FC<ShortcutDropdownProps> = ({ onOpenSettings }) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const savedShortcuts = localStorage.getItem('shortcuts');
    if (savedShortcuts) {
      setShortcuts(JSON.parse(savedShortcuts));
    }
  }, []);

  const filteredShortcuts = shortcuts.filter(
    shortcut => 
      shortcut.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.app.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.app]) {
      acc[shortcut.app] = [];
    }
    acc[shortcut.app].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const sortedApps = Object.keys(groupedShortcuts).sort();

  return (
    <div className="w-[368px] bg-black rounded-lg shadow-2xl border border-gray-800/50 overflow-x-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-base font-medium text-white">Shorty</h2>
        <div className="flex gap-1">
          <button 
            onClick={onOpenSettings}
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-gray-800 rounded-md transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 focus:bg-gray-800"
          />
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {sortedApps.map((app) => (
          <div key={app}>
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-900/30">
              {app}
            </div>
            {groupedShortcuts[app].map((shortcut) => (
              <div
                key={shortcut.id}
                className="px-3 py-2 hover:bg-gray-800/50 group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-white">{shortcut.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">{shortcut.description}</p>
                      {shortcut.isSystemWide && (
                        <Globe2 className="w-3 h-3 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-800/50 text-gray-400 rounded text-xs font-medium group-hover:bg-gray-700/50">
                    {shortcut.shortcut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};