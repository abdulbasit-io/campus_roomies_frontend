'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, LockKeyhole, MessageCircle } from 'lucide-react';
import { useSession } from '@/lib/session';

export function ContactGate({ listingId }: { listingId: string }) {
  const { profile, ready } = useSession();
  if (!ready) return <div className="contact-loading">Checking contact access…</div>;
  if (!profile) return <Link className="button full-width" href={`/login?next=/listings/${listingId}/contact`}><LockKeyhole size={15} /> Sign in to contact</Link>;
  if (!profile.profileComplete) return <Link className="button full-width" href={`/profile/complete?next=/listings/${listingId}/contact`}><CheckCircle2 size={15} /> Complete your profile</Link>;
  if (!profile.phoneConfirmed) return <Link className="button full-width" href={`/profile/complete?next=/listings/${listingId}/contact`}><MessageCircle size={15} /> Confirm your WhatsApp number</Link>;
  return <Link className="button full-width" href={`/listings/${listingId}/contact`}><MessageCircle size={15} /> Continue to WhatsApp <ArrowRight size={15} /></Link>;
}
