import React, { useState } from 'react';
import { ShortcutDropdown } from './components/ShortcutDropdown';
import { SettingsPanel } from './components/SettingsPanel';

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <div className="min-h-screen bg-transparent p-2 overflow-x-hidden">
      {showSettings ? (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      ) : (
        <ShortcutDropdown onOpenSettings={() => setShowSettings(true)} />
      )}
    </div>
  );
};

export default App;