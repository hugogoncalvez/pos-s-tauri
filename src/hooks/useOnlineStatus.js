/**
 * This hook is intentionally left blank.
 * The online status detection has been moved directly into AuthContext.jsx
 * to use the simpler navigator.onLine implementation.
 * This file is kept to avoid breaking imports, but it no longer performs any action.
 */
export const useOnlineStatus = () => {
  // The return values are placeholders to prevent crashes in components that might still destructure them.
  // The primary online status is now managed in AuthContext.
  return { isOnline: navigator.onLine, isInternetOnline: navigator.onLine, isServerOnline: navigator.onLine };
};