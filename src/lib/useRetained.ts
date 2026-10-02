import { useRef } from 'react';

/**
 * Keeps the last defined value. Used by detail routes so a record deleted from
 * within the screen keeps rendering while the screen animates away, instead of
 * flashing a "not found" state.
 */
export function useRetained<T>(value: T | undefined): T | undefined {
  const ref = useRef(value);
  if (value !== undefined) ref.current = value;
  return ref.current;
}
