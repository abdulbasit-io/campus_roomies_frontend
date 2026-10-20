'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Footer, Header } from '@/components/site-chrome';
import { register } from '@/lib/frontend-api';
import { useSession } from '@/lib/session';
import { authLink, getLocalRedirectTarget } from '@/lib/redirect';

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useSession();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', gender: 'FEMALE' as 'MALE' | 'FEMALE' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    setNext(new URLSearchParams(window.location.search).get('next'));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      signIn(await register(form));
      router.replace(getLocalRedirectTarget(
        new URLSearchParams(window.location.search).get('next'),
        '/browse',
        window.location.origin,
      ));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create your account.');
    } finally {
      setPending(false);
    }
  }

  return <><Header /><main className="auth-page shell"><form className="auth-card" onSubmit={submit}>
    <p className="eyebrow">Create an account</p><h1>Start with the basics.</h1><p className="auth-copy">Your contact details stay private until you choose to connect.</p>
    <label>First name<input required maxLength={80} autoComplete="given-name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label>
    <label>Last name<input required maxLength={80} autoComplete="family-name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label>
    <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
    <label>Password<input required type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
    <label>Gender<select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as 'MALE' | 'FEMALE' })}><option value="FEMALE">Female</option><option value="MALE">Male</option></select></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button full-width" disabled={pending}>{pending ? 'Creating account…' : 'Create account'}</button>
    <p className="auth-foot">Already have an account? <Link href={authLink('/login', next)}>Log in</Link></p>
  </form></main><Footer /></>;
}
