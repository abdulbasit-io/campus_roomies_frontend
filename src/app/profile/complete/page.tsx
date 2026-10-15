'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Footer, Header } from '@/components/site-chrome';
import { useSession } from '@/lib/session';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { profile, updateProfile } = useSession();
  const [firstName, setFirstName] = useState(profile?.firstName ?? '');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !/^\+?[0-9\s-]{10,}$/.test(phone)) { setError('Add your name and a valid WhatsApp number before continuing.'); return; }
    updateProfile({ firstName, lastNameInitial: `${lastName.trim()[0]}.`, email: profile?.email ?? '', phoneConfirmed: true, profileComplete: true });
    const next = new URLSearchParams(window.location.search).get('next');
    router.push(next || '/profile');
  };
  return <><Header /><main className="auth-page shell"><form className="auth-card" onSubmit={submit}><p className="eyebrow">Profile completion</p><h1>A little context goes a long way.</h1><p className="auth-copy">Tell people the basics before you start conversations.</p><label>First name<input required value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Amina" /></label><label>Last name<input required value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Your last name" /></label><label>WhatsApp number<input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+234 800 000 0000" /></label><label>About you <small>{about.length}/300</small><textarea required maxLength={300} value={about} onChange={(event) => setAbout(event.target.value)} placeholder="A line or two about your course, year, or living rhythm." /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button full-width" type="submit">Confirm profile →</button><Link className="back-link" href="/profile">← Back to profile</Link></form></main><Footer /></>;
}
