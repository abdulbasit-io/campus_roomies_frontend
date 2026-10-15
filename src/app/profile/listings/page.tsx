import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { Footer, Header } from '@/components/site-chrome';

export default function MyListingsPage() {
  return <><Header /><main className="account-page shell"><div className="account-page-heading"><div><p className="eyebrow">Your account</p><h1>My listings</h1><p>Keep your room listing or room-needed profile up to date.</p></div><Link className="button button-small" href="/listings/new"><Plus size={15} /> New listing</Link></div><div className="account-empty"><FileText size={26} /><h2>No active listings yet.</h2><p>When you are ready, share your room or what you are looking for.</p><Link className="button" href="/listings/new">Create a listing →</Link></div></main><Footer /></>;
}
