'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';

export default function NewInstitutionPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const institution = await adminApi.createInstitution({ name, abbreviation });
      router.replace(`/admin/institutions/${institution.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create institution.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-page admin-form-page">
      <div className="admin-page-heading"><div><p className="eyebrow">Catalog / Institutions</p><h1>Add an institution</h1><p className="admin-muted">Create a catalog entry for a campus community.</p></div></div>
      <form className="admin-panel admin-form" onSubmit={submit}>
        <label>Institution name<input required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Federal University of Agriculture, Abeokuta" /></label>
        <label>Abbreviation<input required maxLength={20} value={abbreviation} onChange={(event) => setAbbreviation(event.target.value.toUpperCase())} placeholder="e.g. FUNAAB" /></label>
        <p className="admin-footnote">Abbreviations are stored in uppercase and must be unique.</p>
        {error && <p className="admin-alert" role="alert">{error}</p>}
        <div className="admin-form-actions"><Link className="button button-secondary" href="/admin/institutions">Cancel</Link><button className="button" disabled={pending}>{pending ? 'Creating…' : 'Create institution'}</button></div>
      </form>
    </div>
  );
}
