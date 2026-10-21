'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header, Footer } from '@/components/site-chrome';
import { getPublicProfile } from '@/lib/frontend-api';

type PublicProfile = {
  userId: string;
  firstName: string;
  lastName: string;
  lastNameInitial: string;
  photoUrl: string | null;
  institutionName?: string | null;
  department?: string | null;
  academicLevel?: string | null;
  about?: string | null;
};

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = params.userId;
    if (!userId) return;
    setLoading(true);
    getPublicProfile(userId).then((item) => setProfile(item)).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load this profile.')).finally(() => setLoading(false));
  }, [params.userId]);

  return <><Header /><main className="profile-page shell">
    <Link className="back-link" href="/browse">← Back to browse</Link>
    {loading ? <p className="contact-loading" role="status">Loading profile…</p> : error ? <p className="form-error" role="alert">{error}</p> : profile ? <div className="profile-header-card">
      <div className="owner-avatar owner-avatar-large" style={profile.photoUrl ? { backgroundImage: `url("${profile.photoUrl}")` } : undefined}>{!profile.photoUrl && (profile.firstName?.slice(0, 1) ?? 'A')}</div>
      <div>
        <p className="eyebrow">Public profile</p>
        <h1>{profile.firstName} {profile.lastNameInitial || ''}</h1>
        {profile.institutionName && <p className="muted">{profile.institutionName}</p>}
      </div>
    </div> : null}
    {profile && <div className="profile-details-grid">
      <section className="content-card">
        <h2>About</h2>
        <p>{profile.about || 'This student has not added a profile summary yet.'}</p>
      </section>
      <section className="content-card">
        <h2>Details</h2>
        <div className="preference-grid">
          <div className="preference-item"><strong>Department</strong><span>{profile.department || 'Not shared'}</span></div>
          <div className="preference-item"><strong>Academic level</strong><span>{profile.academicLevel || 'Not shared'}</span></div>
        </div>
      </section>
    </div>}
  </main><Footer /></>;
}
