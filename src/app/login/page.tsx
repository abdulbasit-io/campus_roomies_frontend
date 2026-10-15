'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Footer, Header } from '@/components/site-chrome';
import { useSession } from '@/lib/session';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email address.'); return; }
    signIn({ firstName: 'Amina', lastNameInitial: 'A.', email, phoneConfirmed: false, profileComplete: false });
    const next = new URLSearchParams(window.location.search).get('next');
    router.push(next || '/profile');
  };
  return <><Header /><main className="auth-page shell"><form className="auth-card" onSubmit={submit}><p className="eyebrow">Welcome back</p><h1>Keep your room search moving.</h1><p className="auth-copy">Sign in to contact a lister, save a room, or pick up where you left off.</p><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" placeholder="Your password" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button full-width" type="submit">Log in</button><p className="auth-foot">New to Campus Roomies? <Link href="/profile/complete">Create your profile</Link></p></form></main><Footer /></>;
}
