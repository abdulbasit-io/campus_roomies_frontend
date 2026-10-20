'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Footer, Header } from '@/components/site-chrome';
import { Profile, getMyProfile } from '@/lib/frontend-api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    getMyProfile().then(setProfile).catch((cause: Error) => setError(cause.message));
  }, []);

  return <><Header /><main className="profile-page shell"><div className="profile-card">
    {error && <p className="form-error" role="alert">{error}</p>}
    {!profile && !error && <p className="contact-loading" role="status">Loading your profile…</p>}
    {profile && <>
      <div className="profile-avatar">{profile.firstName.charAt(0).toUpperCase()}</div><p className="eyebrow">Your profile</p><h1>{profile.firstName} {profile.lastName.charAt(0).toUpperCase()}.</h1>
      <p>{profile.about || 'Add a short introduction so other students can get to know you.'}</p>
      <dl className="profile-details"><div><dt>Email</dt><dd>{profile.email}</dd></div><div><dt>Institution</dt><dd>{profile.institutionName ?? 'Not added yet'}</dd></div><div><dt>Department</dt><dd>{profile.department ?? 'Not added yet'}</dd></div><div><dt>Academic level</dt><dd>{profile.academicLevel ?? 'Not added yet'}</dd></div><div><dt>WhatsApp attestation</dt><dd>{profile.phoneConfirmed ? 'Confirmed' : 'Not confirmed'}</dd></div></dl>
      <div className="profile-progress"><span><i style={{ width: profile.profileComplete ? '100%' : profile.phoneConfirmed ? '65%' : '35%' }} /></span><strong>{profile.profileComplete ? 'Complete' : 'Needs attention'}</strong></div>
      <Link className="button" href="/profile/complete">Edit profile →</Link>
    </>}
  </div></main><Footer /></>;
}
