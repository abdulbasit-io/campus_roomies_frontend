'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Footer, Header } from '@/components/site-chrome';
import { reportsKey } from '@/lib/local-store';

export default function ReportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState('MISLEADING_INFORMATION');
  const [details, setDetails] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const reports = JSON.parse(window.localStorage.getItem(reportsKey) ?? '[]') as unknown[];
    window.localStorage.setItem(reportsKey, JSON.stringify([...reports, { reason, details, createdAt: new Date().toISOString() }]));
    setSubmitted(true);
  };
  return <><Header /><main className="auth-page shell">{submitted ? <div className="auth-card report-success"><div className="success-icon"><CheckCircle2 size={28} /></div><p className="eyebrow">Report received</p><h1>Thank you for speaking up.</h1><p className="auth-copy">A moderator can now review the details. We will keep your report private.</p><Link className="button full-width" href="/browse">Back to rooms</Link></div> : <form className="auth-card" onSubmit={submit}><p className="eyebrow">Trust &amp; care</p><h1>Something doesn&apos;t feel right?</h1><p className="auth-copy">Tell us what happened. Reports help keep the catalogue useful for students.</p><label>Reason<select value={reason} onChange={(event) => setReason(event.target.value)}><option value="SUSPICIOUS_LISTING">Something about this listing seems suspicious</option><option value="MISLEADING_INFORMATION">The details seem misleading</option><option value="INAPPROPRIATE_CONTENT">The content is inappropriate</option><option value="SAFETY_CONCERN">I have a safety concern</option><option value="OTHER">Something else</option></select></label><label>What should we know?<textarea required value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Share the details that can help us review this." /></label><button className="button full-width" type="submit">Submit report</button><Link className="back-link" href="/browse">← Back to rooms</Link></form>}</main><Footer /></>;
}
