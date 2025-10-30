//
// Environment helpers (CRA requires REACT_APP_ prefix)
//
/**
 * PUBLIC_INTERFACE
 */
export function getEnv(key, fallback = '') {
  /** Read environment variable with optional fallback */
  const val = process.env[key];
  return (val === undefined || val === null || val === '') ? fallback : val;
}

/**
 * PUBLIC_INTERFACE
 */
export function featureFlags() {
  /** Parse REACT_APP_FEATURE_FLAGS into a Set of flags */
  const raw = getEnv('REACT_APP_FEATURE_FLAGS', '');
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  return new Set(list);
}
