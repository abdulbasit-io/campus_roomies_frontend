'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Flag, MapPin, X } from 'lucide-react';
import { Header, Footer } from '@/components/site-chrome';
import { ContactGate } from '@/components/contact-gate';
import { ListingCard } from '@/components/listing-card';
import { SaveButton } from '@/components/save-button';
import { ApiRequestError } from '@/lib/api';
import { ApiListing, getOwnedListing, getPublicListing, searchListings, toCardListing } from '@/lib/frontend-api';
import { formatNaira, Listing } from '@/lib/domain';
import { ResilientImage } from '@/components/resilient-image';

function preferenceLabel(key: keyof NonNullable<ApiListing['preferences']>, value: string | null | undefined) {
  if (!value) return null;
  const labels: Record<string, string> = {
    roommateGender: 'Roommate gender',
    academicLevel: 'Academic level',
    studyAtmosphere: 'Study atmosphere',
    smokingRule: 'Smoking',
    utilityPreference: 'Utilities',
  };
  const formatted = formatPreferenceValue(value);
  return <div className="preference-item" key={key}><strong>{labels[key] ?? key}</strong><span>{formatted}</span></div>;
}

function formatPreferenceValue(value: string): string {
  const fixedLabels: Record<string, string> = {
    MALE: 'Male roommates',
    FEMALE: 'Female roommates',
  };
  return fixedLabels[value] ?? value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function ListingDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [listing, setListing] = useState<ApiListing | null>(null);
  const [related, setRelated] = useState<Listing[]>([]);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const [ownerView, setOwnerView] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  useEffect(() => {
    if (selectedPhoto === null) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSelectedPhoto(null);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedPhoto]);

  useEffect(() => {
    setListing(null);
    setRelated([]);
    setError('');
    setUnavailable(false);
    setOwnerView(false);
    getPublicListing(id).then(async (item) => {
      setListing(item);
      try {
        const result = await searchListings({ institutionId: item.institutionId, pageSize: 4 });
        setRelated(result.items.filter((relatedItem) => relatedItem.id !== id).map(toCardListing));
      } catch {
        setRelated([]);
      }
    }).catch(async (cause: unknown) => {
      if (cause instanceof ApiRequestError && cause.status === 410) {
        try {
          setListing(await getOwnedListing(id));
          setOwnerView(true);
        } catch (ownerCause: unknown) {
          if (ownerCause instanceof ApiRequestError && [401, 404].includes(ownerCause.status)) {
            setUnavailable(true);
          } else {
            setError(ownerCause instanceof Error ? ownerCause.message : 'Unable to load this listing.');
          }
        }
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
  if (!photos.length && listing.intent === 'ROOM_NEEDED' && listing.ownerPhotoUrl) {
    photos.push(listing.ownerPhotoUrl);
  }
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
  const statusLabels: Record<string, string> = {
    ACTIVE: 'Active listing',
    FOUND: 'Found · no longer available',
    RESTRICTED: 'Temporarily unavailable',
    DRAFT: 'Draft · only visible to you',
  };
  const isActiveListing = listing.status === 'ACTIVE';

  return <><Header /><main className="details-page shell">
    <Link className="back-link" href="/browse"><ArrowLeft size={14} /> Back to rooms</Link>
    <div className="details-grid"><div>
      <div className="details-gallery">
        <button className="gallery-main" type="button" onClick={() => photos[0] && setSelectedPhoto(0)} disabled={!photos[0]} aria-label="View full-size listing photo">
          {photos[0] && <ResilientImage src={photos[0]} alt={`${listing.title} photo 1`} className="gallery-resilient-image" sizes="(max-width: 850px) 100vw, 70vw" />}
        </button>
        <div className="gallery-thumbs">{[1, 2, 3].map((index) => <button key={index} type="button" onClick={() => photos[index] && setSelectedPhoto(index)} disabled={!photos[index]} aria-label={`View full-size listing photo ${index + 1}`}>
          {photos[index] && <ResilientImage src={photos[index]} alt={`${listing.title} photo ${index + 1}`} className="gallery-resilient-image" sizes="(max-width: 850px) 25vw, 110px" />}
        </button>)}</div>
      </div>
      {selectedPhoto !== null && photos[selectedPhoto] && <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={`Listing photo ${selectedPhoto + 1} of ${photos.length}`}>
        <button className="photo-lightbox-close" type="button" onClick={() => setSelectedPhoto(null)} aria-label="Close photo viewer"><X size={22} /></button>
        {selectedPhoto > 0 && <button className="photo-lightbox-nav photo-lightbox-prev" type="button" onClick={() => setSelectedPhoto((current) => current === null ? null : current - 1)} aria-label="Previous photo"><ChevronLeft size={28} /></button>}
        <ResilientImage src={photos[selectedPhoto]} alt={`${listing.title} photo ${selectedPhoto + 1}`} className="photo-lightbox-image" sizes="100vw" />
        {selectedPhoto < photos.length - 1 && <button className="photo-lightbox-nav photo-lightbox-next" type="button" onClick={() => setSelectedPhoto((current) => current === null ? null : current + 1)} aria-label="Next photo"><ChevronRight size={28} /></button>}
        <span className="photo-lightbox-count">{selectedPhoto + 1} / {photos.length}</span>
      </div>}
      <div className="details-heading"><div><p className="eyebrow">{card.roomType} · {card.availability}</p><h1>{listing.title}</h1><p className="details-location"><MapPin size={14} /> {listing.institution} · {listing.area}{listing.landmark ? ` · ${listing.landmark}` : ''}</p></div><span className={`soft-badge listing-status-badge ${isActiveListing ? 'is-active' : 'is-unavailable'}`}>{statusLabels[listing.status] ?? 'Unavailable listing'}</span></div>
      <section className="content-card"><h2>{listing.intent === 'ROOM_NEEDED' ? 'About this seeker' : 'About this place'}</h2><p>{listing.intent === 'ROOM_NEEDED' ? listing.about ?? listing.description : listing.description}</p>{listing.intent === 'ROOM_NEEDED' && listing.targetArea && <p className="muted">Preferred area: {listing.targetArea}</p>}{card.features.length > 0 && <div className="tag-row">{card.features.map((feature) => <span className="tag" key={feature}>{feature}</span>)}</div>}</section>
      {(preferenceEntries.length > 0 || preferences.lifestyleTraits?.length) && <section className="content-card"><h2>Living preferences</h2><p className="muted">Clear expectations make shared homes easier.</p><div className="preference-grid">{preferenceEntries}{preferences.lifestyleTraits?.map((trait) => <div className="preference-item" key={trait}><strong>Daily routine</strong><span>{formatPreferenceValue(trait)}</span></div>)}</div></section>}
      <section className="content-card owner-card"><Link className="owner-avatar-link" href={listing.ownerId ? `/users/${listing.ownerId}` : `/listings/${listing.id}`}><div className="owner-avatar owner-avatar-large" style={listing.ownerPhotoUrl ? { backgroundImage: `url("${listing.ownerPhotoUrl}")` } : undefined}>{!listing.ownerPhotoUrl && (listing.ownerInitials ?? 'CR')}</div></Link><div><h2><Link href={listing.ownerId ? `/users/${listing.ownerId}` : `/listings/${listing.id}`}>{listing.ownerDisplayName ?? 'Campus Roomies member'}</Link></h2><p className="muted">{ownerView ? 'Your listing' : listing.intent === 'ROOM_NEEDED' ? 'Room seeker' : 'Listing owner'}</p>{!ownerView && <p className="owner-note">{listing.intent === 'ROOM_NEEDED' ? 'The seeker’s contact details stay private' : 'Contact details stay private'} until an eligible contact handoff.</p>}</div></section>
      {isActiveListing && !ownerView && <Link className="report-link" href={`/report?listing=${listing.id}`}><Flag size={13} /> Report this listing if something feels wrong</Link>}
    </div><aside className="details-aside"><div className="price-card"><p className="eyebrow">{listing.intent === 'ROOM_NEEDED' ? 'Target budget' : `Rent per ${period}`}</p><strong>{formatNaira(amount)} <small>/ {period}</small></strong>{!isActiveListing ? <p>{listing.status === 'FOUND' ? 'This listing has been marked as found and is no longer accepting inquiries.' : listing.status === 'DRAFT' ? 'This draft is visible only to you.' : 'This listing is temporarily unavailable.'}</p> : <><p>{listing.intent === 'ROOM_NEEDED' ? 'This student is looking for a space within this budget.' : 'Talk directly with the lister on WhatsApp. Campus Roomies does not hold payments or deposits.'}</p>{!ownerView && <ContactGate listingId={listing.id} />}{!ownerView && <SaveButton listingId={listing.id} />}</>}</div>{isActiveListing && <div className="notice-card"><strong>Take your time.</strong><p>Visit in a safe place, ask questions, and never transfer money before you are comfortable with the arrangement.</p></div>}</aside></div>
    {!ownerView && related.length > 0 && <section className="section related-section"><div className="section-heading"><div><p className="eyebrow">Keep looking</p><h2>More rooms near your institution</h2></div></div><div className="listing-grid listing-grid-three">{related.map((item) => <ListingCard key={item.id} listing={item} compact />)}</div></section>}
  </main><Footer /></>;
}
