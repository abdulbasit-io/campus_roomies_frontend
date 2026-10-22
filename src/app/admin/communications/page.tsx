'use client';

import { FormEvent, useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { QueuedAdminEmail, adminApi } from '@/lib/admin-api';

export default function AdminCommunicationsPage() {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [queued, setQueued] = useState<QueuedAdminEmail | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setQueued(null);
    setPending(true);
    try {
      const result = await adminApi.queueEmail({ recipient, subject, text });
      setQueued(result);
      setRecipient('');
      setSubject('');
      setText('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to queue this email.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-page admin-form-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Platform operations</p>
          <h1>Send an email</h1>
          <p className="admin-muted">Queue a one-off text email for an operational message to a user.</p>
        </div>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div><h2><Mail size={18} /> Compose message</h2><p className="admin-muted">Only send messages related to Campus Roomies operations.</p></div>
        </div>
        {error && <p className="admin-alert" role="alert">{error}</p>}
        {queued && <div className="admin-success" role="status">
          Email queued for delivery. Job reference: <code>{queued.jobId}</code>. Queuing does not guarantee delivery; provider failures are handled by the email worker.
        </div>}
        <form className="admin-form admin-email-form" onSubmit={submit}>
          <label>Recipient email
            <input type="email" required maxLength={254} autoComplete="email" value={recipient} onChange={(event) => setRecipient(event.target.value)} />
          </label>
          <label>Subject
            <input required minLength={1} maxLength={200} value={subject} onChange={(event) => setSubject(event.target.value)} />
          </label>
          <label>Message
            <textarea required minLength={1} maxLength={10000} rows={10} value={text} onChange={(event) => setText(event.target.value)} />
            <small>{text.length}/10000 characters</small>
          </label>
          <div className="admin-form-actions">
            <button className="button" disabled={pending}><Send size={16} /> {pending ? 'Queueing…' : 'Queue email'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
