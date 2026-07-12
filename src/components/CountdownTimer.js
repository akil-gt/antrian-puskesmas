'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ calledAt }) {
  const [remaining, setRemaining] = useState(300);

  useEffect(() => {
    if (!calledAt) return;

    const update = () => {
      const elapsed = Math.floor((Date.now() - new Date(calledAt).getTime()) / 1000);
      setRemaining(Math.max(0, 300 - elapsed));
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [calledAt]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining <= 60;

  return (
    <span className={`font-mono text-sm font-bold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}
