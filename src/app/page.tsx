'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Header, Footer } from '@/components/site-chrome';
import { ListingCard } from '@/components/listing-card';
import { HeroSearch } from '@/components/hero-search';
import { ResilientImage } from '@/components/resilient-image';
import { Listing } from '@/lib/domain';
import { searchListings, toCardListing } from '@/lib/frontend-api';
import { ArrowRight, Home, Plus } from 'lucide-react';

const steps = [
  ['01', 'Discover', 'Start with a real place around your institution, not a maze of unrelated listings.'],
  ['02', 'Understand', 'See the price, the distance, the living rhythm, and the details that shape daily life.'],
  ['03', 'Connect', 'When a place feels promising, reach the person behind it through a clear WhatsApp handoff.'],
  ['04', 'Settle in', 'Ask the questions that matter and make the next decision with your eyes open.'],
];

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchListings({ pageSize: 3 }).then((result) => setListings(result.items.map(toCardListing)))
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  const featured = listings[0];

  return <><Header /><main>
    <section className="hero-section"><div className="shell hero-grid"><div className="hero-copy"><h1>Find a room.<br /><em>Find your people.</em></h1><p className="hero-lede">Whether you have a room to share or need one to call home, start with the people and places that make campus life feel a little easier.</p><HeroSearch /><Link className="hero-listing-link" href="/listings/new/room-available"><Plus size={16} /> Have a room to share? <strong>List a room</strong></Link><p className="hero-note">Browse first. Sign in only when you are ready to connect.</p></div>{featured && <Link href={`/listings/${featured.id}`} className="hero-feature"><ResilientImage src={featured.image} alt={featured.title} className="feature-image" sizes="(max-width: 850px) 100vw, 45vw" /><div className="feature-overlay"><span className="status-dot" /> {featured.availability}</div><div className="feature-content"><p className="listing-kicker">{featured.roomType} · {featured.area}</p><h2>{featured.title}</h2><p>{featured.institution}</p><div className="feature-footer"><strong>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(featured.price)} <small>/ {featured.period}</small></strong><span>View details →</span></div></div></Link>}</div></section>
    <section className="section shell"><div className="section-heading"><div><h2>Rooms around you</h2></div><Link className="arrow-link" href="/browse">View all rooms →</Link></div>{error && <p className="form-error" role="alert">{error}</p>}{loading ? <p className="contact-loading" role="status">Loading active listings…</p> : listings.length ? <div className="listing-grid listing-grid-three">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div> : <div className="empty-state"><h2>No active listings yet.</h2><p>When a listing is published, it will appear here.</p><Link className="button" href="/browse">Explore the catalog</Link></div>}</section>
    <section className="section section-warm"><div className="shell"><div className="center-heading"><h2>Finding a place shouldn&apos;t be complicated.</h2><p>Good housing decisions start with good information. That means clear prices, honest preferences, and no pressure to pretend every place is perfect.</p></div><div className="steps-grid">{steps.map(([number, title, copy]) => <div className="step-card" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{copy}</p></div>)}</div></div></section>
    <section className="section shell intent-section"><div className="center-heading"><h2>Everyone is looking for the right roommate.</h2><p>Some students already have a room. Others are still looking for one. Browse available rooms, or make your own preferences visible so the right people can find you.</p></div><div className="intent-grid"><Link className="intent-card" href="/browse"><span className="intent-icon"><Home size={21} /></span><div><h3>Find a room</h3><p>Browse available spaces and the people behind them.</p><strong>Explore rooms <ArrowRight size={14} /></strong></div></Link><Link className="intent-card intent-card-orange" href="/listings/new/room-needed"><span className="intent-icon"><Plus size={21} /></span><div><h3>I need a room</h3><p>Share your preferences so students with a suitable room can find you.</p><strong>Create a room-needed listing <ArrowRight size={14} /></strong></div></Link></div></section>
    <section className="shell cta-panel"><div><p className="eyebrow">Your next chapter is somewhere</p><h2>Find somewhere that feels right.</h2><p>Start with a neighbourhood, a budget, or simply the kind of home you want to come back to.</p></div><div className="cta-actions"><Link className="button" href="/browse">Explore rooms →</Link><Link className="button button-secondary" href="/listings/new">List a room</Link></div></section>
  </main><Footer /></>;
}
