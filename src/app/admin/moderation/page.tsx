'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Flag, RefreshCw } from 'lucide-react';
import { ModerationReport, PaginatedResult, adminApi } from '@/lib/admin-api';

const reasonLabels: Record<ModerationReport['reason'], string> = {
  SUSPICIOUS_LISTING: 'Suspicious listing',
  MISLEADING_INFORMATION: 'Misleading information',
  INAPPROPRIATE_CONTENT: 'Inappropriate content',
  SAFETY_CONCERN: 'Safety concern',
  OTHER: 'Other',
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function AdminModerationQueuePage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResult<ModerationReport> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    adminApi.reports(page)
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
          <h1>Report queue</h1>
          <p className="admin-muted">Review reports, take action on listings, and record the outcome.</p>
        </div>
        <button className="button button-secondary" onClick={refresh} disabled={loading}>
          <RefreshCw size={16} /> Refresh queue
        </button>
      </div>

      <section className="admin-panel" aria-labelledby="open-reports-heading">
        <div className="admin-panel-heading">
          <div>
            <h2 id="open-reports-heading"><Flag size={18} /> Open reports</h2>
            <p className="admin-muted">{result ? `${result.total} awaiting review` : 'Reports are ordered from oldest to newest.'}</p>
          </div>
          <Link className="arrow-link" href="/admin/moderation/audit">View moderation history <ArrowRight size={15} /></Link>
        </div>

        {error && <p className="admin-alert" role="alert">{error}</p>}
        {loading && !result ? <p className="admin-empty" role="status">Loading reports…</p> : null}
        {!loading && !error && result?.items.length === 0
          ? <div className="admin-empty-state"><span><Flag size={20} /></span><strong>Queue clear</strong><p>No open reports need review right now.</p></div>
          : null}
        {result && result.items.length > 0 && (
          <div className="admin-report-list">
            {result.items.map((report) => (
              <article className="admin-report-card" key={report.id}>
                <div className="admin-report-card-main">
                  <div className="admin-report-card-heading">
                    <span className="admin-report-reason">{reasonLabels[report.reason]}</span>
                    <span className={`admin-status ${report.listingStatus === 'ACTIVE' ? '' : 'is-archived'}`}>{report.listingStatus.toLowerCase()}</span>
                  </div>
                  <h3>{report.title}</h3>
                  <p className="admin-report-summary">{report.details || 'No additional details were provided.'}</p>
                  <div className="admin-report-meta">
                    <span>{report.intent === 'ROOM_AVAILABLE' ? 'Room available' : 'Room needed'}</span>
                    <span>Reported {formatDate(report.createdAt)}</span>
                  </div>
                </div>
                <Link className="button button-secondary admin-review-link" href={`/admin/moderation/reports/${report.id}`}>
                  Review report <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        )}

        {result && result.total > result.pageSize && (
          <div className="admin-pagination">
            <span>{result.total} open reports</span>
            <div>
              <button className="button button-secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button>
              <span>Page {page} of {pageCount}</span>
              <button className="button button-secondary" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)}>Next</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
