'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/site-chrome';
import { apiRequest } from '@/lib/api';
import { SessionProfile, useSession } from '@/lib/session';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const profile = await apiRequest<SessionProfile>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (profile.role !== 'ADMIN') {
        setError('This account does not have administrator access.');
        return;
      }
      signIn(profile);
      router.replace('/admin');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={submit}>
        <Logo />
        <p className="eyebrow">Administrator access</p>
        <h1>Sign in to manage the catalog.</h1>
        <p className="admin-muted">Use an account with the administrator role.</p>
        <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="admin-alert" role="alert">{error}</p>}
        <button className="button full-width" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
        <Link className="admin-back-link" href="/">Back to Campus Roomies</Link>
      </form>
    </main>
  );
}
