'use client';

import React from 'react';
import { useSettingsStore } from '../store/settings';
import { useThemeStore } from '../store/theme';
import { Slider } from "./ui/slider"
import { Switch } from "./ui/switch"

export const SettingsPanel: React.FC = () => {
  const { typingSpeed, fadeInDuration, fadeInDelay, updateSettings } = useSettingsStore();
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold">Settings</h2>
      
      {/* Typing Speed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xl font-medium">Typing Speed</label>
          <span className="text-xl text-muted-foreground">{typingSpeed}ms</span>
        </div>
        <Slider
          min={10}
          max={200}
          step={10}
          value={[typingSpeed]}
          onValueChange={([value]) => updateSettings({ typingSpeed: value })}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">Delay between each character appearing</p>
      </div>

      {/* Fade In Duration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xl font-medium">Fade Duration</label>
          <span className="text-xl text-muted-foreground">{fadeInDuration}ms</span>
        </div>
        <Slider
          min={100}
          max={1000}
          step={100}
          value={[fadeInDuration]}
          onValueChange={([value]) => updateSettings({ fadeInDuration: value })}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">How long each character takes to fade in</p>
      </div>

      {/* Fade In Delay */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xl font-medium">Fade Delay</label>
          <span className="text-xl text-muted-foreground">{fadeInDelay}ms</span>
        </div>
        <Slider
          min={0}
          max={200}
          step={10}
          value={[fadeInDelay]}
          onValueChange={([value]) => updateSettings({ fadeInDelay: value })}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">Delay between each character's fade animation</p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <label className="text-xl font-medium block">Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          className="w-full text-xl p-3 border rounded-lg bg-transparent hover:bg-accent transition-colors"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
    </div>
  );
};

export default SettingsPanel;
