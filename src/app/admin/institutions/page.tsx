'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Archive, Building2, Plus, RotateCcw } from 'lucide-react';
import { CatalogInstitution, adminApi } from '@/lib/admin-api';

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<CatalogInstitution[]>([]);
  const [includeArchived, setIncludeArchived] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    adminApi.listInstitutions(includeArchived)
      .then(setInstitutions)
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, [includeArchived]);

  useEffect(() => { refresh(); }, [refresh]);

  async function toggleArchive(institution: CatalogInstitution) {
    setError('');
    try {
      if (institution.archivedAt) await adminApi.restoreInstitution(institution.id);
      else if (window.confirm(`Archive ${institution.name}? It will no longer appear in public selectors.`)) {
        await adminApi.archiveInstitution(institution.id);
      } else return;
      refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update institution.');
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div><p className="eyebrow">Catalog</p><h1>Institutions</h1><p className="admin-muted">Add and maintain institutions and their areas.</p></div>
        <Link className="button" href="/admin/institutions/new"><Plus size={17} /> Add institution</Link>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-heading"><div><h2><Building2 size={19} /> Institution list</h2><p className="admin-muted">{institutions.length} records shown</p></div>
          <label className="admin-checkbox"><input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} /> Include archived</label>
        </div>
        {error && <p className="admin-alert" role="alert">{error}</p>}
        {loading ? <p className="admin-empty" role="status">Loading institutions…</p> : institutions.length === 0 ? <p className="admin-empty">No institutions found.</p> : (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Institution</th><th>Abbreviation</th><th>Areas</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {institutions.map((institution) => <tr key={institution.id}>
              <td><Link className="admin-table-link" href={`/admin/institutions/${institution.id}`}>{institution.name}</Link></td>
              <td>{institution.abbreviation}</td><td>{institution.areaCount ?? 0}</td>
              <td><span className={`admin-status ${institution.archivedAt ? 'is-archived' : ''}`}>{institution.archivedAt ? 'Archived' : 'Active'}</span></td>
              <td><div className="admin-row-actions"><Link className="admin-action-link" href={`/admin/institutions/${institution.id}`}>Edit</Link><button className="admin-icon-action" onClick={() => toggleArchive(institution)} aria-label={`${institution.archivedAt ? 'Restore' : 'Archive'} ${institution.name}`}>{institution.archivedAt ? <RotateCcw size={16} /> : <Archive size={16} />}</button></div></td>
            </tr>)}
          </tbody></table></div>
        )}
        <p className="admin-footnote">Archiving keeps existing listings intact but removes this institution from new public selectors.</p>
      </section>
    </div>
  );
}
