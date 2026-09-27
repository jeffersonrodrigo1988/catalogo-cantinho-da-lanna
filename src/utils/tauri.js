export function isTauri() {
  if (typeof window === 'undefined') return false;

  if (window.__TAURI_INTERNALS__) return true;
  if (window.__TAURI__) return true;

  return false;
}