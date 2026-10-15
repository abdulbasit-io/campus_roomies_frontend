'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { readStoredIds, savedListingsKey, writeStoredIds } from '@/lib/local-store';

export function SaveButton({ listingId, compact = false }: { listingId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => setSaved(readStoredIds(savedListingsKey).includes(listingId));
    sync();
    window.addEventListener('campus-roomies-storage', sync);
    return () => window.removeEventListener('campus-roomies-storage', sync);
  }, [listingId]);
  return <button className={compact ? 'heart' : 'button button-secondary full-width'} aria-label={saved ? 'Remove from saved rooms' : 'Save listing'} onClick={() => {
    const ids = readStoredIds(savedListingsKey);
    writeStoredIds(savedListingsKey, saved ? ids.filter((id) => id !== listingId) : [...new Set([...ids, listingId])]);
    setSaved(!saved);
  }}><Heart size={compact ? 17 : 15} fill={saved ? 'currentColor' : 'none'} />{!compact && (saved ? 'Saved' : 'Save listing')}</button>;
}
