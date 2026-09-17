import { useState, useEffect } from 'react';

/**
 * Hook untuk menunda update nilai (mencegah request berulang saat mengetik di search bar)
 * @param {any} value - Nilai yang ingin di-debounce
 * @param {number} delay - Jeda waktu dalam ms (default 500ms)
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
