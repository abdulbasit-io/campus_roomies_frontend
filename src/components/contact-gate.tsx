'use client';

import Link from 'next/link';
import { CheckCircle2, LockKeyhole, MessageCircle } from 'lucide-react';
import { useSession } from '@/lib/session';
import { authLink } from '@/lib/redirect';

export function ContactGate({ listingId }: { listingId: string }) {
  const { profile, ready } = useSession();

  if (!ready) return <div className="contact-loading">Checking contact access…</div>;
  const contactPath = `/listings/${listingId}/contact`;
  if (!profile) return <Link className="button full-width" href={authLink('/login', contactPath)}><LockKeyhole size={15} /> Sign in to contact</Link>;
  if (!profile.profileComplete) return <Link className="button full-width" href={authLink('/profile/complete', contactPath)}><CheckCircle2 size={15} /> Complete your profile</Link>;
  if (!profile.phoneConfirmed) return <Link className="button full-width" href={authLink('/profile/complete', contactPath)}><MessageCircle size={15} /> Confirm your WhatsApp number</Link>;

  return <><p className="muted-copy">Your interest is recorded before we open WhatsApp.</p><Link className="button full-width" href={contactPath}>Continue to WhatsApp</Link></>;
}
