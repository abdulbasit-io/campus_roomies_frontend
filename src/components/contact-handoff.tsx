'use client';

import Link from 'next/link';
import { CheckCircle2, ExternalLink, LockKeyhole, MessageCircle } from 'lucide-react';
import { useSession } from '@/lib/session';
import { createInterest, requestContact } from '@/lib/frontend-api';
import { authLink } from '@/lib/redirect';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { useCallback, useEffect, useState } from 'react';

export function ContactHandoff({ listingId }: { listingId: string }) {
  const { profile, ready } = useSession();
  const [handoffUrl, setHandoffUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const eligible = ready && Boolean(profile?.profileComplete && profile.phoneConfirmed);

  const prepareHandoff = useCallback(async () => {
    if (!eligible) return;
    setLoading(true);
    setError('');
    setHandoffUrl('');
    try {
      await createInterest(listingId);
      void trackAnalyticsEvent('INTEREST_RECORDED', { listingId });
      const result = await requestContact(listingId);
      void trackAnalyticsEvent('HANDOFF_AUTHORIZED', { listingId });
      setHandoffUrl(result.handoffUrl);
    } catch (cause) {
      setError(cause instanceof Error
        ? cause.message
        : 'We could not prepare your WhatsApp handoff. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [eligible, listingId]);

  useEffect(() => {
    if (eligible && !handoffUrl && !error && !loading) {
      void prepareHandoff();
    }
  }, [eligible, error, handoffUrl, loading, prepareHandoff]);

  if (!ready) return <div className="contact-loading">Checking contact access…</div>;
  if (!profile) return <><div className="success-icon"><LockKeyhole size={28} /></div><p className="eyebrow">Sign in required</p><h1>Sign in before you connect.</h1><p>We ask everyone to complete a profile before starting a conversation with a lister.</p><Link className="button full-width" href={authLink('/login', `/listings/${listingId}/contact`)}>Sign in to continue</Link></>;
  if (!profile.profileComplete || !profile.phoneConfirmed) return <><div className="success-icon"><LockKeyhole size={28} /></div><p className="eyebrow">One more step</p><h1>Complete your profile before you connect.</h1><p>A confirmed WhatsApp number and a little context help make first conversations more respectful.</p><Link className="button full-width" href={authLink('/profile/complete', `/listings/${listingId}/contact`)}>Complete profile</Link></>;
  return <><div className="success-icon"><CheckCircle2 size={28} /></div><p className="eyebrow">Ready to connect</p><h1>Take the conversation to WhatsApp.</h1><p>We’ll record your interest before opening WhatsApp, so the listing owner can see that you reached out.</p>{error && <p className="form-error" role="alert">{error}</p>}{loading ? <div className="contact-loading" role="status">Recording your interest and preparing WhatsApp…</div> : handoffUrl ? <a className="button full-width" href={handoffUrl} target="_blank" rel="noreferrer" onClick={() => { void trackAnalyticsEvent('WHATSAPP_OPENED', { listingId }); }}><ExternalLink size={15} /> Open WhatsApp</a> : <button className="button full-width" onClick={() => { void prepareHandoff(); }}><MessageCircle size={15} /> Try again</button>}</>;
}
