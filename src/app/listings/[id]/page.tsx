'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Flag, MapPin } from 'lucide-react';
import { Header, Footer } from '@/components/site-chrome';
import { ContactGate } from '@/components/contact-gate';
import { ListingCard } from '@/components/listing-card';
import { SaveButton } from '@/components/save-button';
import { ApiRequestError } from '@/lib/api';
import { ApiListing, getPublicListing, searchListings, toCardListing } from '@/lib/frontend-api';
import { formatNaira, Listing } from '@/lib/domain';

function preferenceLabel(key: keyof NonNullable<ApiListing['preferences']>, value: string | null | undefined) {
  if (!value) return null;
  const labels: Record<string, string> = {
    roommateGender: 'Roommate gender',
    academicLevel: 'Academic level',
    studyAtmosphere: 'Study atmosphere',
    smokingRule: 'Smoking',
    utilityPreference: 'Utilities',
  };
  return <div key={key}><strong>{labels[key] ?? key}</strong><span>{value}</span></div>;
}

export default function ListingDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [listing, setListing] = useState<ApiListing | null>(null);
  const [related, setRelated] = useState<Listing[]>([]);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    getPublicListing(id).then((item) => {
      setListing(item);
      return searchListings({ institutionId: item.institutionId, pageSize: 4 });
    }).then((result) => {
      setRelated(result.items.filter((item) => item.id !== id).map(toCardListing));
    }).catch((cause: unknown) => {
      if (cause instanceof ApiRequestError && cause.status === 410) {
        setUnavailable(true);
      } else {
        setError(cause instanceof Error ? cause.message : 'Unable to load this listing.');
      }
    });
  }, [id]);

  if (unavailable) return <><Header /><main className="details-page shell"><Link className="back-link" href="/browse"><ArrowLeft size={14} /> Back to rooms</Link><div className="empty-state"><h1>This listing is no longer available.</h1><p>It may have been found or temporarily restricted. Browse active listings to find another option.</p><Link className="button" href="/browse">Browse active listings</Link></div></main><Footer /></>;
  if (error) return <><Header /><main className="details-page shell"><Link className="back-link" href="/browse"><ArrowLeft size={14} /> Back to rooms</Link><p className="form-error" role="alert">{error}</p></main><Footer /></>;
  if (!listing) return <><Header /><main className="details-page shell"><p className="contact-loading" role="status">Loading listing…</p></main><Footer /></>;

  const card = toCardListing(listing);
  const photos = listing.images?.map((image) => image.url) ?? [];
  const amount = listing.priceAmount ?? listing.targetBudgetAmount ?? 0;
  const period = (listing.pricePeriod ?? listing.targetBudgetPeriod) === 'YEAR' ? 'year' : 'session';
  const preferences = listing.preferences ?? {};
  const preferenceEntries = ([
    ['roommateGender', preferences.roommateGender],
    ['academicLevel', preferences.academicLevel],
    ['studyAtmosphere', preferences.studyAtmosphere],
    ['smokingRule', preferences.smokingRule],
    ['utilityPreference', preferences.utilityPreference],
  ] as const).map(([key, value]) => preferenceLabel(key, value)).filter(Boolean);

  return <><Header /><main className="details-page shell">
    <Link className="back-link" href="/browse"><ArrowLeft size={14} /> Back to rooms</Link>
    <div className="details-grid"><div>
      <div className="details-gallery">
        <div className="gallery-main" style={photos[0] ? { backgroundImage: `url("${photos[0]}")` } : undefined} />
        <div className="gallery-thumbs">{[1, 2, 3].map((index) => <div key={index} style={photos[index] ? { backgroundImage: `url("${photos[index]}")` } : undefined} />)}</div>
      </div>
      <div className="details-heading"><div><p className="eyebrow">{card.roomType} · {card.availability}</p><h1>{listing.title}</h1><p className="details-location"><MapPin size={14} /> {listing.institution} · {listing.area}{listing.landmark ? ` · ${listing.landmark}` : ''}</p></div><span className="soft-badge">Active listing</span></div>
      <section className="content-card"><h2>{listing.intent === 'ROOM_NEEDED' ? 'About this seeker' : 'About this place'}</h2><p>{listing.intent === 'ROOM_NEEDED' ? listing.about ?? listing.description : listing.description}</p>{listing.intent === 'ROOM_NEEDED' && listing.targetArea && <p className="muted">Preferred area: {listing.targetArea}</p>}{card.features.length > 0 && <div className="tag-row">{card.features.map((feature) => <span className="tag" key={feature}>{feature}</span>)}</div>}</section>
      {(preferenceEntries.length > 0 || preferences.lifestyleTraits?.length) && <section className="content-card"><h2>Living preferences</h2><p className="muted">Clear expectations make shared homes easier.</p><div className="preference-grid">{preferenceEntries}{preferences.lifestyleTraits?.map((trait) => <div key={trait}><strong>Lifestyle</strong><span>{trait}</span></div>)}</div></section>}
      <section className="content-card owner-card"><div className="owner-avatar owner-avatar-large">CR</div><div><h2>Campus Roomies member</h2><p className="muted">Listing owner</p><p className="owner-note">Contact details stay private until an eligible contact handoff.</p></div></section>
      <Link className="report-link" href={`/report?listing=${listing.id}`}><Flag size={13} /> Report this listing if something feels wrong</Link>
    </div><aside className="details-aside"><div className="price-card"><p className="eyebrow">{listing.intent === 'ROOM_NEEDED' ? 'Target budget' : `Rent per ${period}`}</p><strong>{formatNaira(amount)} <small>/ {period}</small></strong><p>{listing.intent === 'ROOM_NEEDED' ? 'This student is looking for a space within this budget.' : 'Talk directly with the lister on WhatsApp. Campus Roomies does not hold payments or deposits.'}</p>{listing.intent === 'ROOM_AVAILABLE' && <ContactGate listingId={listing.id} />}<SaveButton listingId={listing.id} /></div><div className="notice-card"><strong>Take your time.</strong><p>Visit in person, ask questions, and never transfer money before you are comfortable with the arrangement.</p></div></aside></div>
    {related.length > 0 && <section className="section related-section"><div className="section-heading"><div><p className="eyebrow">Keep looking</p><h2>More rooms near your institution</h2></div></div><div className="listing-grid listing-grid-three">{related.map((item) => <ListingCard key={item.id} listing={item} compact />)}</div></section>}
  </main><Footer /></>;
}
