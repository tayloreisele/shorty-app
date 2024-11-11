import React, { useState, useCallback, useEffect } from 'react';
import { formatKeys } from '../utils/keyboard';

interface ShortcutRecorderProps {
  value: string;
  onChange: (value: string) => void;
}

export const ShortcutRecorder: React.FC<ShortcutRecorderProps> = ({ value, onChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [activeModifiers, setActiveModifiers] = useState<string[]>([]);
  const [recordedModifiers, setRecordedModifiers] = useState<string[]>([]);
  const [mainKey, setMainKey] = useState<string | null>(null);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const key = e.key;
    
    if (['Meta', 'Control', 'Alt', 'Shift'].includes(key)) {
      setActiveModifiers(prev => Array.from(new Set([...prev, key])));
      setRecordedModifiers(prev => Array.from(new Set([...prev, key])));
      return;
    }

    if (!mainKey) {
      setMainKey(key);
      setRecordedModifiers(activeModifiers);
    }
  }, [activeModifiers, mainKey]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const key = e.key;

    if (['Meta', 'Control', 'Alt', 'Shift'].includes(key)) {
      setActiveModifiers(prev => prev.filter(k => k !== key));
      return;
    }

    if (key === mainKey) {
      const shortcut = formatKeys(recordedModifiers, mainKey);
      onChange(shortcut);
      setIsRecording(false);
      setActiveModifiers([]);
      setRecordedModifiers([]);
      setMainKey(null);
    }
  }, [mainKey, recordedModifiers, onChange]);

  useEffect(() => {
    if (isRecording) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [isRecording, handleKeyDown, handleKeyUp]);

  const getCurrentDisplay = () => {
    if (!isRecording) return value;
    if (activeModifiers.length === 0 && !mainKey) return 'Recording... Press key combination';
    return formatKeys(mainKey ? recordedModifiers : activeModifiers, mainKey);
  };

  return (
    <button
      type="button"
      onClick={() => {
        setIsRecording(true);
        setActiveModifiers([]);
        setRecordedModifiers([]);
        setMainKey(null);
      }}
      onBlur={() => {
        if (!mainKey && activeModifiers.length === 0) {
          setIsRecording(false);
        }
      }}
      className={`w-full text-left bg-gray-800/50 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600 focus:bg-gray-800 ${
        isRecording ? 'ring-1 ring-gray-600 bg-gray-800' : ''
      }`}
    >
      {getCurrentDisplay() ? (
        <span className={isRecording && !mainKey && activeModifiers.length === 0 ? 'text-gray-400' : 'font-medium'}>
          {getCurrentDisplay()}
        </span>
      ) : (
        <span className="text-gray-500">Click to record shortcut</span>
      )}
    </button>
  );
};