'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  typingSpeed: number;
  fadeInDuration: number;
  fadeInDelay: number;
}

interface SettingsState extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  typingSpeed: 50,      // 打字速度 (ms)
  fadeInDuration: 300,   // 渐显动画时长 (ms)
  fadeInDelay: 50,      // 字符间渐显延迟 (ms)
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({ ...state, ...newSettings })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
