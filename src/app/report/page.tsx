'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Footer, Header } from '@/components/site-chrome';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { submitReport } from '@/lib/frontend-api';
import { useSession } from '@/lib/session';

export default function ReportPage() {
  return <Suspense fallback={<main className="auth-page shell"><p className="contact-loading" role="status">Loading report form…</p></main>}><ReportForm /></Suspense>;
}

function ReportForm() {
  const params = useSearchParams();
  const listingId = params.get('listing') ?? '';
  const { profile, ready } = useSession();
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState('MISLEADING_INFORMATION');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    if (!listingId) {
      setError('Open a listing and use its report link so moderators can review the correct listing.');
      return;
    }
    setPending(true);
    setError('');
    try {
      await submitReport(listingId, { reason, details });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to submit the report.');
    } finally {
      setPending(false);
    }
  };
  return <><Header /><main className="auth-page shell">{submitted ? <div className="auth-card report-success"><div className="success-icon"><CheckCircle2 size={28} /></div><p className="eyebrow">Report received</p><h1>Thank you for speaking up.</h1><p className="auth-copy">A moderator can now review the details. We will keep your report private.</p><Link className="button full-width" href="/browse">Back to rooms</Link></div> : <form className="auth-card" onSubmit={submit}><p className="eyebrow">Trust &amp; care</p><h1>Something doesn&apos;t feel right?</h1><p className="auth-copy">Tell us what happened. Reports help keep the catalogue useful for students.</p>{!ready ? <p className="contact-loading" role="status">Checking your account…</p> : !profile ? <p className="review-note">Sign in before submitting a report. <Link href={`/login?next=${encodeURIComponent(`/report?listing=${listingId}`)}`}>Log in</Link></p> : null}{!listingId && <p className="review-note">A listing must be selected before a report can be submitted.</p>}<label>Reason<select value={reason} onChange={(event) => setReason(event.target.value)}><option value="SUSPICIOUS_LISTING">Something about this listing seems suspicious</option><option value="MISLEADING_INFORMATION">The details seem misleading</option><option value="INAPPROPRIATE_CONTENT">The content is inappropriate</option><option value="SAFETY_CONCERN">I have a safety concern</option><option value="OTHER">Something else</option></select></label><label>What should we know?<textarea required maxLength={2000} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Share the details that can help us review this." /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button full-width" type="submit" disabled={!ready || !profile || !listingId || pending}>{pending ? 'Submitting…' : 'Submit report'}</button><Link className="back-link" href="/browse">← Back to rooms</Link></form>}</main><Footer /></>;
}
