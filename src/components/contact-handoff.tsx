'use client';

import Link from 'next/link';
import { CheckCircle2, ExternalLink, LockKeyhole } from 'lucide-react';
import { useSession } from '@/lib/session';

export function ContactHandoff({ listingId }: { listingId: string }) {
  const { profile, ready } = useSession();
  if (!ready) return <div className="contact-loading">Checking contact access…</div>;
  if (!profile) return <><div className="success-icon"><LockKeyhole size={28} /></div><p className="eyebrow">Sign in required</p><h1>Sign in before you connect.</h1><p>We ask everyone to complete a profile before starting a conversation with a lister.</p><Link className="button full-width" href={`/login?next=/listings/${listingId}/contact`}>Sign in to continue</Link></>;
  if (!profile.profileComplete || !profile.phoneConfirmed) return <><div className="success-icon"><LockKeyhole size={28} /></div><p className="eyebrow">One more step</p><h1>Complete your profile before you connect.</h1><p>A confirmed WhatsApp number and a little context help make first conversations more respectful.</p><Link className="button full-width" href={`/profile/complete?next=/listings/${listingId}/contact`}>Complete profile</Link></>;
  return <><div className="success-icon"><CheckCircle2 size={28} /></div><p className="eyebrow">Ready to connect</p><h1>Take the conversation to WhatsApp.</h1><p>Campus Roomies keeps the introduction simple. Open WhatsApp, say hello, and ask the questions that matter before making arrangements.</p><a className="button full-width" href={`https://wa.me/?text=${encodeURIComponent(`Hi, I found your room on Campus Roomies (${listingId}). Is it still available?`)}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open WhatsApp</a></>;
}
