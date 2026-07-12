'use client';

import { useState, useEffect, useRef } from 'react';

export function usePolling(fetchFn, interval = 5000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef(fetchFn);

  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const result = await fetchRef.current();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    const id = setInterval(fetchData, interval);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [interval]);

  return { data, error, loading };
}
