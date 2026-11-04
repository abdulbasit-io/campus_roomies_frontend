'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Header, Footer } from '@/components/site-chrome';
import { ListingCard } from '@/components/listing-card';
import { HeroSearch } from '@/components/hero-search';
import { Reveal } from '@/components/reveal';
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

  return <><Header /><main>
    <section className="hero-section"><div className="shell hero-grid"><div className="hero-copy"><Reveal><h1>Find a room.<br /><em>Find the right roommate.</em></h1></Reveal><Reveal delay={90}><p className="hero-lede">Find rooms, compatible roommates, and better housing options around campus.</p></Reveal><div className="hero-role-grid"><Reveal as="article" delay={150}><Link className="hero-role-card" href="/listings/new/room-available"><span><strong>Need a roommate?</strong><small>List your room</small></span><ArrowRight size={18} /></Link></Reveal><Reveal as="article" delay={210}><Link className="hero-role-card hero-role-card-orange" href="/listings/new/room-needed"><span><strong>Looking for a place?</strong><small>Create your profile</small></span><ArrowRight size={18} /></Link></Reveal></div><Reveal delay={270}><div className="hero-browse"><p>Already browsing?</p><HeroSearch /></div></Reveal></div><div className="hero-visual" aria-hidden="true"><div className="hero-visual-orbit hero-visual-orbit-one" /><div className="hero-visual-orbit hero-visual-orbit-two" /><div className="hero-visual-card hero-visual-card-main"><span className="hero-visual-mark"><Image src="/brand/logo-mark.png" alt="" width={24} height={28} /></span><strong>Good spaces<br />start with<br />good matches.</strong></div></div></div></section>
    <Reveal as="section" className="section shell"><div className="section-heading"><div><h2>Rooms around you</h2></div><Link className="arrow-link" href="/browse">View all rooms →</Link></div>{error && <p className="form-error" role="alert">{error}</p>}{loading ? <p className="contact-loading" role="status">Loading active listings…</p> : listings.length ? <div className="listing-grid listing-grid-three">{listings.map((listing, index) => <Reveal as="article" key={listing.id} delay={index * 70}><ListingCard listing={listing} /></Reveal>)}</div> : <div className="empty-state"><h2>No active listings yet.</h2><p>When a listing is published, it will appear here.</p><Link className="button" href="/browse">Explore the catalog</Link></div>}</Reveal>
    <section className="section section-warm"><div className="shell"><Reveal className="center-heading"><h2>Finding a place shouldn&apos;t be complicated.</h2><p>Good housing decisions start with good information. That means clear prices, honest preferences, and no pressure to pretend every place is perfect.</p></Reveal><div className="steps-grid">{steps.map(([number, title, copy], index) => <Reveal as="article" className="step-card" delay={index * 70} key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{copy}</p></Reveal>)}</div></div></section>
    <section className="section shell intent-section"><Reveal className="center-heading"><h2>Everyone is looking for the right roommate.</h2><p>Some students already have a room. Others are still looking for one. Browse available rooms, or make your own preferences visible so the right people can find you.</p></Reveal><div className="intent-grid"><Reveal as="article" delay={60}><Link className="intent-card" href="/browse"><span className="intent-icon"><Home size={21} /></span><div><h3>Find a room</h3><p>Browse available spaces and the people behind them.</p><strong>Explore rooms <ArrowRight size={14} /></strong></div></Link></Reveal><Reveal as="article" delay={130}><Link className="intent-card intent-card-orange" href="/listings/new/room-needed"><span className="intent-icon"><Plus size={21} /></span><div><h3>Looking for a place?</h3><p>Share your preferences so students with a suitable room can find you.</p><strong>Create your profile <ArrowRight size={14} /></strong></div></Link></Reveal></div></section>
    <Reveal as="section" className="shell cta-panel"><div><p className="eyebrow">Your next chapter is somewhere</p><h2>Find somewhere that feels right.</h2><p>Start with a neighbourhood, a budget, or simply the kind of home you want to come back to.</p></div><div className="cta-actions"><Link className="button" href="/browse">Explore rooms →</Link><Link className="button button-secondary" href="/listings/new">List a room</Link></div></Reveal>
  </main><Footer /></>;
}
