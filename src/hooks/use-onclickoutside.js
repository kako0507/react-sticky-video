import _ from 'lodash';
import { useEffect } from 'react';

export default function useOnClickOutside(ref, handler, ignoreElement) {
  useEffect(
    () => {
      const listener = (event) => {
        if (_.some([
          !ref.current,
          ref.current.contains(event.target),
          ignoreElement && ignoreElement.contains(event.target),
        ])) {
          return;
        }
        handler(event);
      };
      document.addEventListener('click', listener);
      return () => {
        document.removeEventListener('click', listener);
      };
    },
    [ref, handler, ignoreElement],
  );
}
