import { useEffect } from 'react';

export default function useOnClickOutside(ref, handler, ignoreRef) {
  useEffect(() => {
    const listener = (event) => {
      if (
        !ref.current
        || ref.current.contains(event.target)
        || ignoreRef?.current?.contains(event.target)
      ) {
        return;
      }
      handler(event);
    };
    document.addEventListener('click', listener);
    return () => {
      document.removeEventListener('click', listener);
    };
  }, [ref, handler, ignoreRef]);
}
