'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Header, Footer } from '@/components/site-chrome';
import { ListingCard } from '@/components/listing-card';
import { Reveal } from '@/components/reveal';
import { Listing } from '@/lib/domain';
import { searchListings, toCardListing } from '@/lib/frontend-api';
import { useSession } from '@/lib/session';
import { ArrowRight } from 'lucide-react';

const steps = [
  ['01', 'Discover', 'Start with a real place around your institution, not a maze of unrelated listings.'],
  ['02', 'Understand', 'See the price, the living rhythm, and the details that shape daily life.'],
  ['03', 'Connect', 'When a place feels promising, reach the person behind it through a clear WhatsApp handoff.'],
  ['04', 'Settle in', 'Ask the questions that matter and make the next decision with your eyes open.'],
];

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { profile, ready } = useSession();

  useEffect(() => {
    searchListings({ pageSize: 25 }).then((result) => setListings(result.items.map(toCardListing)))
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  return <><Header /><main>
    <section className="hero-section"><div className="shell hero-grid"><div className="hero-copy"><Reveal><h1>Find your roommate</h1></Reveal><Reveal delay={90}><p className="hero-lede">Find compatible roommates and better housing near campus</p></Reveal><div className="hero-role-grid"><Reveal as="article" delay={150}><Link className="hero-role-card" href="/listings/new/room-available"><Image className="hero-role-illustration hero-role-illustration-student" src="/brand/student-walking-transparent.png" alt="" width={174} height={256} priority aria-hidden="true" /><span className="hero-role-copy"><strong>Need a roommate?</strong><span className="hero-role-action">List your room <ArrowRight size={16} /></span></span></Link></Reveal><Reveal as="article" delay={210}><Link className="hero-role-card hero-role-card-orange" href="/listings/new/room-needed"><Image className="hero-role-illustration hero-role-illustration-building" src="/brand/building-search-transparent.png" alt="" width={220} height={265} priority aria-hidden="true" /><span className="hero-role-copy"><strong>Looking for a place?</strong><span className="hero-role-action">Create your profile <ArrowRight size={16} /></span></span></Link></Reveal></div></div></div></section>
    <Reveal as="section" className="section shell">{error && <p className="form-error" role="alert">{error}</p>}{loading ? <p className="contact-loading" role="status">Loading active listings…</p> : listings.length ? <><div className="listing-grid listing-grid-three">{listings.map((listing, index) => <Reveal as="article" key={listing.id} delay={Math.min(index, 5) * 70}><ListingCard listing={listing} /></Reveal>)}</div><div className="home-listings-cta">{ready && profile ? <><h2>Want to see more?</h2><Link className="button" href="/browse">Explore all listings <ArrowRight size={16} /></Link></> : <><h2>Want to see more?</h2><p>To search &amp; view all listings, create your free account.</p><div className="home-listings-actions"><Link className="button button-secondary" href="/listings/new/room-available">List your room</Link><Link className="button button-sage" href="/listings/new/room-needed">Create your profile</Link></div><Link className="home-listings-signin" href="/login">Already have an account? Sign in</Link></>}</div></> : <div className="empty-state"><h2>No active listings yet.</h2><p>When a listing is published, it will appear here.</p><Link className="button" href="/browse">Explore the catalog</Link></div>}</Reveal>
    <section className="section section-warm"><div className="shell"><Reveal className="center-heading"><h2>Finding a place shouldn&apos;t be complicated.</h2><p>Good housing decisions start with good information. That means clear prices, honest preferences, and no pressure to pretend every place is perfect.</p></Reveal><div className="steps-grid">{steps.map(([number, title, copy], index) => <Reveal as="article" className="step-card" delay={index * 70} key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{copy}</p></Reveal>)}</div></div></section>
  </main><Footer /></>;
}
