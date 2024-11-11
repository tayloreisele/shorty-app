import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Shortcut } from '../types';
import { ShortcutRecorder } from './ShortcutRecorder';
import { SystemWideToggle } from './SystemWideToggle';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [newShortcut, setNewShortcut] = useState<Partial<Shortcut>>({
    isSystemWide: false
  });

  useEffect(() => {
    const savedShortcuts = localStorage.getItem('shortcuts');
    if (savedShortcuts) {
      setShortcuts(JSON.parse(savedShortcuts));
    }
  }, []);

  const saveShortcut = () => {
    if (!newShortcut.name || !newShortcut.shortcut || !newShortcut.app) return;

    const updatedShortcuts = [
      ...shortcuts,
      {
        id: Date.now(),
        name: newShortcut.name,
        shortcut: newShortcut.shortcut,
        description: newShortcut.description || '',
        app: newShortcut.app,
        isSystemWide: newShortcut.isSystemWide || false
      }
    ];

    setShortcuts(updatedShortcuts);
    localStorage.setItem('shortcuts', JSON.stringify(updatedShortcuts));
    setNewShortcut({ isSystemWide: false });
  };

  return (
    <div className="w-[368px] bg-black rounded-lg shadow-2xl border border-gray-800/50 overflow-x-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-base font-medium text-white">Settings</h2>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-white mb-3">Add New Shortcut</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Application Name"
            value={newShortcut.app || ''}
            onChange={(e) => setNewShortcut({ ...newShortcut, app: e.target.value })}
            className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 focus:bg-gray-800"
          />
          <input
            type="text"
            placeholder="Shortcut Name"
            value={newShortcut.name || ''}
            onChange={(e) => setNewShortcut({ ...newShortcut, name: e.target.value })}
            className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 focus:bg-gray-800"
          />
          <ShortcutRecorder
            value={newShortcut.shortcut || ''}
            onChange={(shortcut) => setNewShortcut({ ...newShortcut, shortcut })}
          />
          <input
            type="text"
            placeholder="Description"
            value={newShortcut.description || ''}
            onChange={(e) => setNewShortcut({ ...newShortcut, description: e.target.value })}
            className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 focus:bg-gray-800"
          />
          <SystemWideToggle
            value={newShortcut.isSystemWide || false}
            onChange={(isSystemWide) => setNewShortcut({ ...newShortcut, isSystemWide })}
          />
          <button
            onClick={saveShortcut}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-md py-1.5 text-sm font-medium transition-colors"
          >
            Add Shortcut
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            className="px-3 py-2 hover:bg-gray-800/50 group"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-white">{shortcut.name}</h3>
                <p className="text-xs text-gray-500">{`${shortcut.app} • ${shortcut.description}`}</p>
              </div>
              <span className="px-2 py-0.5 bg-gray-800/50 text-gray-400 rounded text-xs font-medium group-hover:bg-gray-700/50">
                {shortcut.shortcut}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};