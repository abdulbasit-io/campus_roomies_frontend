'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Archive, RotateCcw } from 'lucide-react';
import { CatalogArea, CatalogInstitution, adminApi } from '@/lib/admin-api';

export default function InstitutionAreasPage() {
  const params = useParams<{ institutionId: string }>();
  const institutionId = params.institutionId;
  const [institution, setInstitution] = useState<CatalogInstitution | null>(null);
  const [areas, setAreas] = useState<CatalogArea[]>([]);
  const [newArea, setNewArea] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [includeArchived, setIncludeArchived] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [institutions, nextAreas] = await Promise.all([
        adminApi.listInstitutions(true),
        adminApi.listAreas(institutionId, includeArchived),
      ]);
      const current = institutions.find((item) => item.id === institutionId);
      if (!current) {
        setError('Institution not found.');
        return;
      }
      setInstitution(current);
      setAreas(nextAreas);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load campus areas.');
    }
  }, [institutionId, includeArchived]);

  useEffect(() => { void load(); }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    setNotice('');
    try {
      await adminApi.createArea(institutionId, newArea);
      setNewArea('');
      setNotice('Area added.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to add area.');
    } finally {
      setPending(false);
    }
  }

  async function saveArea(areaId: string) {
    setPending(true);
    setError('');
    setNotice('');
    try {
      await adminApi.updateArea(institutionId, areaId, editingName);
      setEditingId(null);
      setNotice('Area name saved.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update area.');
    } finally {
      setPending(false);
    }
  }

  async function toggleArchive(area: CatalogArea) {
    setError('');
    setNotice('');
    if (!area.archivedAt && !window.confirm(`Archive ${area.name}? Existing listings keep their saved area.`)) return;
    try {
      if (area.archivedAt) await adminApi.restoreArea(institutionId, area.id);
      else await adminApi.archiveArea(institutionId, area.id);
      setNotice(area.archivedAt ? 'Area restored.' : 'Area archived.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update area.');
    }
  }

  if (error && !institution) return <div className="admin-page"><p className="admin-alert" role="alert">{error}</p><Link href="/admin/institutions">Back to institutions</Link></div>;
  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="eyebrow">Catalog / Areas</p><h1>{institution?.name ?? 'Campus areas'}</h1><p className="admin-muted">Manage the searchable neighborhoods and areas for this institution.</p></div><Link className="button button-secondary" href={`/admin/institutions/${institutionId}`}>Institution details</Link></div>
      {institution?.archivedAt && <p className="admin-alert" role="status">This institution is archived. Restore it before adding or restoring areas.</p>}
      <form className="admin-panel admin-add-area" onSubmit={create}>
        <label htmlFor="new-area">Add a campus area</label>
        <div><input id="new-area" required maxLength={120} value={newArea} onChange={(event) => setNewArea(event.target.value)} placeholder="e.g. Isolu" /><button className="button" disabled={pending || Boolean(institution?.archivedAt)}>Add area</button></div>
      </form>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h2>Areas</h2><p className="admin-muted">{areas.length} records shown</p></div><label className="admin-checkbox"><input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} /> Include archived</label></div>
        {error && <p className="admin-alert" role="alert">{error}</p>}
        {notice && <p className="admin-success" role="status">{notice}</p>}
        {areas.length === 0 ? <p className="admin-empty">No areas found for this institution.</p> : <div className="admin-area-list">
          {areas.map((area) => <div className={`admin-area-row ${area.archivedAt ? 'is-archived' : ''}`} key={area.id}>
            {editingId === area.id ? <div className="admin-area-edit"><input aria-label="Area name" required maxLength={120} value={editingName} onChange={(event) => setEditingName(event.target.value)} /><button className="admin-action-link" disabled={pending} onClick={() => saveArea(area.id)}>Save</button><button className="admin-action-link" onClick={() => setEditingId(null)}>Cancel</button></div> : <><div><strong>{area.name}</strong><small>{area.archivedAt ? 'Archived' : 'Active'}{area.archivedAt ? ` · ${new Date(area.archivedAt).toLocaleDateString()}` : ''}</small></div><div className="admin-row-actions"><button className="admin-action-link" onClick={() => { setEditingId(area.id); setEditingName(area.name); }}>Rename</button><button className="admin-icon-action" disabled={Boolean(institution?.archivedAt)} onClick={() => toggleArchive(area)} aria-label={`${area.archivedAt ? 'Restore' : 'Archive'} ${area.name}`}>{area.archivedAt ? <RotateCcw size={16} /> : <Archive size={16} />}</button></div></>}
          </div>)}
        </div>}
        <p className="admin-footnote">Archived areas remain connected to existing listings but are unavailable for new selection.</p>
      </section>
    </div>
  );
}
