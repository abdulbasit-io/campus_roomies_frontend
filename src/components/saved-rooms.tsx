'use client';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Listing } from '@/lib/domain';
import { ApiRequestError } from '@/lib/api';
import { getPublicListing, toCardListing } from '@/lib/frontend-api';
import { readStoredIds, savedListingsKey } from '@/lib/local-store';
import { ListingCard } from '@/components/listing-card';
import { useEffect, useState } from 'react';

export function SavedRooms() {
  const [saved, setSaved] = useState<Listing[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const sync = async () => {
      setLoading(true);
      setError('');
      const ids = readStoredIds(savedListingsKey);
      const results = await Promise.allSettled(ids.map((id) => getPublicListing(id)));
      if (!active) return;
      const failures = results.filter((result) => result.status === 'rejected'
        && !(result.reason instanceof ApiRequestError && result.reason.status === 410));
      if (failures.length) setError('Some saved listings could not be loaded. Please try again.');
      setSaved(results.flatMap((result) => result.status === 'fulfilled' ? [toCardListing(result.value)] : []));
      setLoading(false);
    };
    void sync();
    window.addEventListener('campus-roomies-storage', sync);
    return () => { active = false; window.removeEventListener('campus-roomies-storage', sync); };
  }, []);
  if (loading) return <p className="contact-loading" role="status">Loading saved rooms…</p>;
  if (error) return <><p className="form-error" role="alert">{error}</p>{saved.length > 0 && <div className="listing-grid listing-grid-three">{saved.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>}</>;
  if (!saved.length) return <div className="account-empty"><Bookmark size={26} /><h2>Your saved rooms will appear here.</h2><p>Browse rooms and save the ones you want to think about.</p><Link className="button" href="/browse">Browse rooms →</Link></div>;
  return <div className="listing-grid listing-grid-three">{saved.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>;
}
