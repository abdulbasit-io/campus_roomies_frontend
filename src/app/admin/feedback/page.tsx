'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, MessageSquare, RefreshCw } from 'lucide-react';
import { AdminFeedback, PaginatedResult, adminApi } from '@/lib/admin-api';

const categoryLabels: Record<AdminFeedback['category'], string> = {
  IDEA: 'Idea or suggestion',
  BUG: 'Something is not working',
  USABILITY: 'Usability feedback',
  OTHER: 'Other feedback',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AdminFeedbackPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'NEW' | 'REVIEWED' | 'ALL'>('NEW');
  const [result, setResult] = useState<PaginatedResult<AdminFeedback> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    adminApi.feedback(page, status)
      .then(setResult)
      .catch((cause: Error) => {
        setResult(null);
        setError(cause.message);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { refresh(); }, [refresh]);

  async function markReviewed(feedback: AdminFeedback) {
    setUpdatingId(feedback.id);
    setError('');
    try {
      await adminApi.markFeedbackReviewed(feedback.id);
      refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update this feedback.');
    } finally {
      setUpdatingId('');
    }
  }

  const pageCount = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  return <div className="admin-page">
    <div className="admin-page-heading">
      <div>
        <p className="eyebrow">Product insights</p>
        <h1>Feedback inbox</h1>
        <p className="admin-muted">Suggestions and product feedback are kept separate from safety reports.</p>
      </div>
      <button className="button button-secondary" onClick={refresh} disabled={loading}>
        <RefreshCw size={16} /> Refresh inbox
      </button>
    </div>

    <section className="admin-panel" aria-labelledby="feedback-heading">
      <div className="admin-panel-heading feedback-inbox-heading">
        <div>
          <h2 id="feedback-heading"><MessageSquare size={18} /> Submissions</h2>
          <p className="admin-muted">{result ? `${result.total} ${status === 'ALL' ? 'total' : status.toLowerCase()} submissions` : 'Review feedback shared by students and visitors.'}</p>
        </div>
        <label className="feedback-status-filter">Show
          <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value as typeof status); }}>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ALL">All feedback</option>
          </select>
        </label>
      </div>

      {error && <p className="admin-alert" role="alert">{error}</p>}
      {loading && !result && <p className="admin-empty" role="status">Loading feedback…</p>}
      {!loading && !error && result?.items.length === 0 && <div className="admin-empty-state">
        <span><MessageSquare size={20} /></span>
        <strong>{status === 'NEW' ? 'Inbox clear' : 'No submissions found'}</strong>
        <p>{status === 'NEW' ? 'There are no new feedback submissions to review.' : 'Try another status filter.'}</p>
      </div>}

      <div className="admin-feedback-list">
        {result?.items.map((feedback) => <article className="admin-feedback-card" key={feedback.id}>
          <div className="admin-feedback-card-heading">
            <span className="admin-feedback-category">{categoryLabels[feedback.category]}</span>
            <span className={`admin-status ${feedback.status === 'REVIEWED' ? 'is-archived' : ''}`}>{feedback.status.toLowerCase()}</span>
          </div>
          <p className="admin-feedback-message">{feedback.message}</p>
          <div className="admin-feedback-meta">
            <span>Received {formatDate(feedback.createdAt)}</span>
            {feedback.contactEmail
              ? <a href={`mailto:${feedback.contactEmail}`}>Reply to {feedback.contactEmail}</a>
              : <span>No reply email provided</span>}
          </div>
          {feedback.status === 'NEW' && <button className="button button-secondary admin-feedback-review" onClick={() => markReviewed(feedback)} disabled={updatingId === feedback.id}>
            <Check size={15} /> {updatingId === feedback.id ? 'Saving…' : 'Mark reviewed'}
          </button>}
        </article>)}
      </div>

      {result && result.total > result.pageSize && <div className="admin-pagination">
        <span>{result.total} submissions</span>
        <div>
          <button className="button button-secondary" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button>
          <span>Page {page} of {pageCount}</span>
          <button className="button button-secondary" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)}>Next</button>
        </div>
      </div>}
    </section>
  </div>;
}
