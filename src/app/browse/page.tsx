'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Header, Footer } from '@/components/site-chrome';
import { ListingCard } from '@/components/listing-card';
import { Institution, InstitutionArea, searchListings, listAreas, listInstitutions, toCardListing } from '@/lib/frontend-api';
import type { Listing } from '@/lib/domain';

export default function BrowsePage() {
  return <Suspense fallback={<main className="browse-page shell"><p className="contact-loading" role="status">Loading listings…</p></main>}><BrowseContent /></Suspense>;
}

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedInstitutionId = searchParams.get('institutionId') ?? '';
  const requestedArea = searchParams.get('area') ?? '';
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [areas, setAreas] = useState<InstitutionArea[]>([]);
  const [institutionId, setInstitutionId] = useState(requestedInstitutionId);
  const [areaId, setAreaId] = useState(searchParams.get('areaId') ?? '');
  const [intent, setIntent] = useState(searchParams.get('intent') ?? '');
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listInstitutions().then((items) => {
      setInstitutions(items);
    }).catch((cause: Error) => setError(cause.message));
  }, []);

  useEffect(() => {
    if (!requestedInstitutionId && !institutionId && institutions.length === 1) {
      setInstitutionId(institutions[0].id);
    }
    if (requestedInstitutionId && requestedInstitutionId !== institutionId) {
      setInstitutionId(requestedInstitutionId);
    }
  }, [institutionId, institutions, requestedInstitutionId]);

  useEffect(() => {
    if (!institutionId) {
      setAreas([]);
      setAreaId('');
      return;
    }
    listAreas(institutionId).then((items) => {
      setAreas(items);
      if (areaId && !items.some((item) => item.id === areaId)) setAreaId('');
      if (requestedArea && (!areaId || areaId === '')) {
        const match = items.find((item) => item.name.toLowerCase() === requestedArea.toLowerCase());
        if (match) setAreaId(match.id);
      }
    }).catch((cause: Error) => setError(cause.message));
  }, [areaId, institutionId, requestedArea]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    searchListings({
      institutionId: institutionId || undefined,
      areaId: areaId || undefined,
      intent: intent ? intent as 'ROOM_AVAILABLE' | 'ROOM_NEEDED' : undefined,
      page,
      pageSize: 12,
    }).then((result) => {
      setListings(result.items.map(toCardListing));
      setTotal(result.total);
    }).catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, [areaId, institutionId, intent, page]);

  useEffect(() => { load(); }, [load]);

  function reset() {
    setInstitutionId('');
    setAreaId('');
    setIntent('');
    setPage(1);
    router.push('/browse');
  }

  return <><Header /><main className="browse-page shell">
    <div className="browse-header"><div><h1>Rooms around your campus</h1><p>Browse spaces with enough detail to imagine your everyday there.</p></div><span className="catalog-pill">Live listings</span></div>
    <div className="filter-bar">
      <label>Institution<select value={institutionId} onChange={(event) => { setInstitutionId(event.target.value); setAreaId(''); setPage(1); }}><option value="">All institutions</option>{institutions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Area<select value={areaId} onChange={(event) => { setAreaId(event.target.value); setPage(1); }} disabled={!institutionId}><option value="">All areas</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>
      <label>Listing type<select value={intent} onChange={(event) => { setIntent(event.target.value); setPage(1); }}><option value="">All listing types</option><option value="ROOM_AVAILABLE">Room available</option><option value="ROOM_NEEDED">Room needed</option></select></label>
      <button className="filter-reset" onClick={reset}>Reset filters</button>
    </div>
    <div className="results-summary"><span>{loading ? 'Loading listings…' : `${total} spaces to explore`}</span><span>Newest first · Page {page}</span></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading ? <p className="contact-loading" role="status">Loading active listings…</p> : listings.length ? <div className="listing-grid listing-grid-three">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <div className="empty-state"><span className="empty-icon">⌂</span><h2>No rooms found just yet.</h2><p>Try widening your search. The right place may be one neighbourhood over.</p><button className="button" onClick={reset}>Clear filters</button></div>}
    {!loading && total > 12 && <div className="admin-pagination"><button className="button button-secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page} of {Math.ceil(total / 12)}</span><button className="button button-secondary" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage((current) => current + 1)}>Next</button></div>}
  </main><Footer /></>;
}
