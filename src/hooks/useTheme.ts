import { useEffect, useState } from 'react';

type ThemePref = 'auto' | 'light' | 'dark';

const KEY = 'scrumpoint:theme';

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'auto' || v === 'light' || v === 'dark') return v;
  } catch {
    // ignore
  }
  return 'auto';
}

function resolve(pref: ThemePref): 'light' | 'dark' {
  if (pref !== 'auto') return pref;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(readPref);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, pref);
    } catch {
      // ignore
    }
    document.documentElement.dataset.theme = resolve(pref);

    if (pref !== 'auto') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      document.documentElement.dataset.theme = mql.matches ? 'dark' : 'light';
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [pref]);

  const cycle = () => {
    setPref((p) => (p === 'auto' ? 'light' : p === 'light' ? 'dark' : 'auto'));
  };

  return { pref, cycle };
}
