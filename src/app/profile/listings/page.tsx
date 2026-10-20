'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Footer, Header } from '@/components/site-chrome';
import { listMyListings, markListingFound, OwnedDraft } from '@/lib/frontend-api';

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

  return <><Header /><main className="account-page shell"><div className="account-page-heading"><div><p className="eyebrow">Your account</p><h1>My listings</h1><p>Keep your room listing or room-needed profile up to date.</p></div><Link className="button button-small" href="/listings/new"><Plus size={15} /> New listing</Link></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading ? <p className="contact-loading" role="status">Loading your listings…</p> : items.length === 0 ? <div className="account-empty"><FileText size={26} /><h2>No listings yet.</h2><p>When you are ready, share your room or what you are looking for.</p><Link className="button" href="/listings/new">Create a listing →</Link></div> : <div className="admin-area-list">{items.map((item) => {
      const amount = item.intent === 'ROOM_NEEDED' ? item.target_budget_amount : item.price_amount;
      const period = item.intent === 'ROOM_NEEDED' ? item.target_budget_period : item.price_period;
      const editPath = item.intent === 'ROOM_NEEDED' ? '/listings/new/room-needed' : '/listings/new/room-available';
      return <article className="admin-panel admin-area-row" key={item.id}><div><strong>{item.title || (item.intent === 'ROOM_NEEDED' ? 'Room-needed listing' : 'Untitled draft')}</strong><small>{item.intent === 'ROOM_NEEDED' ? 'Looking for a room' : 'Room available'} · {item.status}</small>{amount && <small>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)} / {period?.toLowerCase()}</small>}</div><div className="admin-row-actions"><Link className="admin-action-link" href={item.status === 'DRAFT' ? `${editPath}?draft=${item.id}` : `/listings/${item.id}`}>{item.status === 'DRAFT' ? 'Resume draft' : 'View listing'}</Link>{item.status === 'ACTIVE' && <button className="admin-action-link" onClick={() => markFound(item.id)}>Mark found</button>}</div></article>;
    })}</div>}
  </main><Footer /></>;
}
