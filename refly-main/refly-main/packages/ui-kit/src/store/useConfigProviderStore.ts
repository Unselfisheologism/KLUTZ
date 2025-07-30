import { type ThemeConfig, theme } from 'antd';
import { create } from 'zustand';
import merge from 'deepmerge';

export interface ConfigProviderState {
  theme: ThemeConfig;
  updateTheme: (config: Partial<ThemeConfig>) => void;
}

export const useConfigProviderStore = create<ConfigProviderState>((set) => ({
  theme: {
    cssVar: {
      key: 'refly',
    },
    token: {
      colorPrimary: '#0E9F77',
      borderRadius: 8,
      controlItemBgActive: 'var(--refly-tertiary-hover)',
      controlItemBgActiveHover: 'var(--refly-tertiary-hover)',
    },
    algorithm: theme.defaultAlgorithm,
  },
  updateTheme: (config) =>
    set((state) => ({
      theme: merge(state.theme, config, {
        arrayMerge: (_target, source) => source,
      }),
    })),
}));
