import { useTheme } from '../hooks/useTheme';

const LABELS = { auto: '自動', light: '淺色', dark: '深色' } as const;

export function ThemeToggle() {
  const { pref, cycle } = useTheme();
  return (
    <button
      className="theme-toggle"
      onClick={cycle}
      title="切換主題（自動 / 淺色 / 深色）"
      aria-label={`主題：${LABELS[pref]}`}
    >
      {LABELS[pref]}
    </button>
  );
}
