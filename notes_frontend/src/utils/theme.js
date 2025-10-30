//
// Ocean Professional theme utilities
//
const palette = {
  primary: '#2563EB',
  secondary: '#F59E0B',
  success: '#F59E0B',
  error: '#EF4444',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
};

/**
 * PUBLIC_INTERFACE
 */
export function applyTheme(mode = 'light') {
  /** Apply CSS variables to document root for theme */
  const root = document.documentElement;
  root.style.setProperty('--color-primary', palette.primary);
  root.style.setProperty('--color-secondary', palette.secondary);
  root.style.setProperty('--color-success', palette.success);
  root.style.setProperty('--color-error', palette.error);
  root.style.setProperty('--color-bg', palette.background);
  root.style.setProperty('--color-surface', palette.surface);
  root.style.setProperty('--color-text', palette.text);
  root.style.setProperty('--shadow', '0 10px 25px rgba(0,0,0,0.05)');
  root.style.setProperty('--radius', '12px');

  // Light/Dark surface tweaks if needed
  if (mode === 'dark') {
    root.style.setProperty('--color-bg', '#0f172a'); // slate-900
    root.style.setProperty('--color-surface', '#111827'); // gray-900
    root.style.setProperty('--color-text', '#f9fafb');
  }
}
