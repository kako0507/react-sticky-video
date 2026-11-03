import { useCallback, useSyncExternalStore } from 'react';

const getServerSnapshot = () => false;

/** Subscribes to a CSS media query, e.g. `useMediaQuery('(pointer: coarse)')`. */
export default function useMediaQuery(query) {
  const subscribe = useCallback((onChange) => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {};
    }
    const mediaQueryList = window.matchMedia(query);
    mediaQueryList.addEventListener('change', onChange);
    return () => {
      mediaQueryList.removeEventListener('change', onChange);
    };
  }, [query]);

  const getSnapshot = () => (typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia(query).matches
    : false);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
