'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Archive, MapPin, RotateCcw } from 'lucide-react';
import { CatalogInstitution, adminApi } from '@/lib/admin-api';

export default function InstitutionDetailsPage() {
  const params = useParams<{ institutionId: string }>();
  const institutionId = params.institutionId;
  const [institution, setInstitution] = useState<CatalogInstitution | null>(null);
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);

  const load = useCallback(() => {
    adminApi.listInstitutions(true).then((items) => {
      const current = items.find((item) => item.id === institutionId);
      if (!current) {
        setError('Institution not found.');
        return;
      }
      setInstitution(current);
      setName(current.name);
      setAbbreviation(current.abbreviation);
    }).catch((cause: Error) => setError(cause.message));
  }, [institutionId]);

  useEffect(() => { load(); }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setPending(true);
    try {
      const updated = await adminApi.updateInstitution(institutionId, { name, abbreviation });
      setInstitution(updated);
      setName(updated.name);
      setAbbreviation(updated.abbreviation);
      setNotice('Institution details saved.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save institution.');
    } finally {
      setPending(false);
    }
  }

  async function toggleArchive() {
    if (!institution) return;
    setError('');
    setNotice('');
    if (!institution.archivedAt && !window.confirm(`Archive ${institution.name}? Existing records remain, but this will hide it from public selectors.`)) return;
    try {
      const updated = institution.archivedAt
        ? await adminApi.restoreInstitution(institution.id)
        : await adminApi.archiveInstitution(institution.id);
      setInstitution(updated);
      setNotice(updated.archivedAt ? 'Institution archived.' : 'Institution restored.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update institution status.');
    }
  }

  if (!institution && !error) return <div className="admin-page"><p className="admin-muted" role="status">Loading institution…</p></div>;
  if (!institution) return <div className="admin-page"><p className="admin-alert" role="alert">{error}</p><Link href="/admin/institutions">Back to institutions</Link></div>;

  return (
    <div className="admin-page admin-form-page">
      <div className="admin-page-heading"><div><p className="eyebrow">Catalog / Institutions</p><h1>{institution.name}</h1><p className="admin-muted">Edit catalog details and manage campus areas.</p></div><span className={`admin-status ${institution.archivedAt ? 'is-archived' : ''}`}>{institution.archivedAt ? 'Archived' : 'Active'}</span></div>
      <form className="admin-panel admin-form" onSubmit={save}>
        <label>Institution name<input required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>Abbreviation<input required maxLength={20} value={abbreviation} onChange={(event) => setAbbreviation(event.target.value.toUpperCase())} /></label>
        {error && <p className="admin-alert" role="alert">{error}</p>}
        {notice && <p className="admin-success" role="status">{notice}</p>}
        <div className="admin-form-actions"><button className="button" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button><button className="button button-secondary" type="button" onClick={toggleArchive}>{institution.archivedAt ? <RotateCcw size={16} /> : <Archive size={16} />}{institution.archivedAt ? 'Restore institution' : 'Archive institution'}</button></div>
      </form>
      <Link className="admin-panel admin-area-link" href={`/admin/institutions/${institution.id}/areas`}><span className="admin-area-link-icon"><MapPin size={19} /></span><span><strong>Manage campus areas</strong><small>{institution.areaCount ?? 0} areas · add, rename, archive, and restore</small></span><span aria-hidden="true">→</span></Link>
      {institution.archivedAt && <p className="admin-footnote">Archived on {new Date(institution.archivedAt).toLocaleString()}. Restore the institution before restoring its areas.</p>}
    </div>
  );
}
