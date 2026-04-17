import { useEffect, useState } from 'react';

export function useLocalStorage(key: string, initial = '') {
  const [value, setValue] = useState<string>(() => {
    try {
      return localStorage.getItem(key) ?? initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch {
      // ignore (private mode, quota, etc.)
    }
  }, [key, value]);

  return [value, setValue] as const;
}
