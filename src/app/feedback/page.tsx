'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Footer, Header } from '@/components/site-chrome';
import { FeedbackCategory, submitFeedback } from '@/lib/frontend-api';

const categories: Array<[FeedbackCategory, string]> = [
  ['IDEA', 'An idea or suggestion'],
  ['USABILITY', 'Something was confusing or difficult'],
  ['BUG', 'Something is not working'],
  ['OTHER', 'Something else'],
];

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackCategory>('IDEA');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function sendFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      await submitFeedback({
        category,
        message: message.trim(),
        ...(contactEmail.trim() ? { contactEmail: contactEmail.trim() } : {}),
      });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send your feedback.');
    } finally {
      setSending(false);
    }
  }

  return <><Header /><main className="feedback-page shell">
    <Link className="back-link" href="/"><ArrowLeft size={14} /> Back home</Link>
    {submitted ? <section className="feedback-success" role="status">
      <span><MessageSquare size={22} /></span>
      <p className="eyebrow">Feedback received</p>
      <h1>Thanks for helping us make this better.</h1>
      <p>Your feedback is saved for the Campus Roomies team, and an email notification has been queued.</p>
      <div className="feedback-success-actions"><Link className="button" href="/browse">Explore rooms</Link><button className="button button-secondary" onClick={() => { setSubmitted(false); setMessage(''); setContactEmail(''); }}>Send more feedback</button></div>
    </section> : <section className="feedback-panel">
      <h1>What could work better?</h1>
      <p className="feedback-intro">Share a suggestion, tell us what was confusing, or let us know when something is not working. You can send feedback without signing in.</p>
      <form className="feedback-form" onSubmit={sendFeedback}>
        <label>What is this about?
          <select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)}>
            {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>Your feedback
          <textarea required maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what happened or what would make the experience better." />
          <small>{message.length}/2000 characters</small>
        </label>
        <label>Email for a reply <span className="feedback-optional">Optional</span>
          <input type="email" maxLength={254} value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="you@example.com" />
          <small>Only include an email if you would like us to follow up.</small>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button" type="submit" disabled={sending || !message.trim()}>{sending ? 'Sending feedback…' : 'Send feedback'}</button>
      </form>
    </section>}
  </main><Footer /></>;
}
