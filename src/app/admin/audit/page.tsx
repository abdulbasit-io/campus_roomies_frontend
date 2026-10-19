'use client';

import { useEffect, useState } from 'react';
import { AdminAuditAction, adminApi } from '@/lib/admin-api';

export default function AdminAuditPage() {
  const [entityType, setEntityType] = useState<'' | 'INSTITUTION' | 'AREA'>('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ items: AdminAuditAction[]; page: number; pageSize: number; total: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    adminApi.audit(page, entityType || undefined)
      .then(setResult)
      .catch((cause: Error) => setError(cause.message));
  }, [page, entityType]);

  const pageCount = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="eyebrow">Administration</p><h1>Catalog audit history</h1><p className="admin-muted">Review changes made to institutions and campus areas.</p></div>
        <label className="admin-filter">Record type<select value={entityType} onChange={(event) => { setEntityType(event.target.value as '' | 'INSTITUTION' | 'AREA'); setPage(1); }}><option value="">All changes</option><option value="INSTITUTION">Institutions</option><option value="AREA">Areas</option></select></label>
      </div>
      <section className="admin-panel">
        {error && <p className="admin-alert" role="alert">{error}</p>}
        {!result && !error && <p className="admin-empty" role="status">Loading audit history…</p>}
        {result && result.items.length === 0 ? <p className="admin-empty">No catalog actions found.</p> : result && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Action</th><th>Institution</th><th>Area</th><th>Administrator</th><th>Timestamp</th></tr></thead><tbody>
          {result.items.map((entry) => <tr key={entry.id}><td className="admin-capitalize">{entry.action.toLowerCase().replaceAll('_', ' ')}</td><td>{entry.institutionName ?? '—'}</td><td>{entry.areaName ?? '—'}</td><td>{entry.adminFirstName} {entry.adminLastName}</td><td>{new Date(entry.createdAt).toLocaleString()}</td></tr>)}
        </tbody></table></div>}
        {result && result.total > result.pageSize && <div className="admin-pagination"><span>{result.total} audit records</span><div><button className="button button-secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button className="button button-secondary" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>}
      </section>
    </div>
  );
}
