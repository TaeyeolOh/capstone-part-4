import { useEffect, RefObject } from 'react';

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>, 
  handler: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }
    
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
}

export default useClickOutside;
