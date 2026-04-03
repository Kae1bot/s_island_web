import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
  readonly musicVolume: number;   // 0–100
  readonly sfxVolume: number;     // 0–100
  readonly musicEnabled: boolean;
  readonly sfxEnabled: boolean;
  readonly autoConfirm: boolean;  // auto-confirm single-option phases
  readonly showDamageNumbers: boolean;
  readonly animationSpeed: 'off' | 'fast' | 'normal';
}

interface SettingsActions {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
}

const DEFAULTS: Settings = {
  musicVolume: 70,
  sfxVolume: 80,
  musicEnabled: true,
  sfxEnabled: true,
  autoConfirm: false,
  showDamageNumbers: true,
  animationSpeed: 'normal',
};

export type SettingsStore = Settings & SettingsActions;

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (key, value) => set({ [key]: value }),
      reset: () => set(DEFAULTS),
    }),
    { name: 'spirit-island-settings-v1' },
  ),
);
