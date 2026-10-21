'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Plus, Users } from 'lucide-react';
import { Footer, Header } from '@/components/site-chrome';
import {
  getListingInterests,
  ListingInterest,
  listMyListings,
  markListingFound,
  OwnedDraft,
} from '@/lib/frontend-api';

export default function MyListingsPage() {
  const [items, setItems] = useState<OwnedDraft[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    listMyListings().then(setItems).catch((cause: Error) => setError(cause.message)).finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function markFound(id: string) {
    setError('');
    try {
      await markListingFound(id);
      refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update this listing.');
    }
  }

  return <><Header /><main className="account-page shell"><div className="account-page-heading"><div><h1>My listings</h1><p>Keep your room listing or room-needed profile up to date.</p></div><Link className="button button-small" href="/listings/new"><Plus size={15} /> New listing</Link></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading ? <p className="contact-loading" role="status">Loading your listings…</p> : items.length === 0 ? <div className="account-empty"><FileText size={26} /><h2>No listings yet.</h2><p>When you are ready, share your room or what you are looking for.</p><Link className="button" href="/listings/new">Create a listing →</Link></div> : <div className="admin-area-list">{items.map((item) => {
      const amount = item.intent === 'ROOM_NEEDED' ? item.target_budget_amount : item.price_amount;
      const period = item.intent === 'ROOM_NEEDED' ? item.target_budget_period : item.price_period;
      const editPath = item.intent === 'ROOM_NEEDED' ? '/listings/new/room-needed' : '/listings/new/room-available';
      return <article className="admin-panel account-listing-card" key={item.id}><div className="account-listing-summary"><strong>{item.title || (item.intent === 'ROOM_NEEDED' ? 'Room-needed listing' : 'Untitled draft')}</strong><small>{item.intent === 'ROOM_NEEDED' ? 'Looking for a room' : 'Room available'} · {item.status}</small>{amount && <small>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)} / {period?.toLowerCase()}</small>}</div><div className="admin-row-actions"><Link className="admin-action-link" href={item.status === 'DRAFT' ? `${editPath}?draft=${item.id}` : `/listings/${item.id}`}>{item.status === 'DRAFT' ? 'Resume draft' : 'View listing'}</Link>{item.status === 'ACTIVE' && <button className="admin-action-link" onClick={() => markFound(item.id)}>Mark found</button>}</div>{item.status !== 'DRAFT' && <ListingInterestPanel listingId={item.id} />}</article>;
    })}</div>}
  </main><Footer /></>;
}

function ListingInterestPanel({ listingId }: { listingId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [interests, setInterests] = useState<ListingInterest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  async function loadInterests() {
    setLoading(true);
    setError('');
    try {
      setInterests(await getListingInterests(listingId));
      setLoaded(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load listing interest.');
    } finally {
      setLoading(false);
    }
  }

  async function toggle() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded && !loaded && !loading) await loadInterests();
  }

  return (
    <section className="account-interest-panel" aria-label="Listing interest">
      <button className="account-interest-toggle" type="button" aria-expanded={expanded} onClick={() => { void toggle(); }}>
        <span><Users size={17} /> View people interested</span>
        {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {expanded && <div className="account-interest-content">
        {loading && <p className="contact-loading" role="status">Loading interest…</p>}
        {error && <div><p className="form-error" role="alert">{error}</p><button className="admin-action-link" type="button" onClick={() => { void loadInterests(); }}>Retry</button></div>}
        {!loading && !error && loaded && interests.length === 0 && <p className="admin-muted">No one has registered interest yet.</p>}
        {!loading && !error && interests.length > 0 && <div className="account-interest-list">
          {interests.map((interest) => {
            const tags = [
              interest.roommateGender && `Roommate preference: ${interest.roommateGender.toLowerCase()}`,
              interest.preferredAcademicLevel && `Level: ${interest.preferredAcademicLevel}`,
              interest.studyAtmosphere,
              interest.smokingRule,
              interest.utilityPreference,
              ...interest.lifestyleTraits,
            ].filter((tag): tag is string => Boolean(tag));
            return <article className="account-interest-person" key={interest.id}>
              <div className="account-interest-person-heading">
                <span className="account-interest-avatar" style={interest.photoUrl ? { backgroundImage: `url("${interest.photoUrl}")` } : undefined}>
                  {!interest.photoUrl && interest.displayName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <Link className="account-interest-name" href={`/users/${interest.seekerId}`}>{interest.displayName}</Link>
                  <p>{[interest.institution, interest.department, interest.academicLevel].filter(Boolean).join(' · ') || 'Student'}</p>
                </div>
                <time dateTime={interest.createdAt}>{new Date(interest.createdAt).toLocaleDateString()}</time>
              </div>
              {interest.about && <p className="account-interest-about">{interest.about}</p>}
              {tags.length > 0 && <div className="tag-row">{tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>}
            </article>;
          })}
        </div>}
      </div>}
    </section>
  );
}
