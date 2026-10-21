'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { Listing } from '@/lib/domain';
import { formatNaira } from '@/lib/domain';
import { SaveButton } from '@/components/save-button';

export function ListingCard({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  return (
    <article className={`listing-card ${compact ? 'listing-card-compact' : ''}`}>
      <Link className="listing-image" href={`/listings/${listing.id}`} style={{ backgroundImage: `url("${listing.image}")` }}>
        <span className="image-label">{listing.availability}</span>
        <span onClick={(event) => event.preventDefault()}><SaveButton listingId={listing.id} compact /></span>
      </Link>
      <div className="listing-body">
        <div className="listing-kicker"><span>{listing.roomType}</span>{listing.distance && <><span>·</span><span>{listing.distance}</span></>}</div>
        <Link href={`/listings/${listing.id}`}><h3>{listing.title}</h3></Link>
        <p className="listing-price">{formatNaira(listing.price)} <small>/ {listing.period}</small></p>
        <p className="listing-location"><MapPin size={13} /> {listing.area} · {listing.institution}</p>
        {listing.features.length > 0 && <div className="tag-row">{listing.features.map((feature) => <span className="tag" key={feature}>{feature}</span>)}</div>}
        {!compact && <div className="listing-owner"><Link className="owner-link" href={listing.ownerUserId ? `/users/${listing.ownerUserId}` : `/listings/${listing.id}`}><span className="owner-avatar" style={listing.ownerPhotoUrl ? { backgroundImage: `url("${listing.ownerPhotoUrl}")` } : undefined}>{!listing.ownerPhotoUrl && listing.ownerInitials}</span></Link><Link className="owner-name" href={listing.ownerUserId ? `/users/${listing.ownerUserId}` : `/listings/${listing.id}`}>{listing.owner}</Link><Link className="button button-small button-quiet" href={`/listings/${listing.id}`}>View room</Link></div>}
      </div>
    </article>
  );
}
