'use client';

import Link from 'next/link';
import { CheckCircle2, ExternalLink, LockKeyhole, MessageCircle } from 'lucide-react';
import { useSession } from '@/lib/session';
import { requestContact } from '@/lib/frontend-api';
import { useEffect, useState } from 'react';

export function ContactHandoff({ listingId }: { listingId: string }) {
  const { profile, ready } = useSession();
  const [handoffUrl, setHandoffUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready || !profile?.profileComplete || !profile.phoneConfirmed) return;
    setLoading(true);
    requestContact(listingId)
      .then((result) => setHandoffUrl(result.handoffUrl))
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, [listingId, profile?.profileComplete, profile?.phoneConfirmed, ready]);

  if (!ready) return <div className="contact-loading">Checking contact access…</div>;
  if (!profile) return <><div className="success-icon"><LockKeyhole size={28} /></div><p className="eyebrow">Sign in required</p><h1>Sign in before you connect.</h1><p>We ask everyone to complete a profile before starting a conversation with a lister.</p><Link className="button full-width" href={`/login?next=/listings/${listingId}/contact`}>Sign in to continue</Link></>;
  if (!profile.profileComplete || !profile.phoneConfirmed) return <><div className="success-icon"><LockKeyhole size={28} /></div><p className="eyebrow">One more step</p><h1>Complete your profile before you connect.</h1><p>A confirmed WhatsApp number and a little context help make first conversations more respectful.</p><Link className="button full-width" href={`/profile/complete?next=/listings/${listingId}/contact`}>Complete profile</Link></>;
  return <><div className="success-icon"><CheckCircle2 size={28} /></div><p className="eyebrow">Ready to connect</p><h1>Take the conversation to WhatsApp.</h1><p>Campus Roomies keeps the introduction simple. Open WhatsApp, say hello, and ask the questions that matter before making arrangements.</p>{error && <p className="form-error" role="alert">{error}</p>}{loading ? <div className="contact-loading" role="status">Checking contact access…</div> : handoffUrl ? <a className="button full-width" href={handoffUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open WhatsApp</a> : <button className="button full-width" disabled={loading} onClick={() => { setError(''); setLoading(true); requestContact(listingId).then((result) => setHandoffUrl(result.handoffUrl)).catch((cause: Error) => setError(cause.message)).finally(() => setLoading(false)); }}><MessageCircle size={15} /> Try contact again</button>}</>;
}
