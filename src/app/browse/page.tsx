'use client';
import { useMemo, useState } from 'react';
import { Header, Footer } from '@/components/site-chrome';
import { ListingCard } from '@/components/listing-card';
import { sampleListings } from '@/lib/domain';

export default function BrowsePage() {
  const [area, setArea] = useState('All areas');
  const [roomType, setRoomType] = useState('All room types');
  const filtered = useMemo(() => sampleListings.filter((listing) => (area === 'All areas' || listing.area === area) && (roomType === 'All room types' || listing.roomType === roomType)), [area, roomType]);
  return <><Header /><main className="browse-page shell"><div className="browse-header"><div><p className="eyebrow">Student housing</p><h1>Rooms around your campus</h1><p>Browse spaces with enough detail to imagine your everyday there.</p></div><span className="catalog-pill">Launch catalogue</span></div><div className="filter-bar"><label>Area<select value={area} onChange={(event) => setArea(event.target.value)}><option>All areas</option><option>Camp</option><option>Harmony</option><option>Oluwo</option></select></label><label>Room type<select value={roomType} onChange={(event) => setRoomType(event.target.value)}><option>All room types</option><option>Single room</option><option>Self-contained</option><option>Shared room</option></select></label><button className="filter-reset" onClick={() => { setArea('All areas'); setRoomType('All room types'); }}>Reset filters</button></div><div className="results-summary"><span>{filtered.length} spaces to explore</span><span>Newest first · Page 1</span></div>{filtered.length ? <div className="listing-grid listing-grid-three">{filtered.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <div className="empty-state"><span className="empty-icon">⌂</span><h2>No rooms found just yet.</h2><p>Try widening your search. The right place may be one neighbourhood over.</p><button className="button" onClick={() => { setArea('All areas'); setRoomType('All room types'); }}>Clear filters</button></div>}</main><Footer /></>;
}
