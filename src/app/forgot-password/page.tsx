'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Footer, Header } from '@/components/site-chrome';
import { apiRequest } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await apiRequest('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to request a password reset.');
    } finally {
      setPending(false);
    }
  }

  return <><Header /><main className="auth-page shell"><section className="auth-card">
    <p className="eyebrow">Password help</p><h1>{sent ? 'Check your inbox.' : 'Reset your password.'}</h1>
    {sent ? <><p className="auth-copy">If an account exists for that email, a reset link will be sent.</p><Link className="button full-width" href="/login">Back to log in</Link></> : <form onSubmit={submit}>
      <p className="auth-copy">Enter the email address for your account. We’ll send a reset link if it exists.</p>
      <label>Email address<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button full-width" disabled={pending}>{pending ? 'Sending…' : 'Send reset link'}</button>
    </form>}
  </section></main><Footer /></>;
}
