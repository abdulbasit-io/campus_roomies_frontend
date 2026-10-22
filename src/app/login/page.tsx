'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Footer, Header } from '@/components/site-chrome';
import { useSession } from '@/lib/session';
import { login } from '@/lib/frontend-api';
import { authLink, getLocalRedirectTarget } from '@/lib/redirect';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    setNext(new URLSearchParams(window.location.search).get('next'));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const profile = await login(email, password);
      signIn(profile);
      const redirectTarget = getLocalRedirectTarget(
        new URLSearchParams(window.location.search).get('next'),
        '/browse',
        window.location.origin,
      );
      router.replace(profile.role === 'USER' && redirectTarget.startsWith('/admin')
        ? '/browse'
        : redirectTarget);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in.');
    } finally {
      setPending(false);
    }
  };
  return <><Header /><main className="auth-page shell"><form className="auth-card" onSubmit={submit}><p className="eyebrow">Welcome back</p><h1>Keep your room search moving.</h1><p className="auth-copy">Sign in to contact a lister, save a room, or pick up where you left off.</p><label>Email address<input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button full-width" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Log in'}</button><p className="auth-foot">New to Campus Roomies? <Link href={authLink('/register', next)}>Create your account</Link></p><p className="auth-foot"><Link href="/forgot-password">Forgot your password?</Link></p></form></main><Footer /></>;
}
