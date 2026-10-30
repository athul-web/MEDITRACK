import { useState, useEffect } from 'react';

/**
 * Simple hook that returns a `Date` object updated every second.
 * The interval is cleaned up automatically on unmount.
 */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1_000);

    return () => clearInterval(interval);
  }, []);

  return now;
}
