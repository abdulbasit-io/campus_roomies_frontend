'use client';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { sampleListings } from '@/lib/domain';
import { getSavedListings } from '@/lib/local-store';
import { ListingCard } from '@/components/listing-card';
import { useEffect, useState } from 'react';

export function SavedRooms() {
  const [saved, setSaved] = useState(() => getSavedListings(sampleListings));
  useEffect(() => { const sync = () => setSaved(getSavedListings(sampleListings)); window.addEventListener('campus-roomies-storage', sync); return () => window.removeEventListener('campus-roomies-storage', sync); }, []);
  if (!saved.length) return <div className="account-empty"><Bookmark size={26} /><h2>Your saved rooms will appear here.</h2><p>Browse rooms and save the ones you want to think about.</p><Link className="button" href="/browse">Browse rooms →</Link></div>;
  return <div className="listing-grid listing-grid-three">{saved.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>;
}
