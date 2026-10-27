'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Footer, Header } from '@/components/site-chrome';
import { apiRequest } from '@/lib/api';

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="auth-page shell"><p className="contact-loading" role="status">Loading password reset…</p></main>}><ResetPasswordForm /></Suspense>;
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmed) {
      setError('The passwords do not match.');
      return;
    }
    setPending(true);
    setError('');
    try {
      await apiRequest('/auth/password-reset/complete', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to reset your password.');
    } finally {
      setPending(false);
    }
  }

  return <><Header /><main className="auth-page shell"><section className="auth-card">
    <h1>{done ? 'Password updated.' : 'Choose a new password.'}</h1>
    {done ? <><p className="auth-copy">Your active sessions have been signed out. Log in with your new password.</p><Link className="button full-width" href="/login">Log in</Link></> : !token ? <><p className="auth-copy">This reset link is missing its token. Request a new link to continue.</p><Link className="button full-width" href="/forgot-password">Request reset link</Link></> : <form onSubmit={submit}>
      <label>New password<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <label>Confirm password<input required minLength={8} type="password" autoComplete="new-password" value={confirmed} onChange={(event) => setConfirmed(event.target.value)} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button full-width" disabled={pending}>{pending ? 'Updating…' : 'Reset password'}</button>
    </form>}
  </section></main><Footer /></>;
}
