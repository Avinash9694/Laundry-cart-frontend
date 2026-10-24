import { useCallback, useEffect, useState } from 'react';
import { readJson, safeLocalStorage, writeJson } from '@/lib/storage';

export type Theme = 'light' | 'dark';
const KEY = 'laundry-cart.theme';

function systemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveInitialTheme(): Theme {
  const saved = readJson<Theme | null>(safeLocalStorage(), KEY, null);
  return saved === 'dark' || saved === 'light' ? saved : systemTheme();
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset['theme'] = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      writeJson(safeLocalStorage(), KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
