'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  FileText,
  GraduationCap,
  House,
  LockKeyhole,
  Pencil,
  Plus,
  UserRound,
} from 'lucide-react';
import { Footer, Header } from '@/components/site-chrome';
import { getMyProfile, listMyListings, type OwnedDraft, type Profile } from '@/lib/frontend-api';
import { ApiRequestError } from '@/lib/api';

const completionFields = [
  (profile: Profile) => profile.phoneConfirmed,
  (profile: Profile) => Boolean(profile.institutionId),
  (profile: Profile) => Boolean(profile.department),
  (profile: Profile) => Boolean(profile.academicLevel),
  (profile: Profile) => Boolean(profile.about),
  (profile: Profile) => Boolean(profile.photoUrl),
];

function getListingPrice(listing: OwnedDraft): { amount: number; period: string } | null {
  const amount = listing.intent === 'ROOM_NEEDED'
    ? listing.target_budget_amount
    : listing.price_amount;
  const period = listing.intent === 'ROOM_NEEDED'
    ? listing.target_budget_period
    : listing.price_period;
  if (!amount || !period) return null;
  return { amount, period: period.toLowerCase() };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<OwnedDraft[]>([]);
  const [profileError, setProfileError] = useState('');
  const [listingsError, setListingsError] = useState('');
  const [authRequired, setAuthRequired] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then(setProfile)
      .catch((cause: Error) => {
        if (cause instanceof ApiRequestError && cause.status === 401) setAuthRequired(true);
        else setProfileError(cause.message);
      })
      .finally(() => setLoadingProfile(false));
    listMyListings()
      .then((items) => setListings(items.slice(0, 3)))
      .catch((cause: Error) => {
        if (cause instanceof ApiRequestError && cause.status === 401) setAuthRequired(true);
        else setListingsError(cause.message);
      })
      .finally(() => setLoadingListings(false));
  }, []);

  const completeCount = profile
    ? completionFields.filter((isComplete) => isComplete(profile)).length
    : 0;
  const completionPercent = Math.round((completeCount / completionFields.length) * 100);

  return (
    <>
      <Header />
      <main className="profile-dashboard shell">
        <div className="profile-dashboard-heading">
          <div>
            <p className="eyebrow">Your account</p>
            <h1>Your profile</h1>
            <p>Manage your details and keep track of your Campus Roomies activity.</p>
          </div>
          {profile && <Link className="button button-secondary" href="/profile/complete">
            <Pencil size={15} /> Edit profile
          </Link>}
        </div>

        {profileError && <p className="form-error" role="alert">{profileError}</p>}
        {loadingProfile && <p className="contact-loading" role="status">Loading your profile…</p>}
        {authRequired && !loadingProfile && !profile && (
          <section className="profile-access-card">
            <div className="profile-heading-icon"><LockKeyhole size={17} /></div>
            <div><h2>Sign in to view your profile</h2><p>Your profile and listings are only available to you.</p></div>
            <Link className="button" href={`/login?next=${encodeURIComponent('/profile')}`}>Log in</Link>
          </section>
        )}

        {profile && (
          <>
            <div className="profile-dashboard-grid">
              <aside className="profile-summary-card">
                <div className="profile-summary-person">
                  <div className="profile-avatar" style={profile.photoUrl ? { backgroundImage: `url("${profile.photoUrl}")` } : undefined}>
                    {!profile.photoUrl && profile.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="eyebrow">Student profile</p>
                    <h2>{profile.firstName} {profile.lastName}</h2>
                    <p>{profile.department || 'Add your department'}</p>
                  </div>
                </div>

                <div className="profile-summary-meta">
                  <p><Building2 size={16} /><span>{profile.institutionName || 'Institution not added'}</span></p>
                  <p><GraduationCap size={16} /><span>{profile.academicLevel || 'Academic level not added'}</span></p>
                </div>

                <section className="profile-completion" aria-label="Profile completeness">
                  <div className="profile-completion-heading">
                    <strong>Profile completeness</strong>
                    <span>{completionPercent}%</span>
                  </div>
                  <div className="profile-completion-track">
                    <span style={{ width: `${completionPercent}%` }} />
                  </div>
                  <p>{profile.profileComplete
                    ? profile.photoUrl
                      ? 'Your profile has the details needed to connect and publish.'
                      : 'You can connect, but need a profile picture before creating a listing.'
                    : 'Complete your profile before contacting listers or publishing.'}</p>
                  {(!profile.profileComplete || !profile.photoUrl) && (
                    <Link href="/profile/complete">{profile.photoUrl ? 'Complete profile' : 'Add profile picture'} <ArrowRight size={14} /></Link>
                  )}
                </section>

                <div className="profile-privacy-note">
                  <LockKeyhole size={17} />
                  <p>Your email and WhatsApp number are private. Your WhatsApp number is shared only through an eligible handoff.</p>
                </div>
              </aside>

              <div className="profile-main-column">
                <section className="profile-info-card">
                  <div className="profile-card-heading">
                    <div className="profile-heading-icon"><UserRound size={17} /></div>
                    <div><h2>About you</h2><p>A short introduction for your room-search journey.</p></div>
                    <Link className="profile-icon-link" href="/profile/complete" aria-label="Edit profile details">
                      <Pencil size={15} />
                    </Link>
                  </div>
                  <p className="profile-about-text">
                    {profile.about || 'Add a little about yourself so other students can get to know you.'}
                  </p>
                  <div className="profile-details-grid">
                    <div><span>Institution</span><strong>{profile.institutionName || 'Not added'}</strong></div>
                    <div><span>Department</span><strong>{profile.department || 'Not added'}</strong></div>
                    <div><span>Academic level</span><strong>{profile.academicLevel || 'Not added'}</strong></div>
                    <div><span>WhatsApp attestation</span><strong className="profile-attestation-state">
                      <Check size={14} /> {profile.phoneConfirmed ? 'Confirmed by you' : 'Not confirmed'}
                    </strong></div>
                  </div>
                </section>

                <section className="profile-info-card profile-safety-card">
                  <div className="profile-heading-icon"><LockKeyhole size={17} /></div>
                  <div>
                    <h2>Keep your contact details private</h2>
                    <p>Campus Roomies does not show your phone number publicly. When contact is allowed, the handoff opens WhatsApp so you can choose whether to continue the conversation.</p>
                  </div>
                </section>
              </div>
            </div>

            <section className="profile-listings-section">
              <div className="profile-listings-heading">
                <div>
                  <p className="eyebrow">Your activity</p>
                  <h2>My listings</h2>
                  <p>Manage rooms you have listed or searches you have shared.</p>
                </div>
                <div className="profile-listing-actions">
                  <Link className="profile-text-link" href="/profile/listings">View all <ArrowRight size={14} /></Link>
                  <Link className="button button-small" href="/listings/new"><Plus size={15} /> New listing</Link>
                </div>
              </div>

              {listingsError && <p className="form-error" role="alert">{listingsError}</p>}
              {loadingListings && <p className="contact-loading" role="status">Loading your listings…</p>}
              {!loadingListings && !listingsError && listings.length === 0 && (
                <div className="profile-listings-empty">
                  <div className="profile-heading-icon"><House size={17} /></div>
                  <div><strong>No listings yet</strong><p>When you are ready, share a room or tell students what you are looking for.</p></div>
                  <Link className="profile-text-link" href="/listings/new">Get started <ArrowRight size={14} /></Link>
                </div>
              )}
              {listings.length > 0 && (
                <div className="profile-listings-list">
                  {listings.map((listing) => {
                    const price = getListingPrice(listing);
                    const draftPath = listing.intent === 'ROOM_NEEDED'
                      ? '/listings/new/room-needed'
                      : '/listings/new/room-available';
                    return (
                      <article className="profile-listing-row" key={listing.id}>
                        <div className="profile-listing-icon"><FileText size={17} /></div>
                        <div className="profile-listing-copy">
                          <strong>{listing.title || (listing.intent === 'ROOM_NEEDED' ? 'Room-needed search' : 'Room listing')}</strong>
                          <span>{listing.intent === 'ROOM_NEEDED' ? 'Looking for a room' : 'Room available'} · {listing.status.toLowerCase()}</span>
                        </div>
                        {price && <strong className="profile-listing-price">
                          {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(price.amount)}
                          <small> / {price.period}</small>
                        </strong>}
                        <Link className="profile-text-link" href={listing.status === 'DRAFT' ? `${draftPath}?draft=${listing.id}` : '/profile/listings'}>
                          {listing.status === 'DRAFT' ? 'Resume' : 'Manage'} <ArrowRight size={14} />
                        </Link>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
