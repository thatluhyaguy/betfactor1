'use client';

import { useState, useEffect } from 'react';

function formatAge(detectedAt: string): string {
  const seconds = Math.floor((Date.now() - new Date(detectedAt).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function ArbAge({ detectedAt }: { detectedAt: string }) {
  const [label, setLabel] = useState(() => formatAge(detectedAt));

  useEffect(() => {
    const interval = setInterval(() => setLabel(formatAge(detectedAt)), 5000);
    return () => clearInterval(interval);
  }, [detectedAt]);

  // Flag data that's getting stale — honesty about data age matters here
  const isStale = Date.now() - new Date(detectedAt).getTime() > 5 * 60 * 1000;

  return (
    <span className={`arb-age${isStale ? ' arb-age-stale' : ''}`} title={new Date(detectedAt).toLocaleTimeString()}>
      {label}
    </span>
  );
}
