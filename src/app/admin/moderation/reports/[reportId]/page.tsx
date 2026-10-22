'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, ShieldAlert } from 'lucide-react';
import { ModerationReport, adminApi } from '@/lib/admin-api';

const reasonLabels: Record<ModerationReport['reason'], string> = {
  SUSPICIOUS_LISTING: 'Suspicious listing',
  MISLEADING_INFORMATION: 'Misleading information',
  INAPPROPRIATE_CONTENT: 'Inappropriate content',
  SAFETY_CONCERN: 'Safety concern',
  OTHER: 'Other',
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function AdminReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ModerationReport | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState('');

  useEffect(() => {
    let active = true;
    adminApi.report(reportId)
      .then((data) => { if (active) setReport(data); })
      .catch((cause: Error) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reportId]);

  async function performAction(action: 'restrict' | 'restore' | 'found' | 'resolve') {
    const reason = decisionReason.trim();
    if (!reason) {
      setError('Add a decision note before taking action.');
      return;
    }
    if (action === 'found' && !window.confirm('Mark this listing as found? It will leave active discovery.')) return;

    setPendingAction(action);
    setError('');
    setSuccess('');
    try {
      if (action === 'resolve') {
        await adminApi.resolveReport(report!.id, reason);
        router.replace('/admin/moderation');
        return;
      }
      const result = action === 'restrict'
        ? await adminApi.restrictListing(report!.listingId, reason)
        : action === 'restore'
          ? await adminApi.restoreListing(report!.listingId, reason)
          : await adminApi.markListingFound(report!.listingId, reason);
      setReport({ ...report!, listingStatus: result.status });
      setSuccess(action === 'restrict'
        ? 'Listing restricted. The report remains open until you resolve it.'
        : action === 'restore'
          ? 'Listing restored. The report remains open until you resolve it.'
          : 'Listing marked as found. The report remains open until you resolve it.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to complete this moderation action.');
    } finally {
      setPendingAction('');
    }
  }

  if (loading) return <div className="admin-page"><p className="admin-empty" role="status">Loading report…</p></div>;
  if (error && !report) return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><p className="eyebrow">Trust &amp; safety</p><h1>Report unavailable</h1></div><Link className="button button-secondary" href="/admin/moderation"><ArrowLeft size={16} /> Back to queue</Link></div>
      <p className="admin-alert" role="alert">{error}</p>
    </div>
  );
  if (!report) return null;

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Trust &amp; safety · Report review</p>
          <h1>{report.title}</h1>
          <p className="admin-muted">Review report context and record an accountable decision.</p>
        </div>
        <Link className="button button-secondary" href="/admin/moderation"><ArrowLeft size={16} /> Back to queue</Link>
      </div>

      {error && <p className="admin-alert" role="alert">{error}</p>}
      {success && <p className="admin-success" role="status">{success}</p>}

      <div className="admin-report-detail-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><h2><ShieldAlert size={18} /> Report details</h2><p className="admin-muted">Submitted {formatDate(report.createdAt)}</p></div>
            <span className={`admin-status ${report.status === 'OPEN' ? 'is-report-open' : ''}`}>{report.status.toLowerCase()}</span>
          </div>
          <dl className="admin-detail-list">
            <div><dt>Reason</dt><dd>{reasonLabels[report.reason]}</dd></div>
            <div><dt>Listing intent</dt><dd>{report.intent === 'ROOM_AVAILABLE' ? 'Room available' : 'Room needed'}</dd></div>
            <div><dt>Listing status</dt><dd><span className={`admin-status ${report.listingStatus === 'ACTIVE' ? '' : 'is-archived'}`}>{report.listingStatus.toLowerCase()}</span></dd></div>
            <div><dt>Reporter notes</dt><dd className="admin-reporter-notes">{report.details || 'No additional details were provided.'}</dd></div>
          </dl>
          <Link className="admin-action-link admin-listing-link" href={`/listings/${report.listingId}`} target="_blank" rel="noreferrer">
            Open public listing <ExternalLink size={14} />
          </Link>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div><h2>Review decision</h2><p className="admin-muted">A decision note is required and recorded in the moderation audit.</p></div>
          </div>
          <label className="admin-decision-label" htmlFor="decision-note">Decision note</label>
          <textarea
            id="decision-note"
            className="admin-decision-input"
            rows={4}
            maxLength={1000}
            value={decisionReason}
            onChange={(event) => setDecisionReason(event.target.value)}
            placeholder="Summarize what you reviewed and why this action is appropriate."
            disabled={pendingAction !== ''}
          />
          <div className="admin-decision-footer"><span>{decisionReason.length}/1000</span></div>

          <div className="admin-moderation-actions">
            {report.listingStatus === 'ACTIVE' && <>
              <button className="button admin-button-danger" disabled={pendingAction !== ''} onClick={() => void performAction('restrict')}>
                {pendingAction === 'restrict' ? 'Restricting…' : 'Restrict listing'}
              </button>
              <button className="button button-secondary" disabled={pendingAction !== ''} onClick={() => void performAction('found')}>
                {pendingAction === 'found' ? 'Updating…' : 'Mark as found'}
              </button>
            </>}
            {report.listingStatus === 'RESTRICTED' && (
              <button className="button button-secondary" disabled={pendingAction !== ''} onClick={() => void performAction('restore')}>
                {pendingAction === 'restore' ? 'Restoring…' : 'Restore listing'}
              </button>
            )}
            {report.status === 'OPEN' && (
              <button className="button" disabled={pendingAction !== ''} onClick={() => void performAction('resolve')}>
                {pendingAction === 'resolve' ? 'Resolving…' : 'Resolve report'}
              </button>
            )}
          </div>
          {report.status === 'RESOLVED' && <p className="admin-footnote">This report is resolved. Listing status actions remain available for follow-up if needed.</p>}
        </section>
      </div>
    </div>
  );
}
