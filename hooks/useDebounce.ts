import { useState, useEffect } from 'react';

/**
 * Debounce de valor — retorna o valor só após `delay` ms sem mudança.
 *
 * Uso: const debouncedQuery = useDebounce(query, 300);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
