'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, LockKeyhole, MessageCircle } from 'lucide-react';
import { useSession } from '@/lib/session';
import { createInterest, withdrawInterest } from '@/lib/frontend-api';
import { authLink } from '@/lib/redirect';
import { useState } from 'react';
import type { ListingIntent } from '@/lib/domain';

export function ContactGate({ listingId, intent }: { listingId: string; intent: ListingIntent }) {
  const { profile, ready } = useSession();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (!ready) return <div className="contact-loading">Checking contact access…</div>;
  const contactPath = `/listings/${listingId}/contact`;
  if (!profile) return <Link className="button full-width" href={authLink('/login', contactPath)}><LockKeyhole size={15} /> Sign in to contact</Link>;
  if (!profile.profileComplete) return <Link className="button full-width" href={authLink('/profile/complete', contactPath)}><CheckCircle2 size={15} /> Complete your profile</Link>;
  if (!profile.phoneConfirmed) return <Link className="button full-width" href={authLink('/profile/complete', contactPath)}><MessageCircle size={15} /> Confirm your WhatsApp number</Link>;

  async function handleContinue() {
    setPending(true);
    setError('');
    try {
      await createInterest(listingId);
      window.location.assign(`/listings/${listingId}/contact`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to register your interest.';
      setError(message);
      window.location.assign(`/listings/${listingId}/contact`);
    } finally {
      setPending(false);
    }
  }

  return <><p className="muted-copy">Your interest is recorded automatically when you continue to WhatsApp.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button full-width" onClick={handleContinue} disabled={pending}>{pending ? 'Recording interest…' : `Continue to WhatsApp`}</button></>;
}
