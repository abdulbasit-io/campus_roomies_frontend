'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Footer, Header } from '@/components/site-chrome';
import { Institution, getMyProfile, listInstitutions, Profile, updateMyProfile, uploadProfilePhoto } from '@/lib/frontend-api';
import { useSession } from '@/lib/session';
import { getLocalRedirectTarget } from '@/lib/redirect';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { profile: session, updateProfile } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [phone, setPhone] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [department, setDepartment] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [about, setAbout] = useState('');
  const [confirmWhatsapp, setConfirmWhatsapp] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    Promise.all([getMyProfile(), listInstitutions()]).then(([current, catalog]) => {
      setProfile(current);
      setInstitutions(catalog);
      setPhone(current.whatsappNumber ?? '');
      setConfirmWhatsapp(current.phoneConfirmed);
      setInstitutionId(current.institutionId ?? '');
      setDepartment(current.department ?? '');
      setAcademicLevel(current.academicLevel ?? '');
      setAbout(current.about ?? '');
    }).catch((cause: Error) => setError(cause.message));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    if (!confirmWhatsapp) {
      setPending(false);
      setError('Confirm that this is the WhatsApp number where you can be reached.');
      return;
    }
    try {
      const updated = await updateMyProfile({
        whatsappNumber: phone,
        confirmWhatsapp: true,
        institutionId,
        department,
        academicLevel,
        about,
      });
      updateProfile({
        userId: updated.userId,
        role: session?.role ?? 'USER',
        firstName: updated.firstName,
        lastNameInitial: `${updated.lastName.charAt(0).toUpperCase()}.`,
        email: updated.email,
        phoneConfirmed: updated.phoneConfirmed,
        profileComplete: updated.profileComplete,
        photoUrl: updated.photoUrl,
      });
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(getLocalRedirectTarget(next, '/browse', window.location.origin));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update your profile.');
    } finally {
      setPending(false);
    }
  }

  async function selectProfilePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingPhoto(true);
    setError('');
    try {
      const result = await uploadProfilePhoto(file);
      setProfile((current) => current ? { ...current, photoUrl: result.photoUrl } : current);
      if (session) updateProfile({ ...session, photoUrl: result.photoUrl });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to upload your profile picture.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  return <><Header /><main className="auth-page shell"><form className="auth-card" onSubmit={submit}>
    <p className="eyebrow">Profile completion</p><h1>A little context goes a long way.</h1>
    <p className="auth-copy">{profile ? `Hi ${profile.firstName}, add the details students need before connecting.` : 'Loading your account profile…'}</p>
    <div className="profile-photo-control">
      <div className="profile-photo-preview" role="img" aria-label={profile?.photoUrl ? 'Your profile picture' : 'No profile picture selected'} style={profile?.photoUrl ? { backgroundImage: `url("${profile.photoUrl}")` } : undefined}>
        {!profile?.photoUrl && profile?.firstName?.charAt(0).toUpperCase()}
      </div>
      <label>Profile picture <small>Required to create a listing</small>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectProfilePhoto} disabled={uploadingPhoto || pending} />
      </label>
      <small>{uploadingPhoto ? 'Uploading picture…' : 'JPG, PNG, or WebP · up to 5 MB'}</small>
    </div>
    <label>WhatsApp number<input required minLength={7} maxLength={20} value={phone} onChange={(event) => { setPhone(event.target.value); setConfirmWhatsapp(false); }} placeholder="+234 800 000 0000" /></label>
    <label>Institution<select required value={institutionId} onChange={(event) => setInstitutionId(event.target.value)}><option value="">Choose your institution</option>{institutions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label>Department<input required maxLength={120} value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="e.g. Computer Science" /></label>
    <label>Academic level<input required maxLength={80} value={academicLevel} onChange={(event) => setAcademicLevel(event.target.value)} placeholder="e.g. 300 Level" /></label>
    <label>About you <small>{about.length}/500</small><textarea required maxLength={500} value={about} onChange={(event) => setAbout(event.target.value)} placeholder="A line or two about your course, year, or living rhythm." /></label>
    <label className="profile-attestation"><input type="checkbox" checked={confirmWhatsapp} onChange={(event) => setConfirmWhatsapp(event.target.checked)} /> I confirm this is my WhatsApp number. If the number is not correct, listers may not be able to contact me.</label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button full-width" type="submit" disabled={pending || uploadingPhoto || !profile}>{pending ? 'Saving profile…' : 'Save profile'}</button>
    <Link className="back-link" href="/profile">← Back to profile</Link>
  </form></main><Footer /></>;
}
