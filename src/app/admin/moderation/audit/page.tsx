'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { ModerationAuditAction, PaginatedResult, adminApi } from '@/lib/admin-api';

function actionLabel(action: ModerationAuditAction['action']) {
  switch (action) {
    case 'RESTRICT': return 'Restricted listing';
    case 'RESTORE': return 'Restored listing';
    case 'RESOLVE_REPORT': return 'Resolved report';
    case 'MARK_FOUND': return 'Marked as found';
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function AdminModerationAuditPage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<ModerationAuditAction> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    adminApi.moderationAudit(page)
      .then(setResult)
      .catch((cause: Error) => {
        setResult(null);
        setError(cause.message);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { refresh(); }, [refresh]);
  const pageCount = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Trust &amp; safety</p>
          <h1>Moderation history</h1>
          <p className="admin-muted">A chronological record of administrator decisions and their audit notes.</p>
        </div>
        <div className="admin-heading-actions">
          <button className="button button-secondary" onClick={refresh} disabled={loading}><RefreshCw size={16} /> Refresh</button>
          <Link className="button button-secondary" href="/admin/moderation"><ArrowLeft size={16} /> Report queue</Link>
        </div>
      </div>
      <section className="admin-panel">
        {error && <p className="admin-alert" role="alert">{error}</p>}
        {loading && !result ? <p className="admin-empty" role="status">Loading moderation history…</p> : null}
        {!loading && !error && result?.items.length === 0
          ? <p className="admin-empty">No moderation decisions have been recorded.</p>
          : null}
        {result && result.items.length > 0 && (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table admin-moderation-audit-table">
                <thead><tr><th>Action</th><th>Listing</th><th>Decision note</th><th>Administrator</th><th>When</th></tr></thead>
                <tbody>
                  {result.items.map((entry) => (
                    <tr key={entry.id}>
                      <td>{actionLabel(entry.action)}</td>
                      <td>
                        <span>{entry.listingTitle ?? 'Listing no longer available'}</span>
                        {entry.reportId && <Link className="admin-action-link" href={`/admin/moderation/reports/${entry.reportId}`}>Open report</Link>}
                      </td>
                      <td className="admin-audit-reason">{entry.reason ?? 'No note recorded'}</td>
                      <td>{entry.adminFirstName} {entry.adminLastName}</td>
                      <td>{formatDate(entry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-pagination">
              <span>{result.total} moderation actions</span>
              <div>
                <button className="button button-secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button>
                <span>Page {page} of {pageCount}</span>
                <button className="button button-secondary" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)}>Next</button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
