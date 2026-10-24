'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Building2, Flag, MapPin } from 'lucide-react';
import { AdminAuditAction, AdminDashboard, adminApi } from '@/lib/admin-api';

function formatAction(action: AdminAuditAction) {
  return action.action.toLowerCase().replaceAll('_', ' ');
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [openReportCount, setOpenReportCount] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [reportsError, setReportsError] = useState('');

  useEffect(() => {
    adminApi.dashboard().then(setDashboard).catch((cause: Error) => setError(cause.message));
    adminApi.reports(1, 1)
      .then((result) => setOpenReportCount(result.total))
      .catch((cause: Error) => setReportsError(cause.message));
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div><p className="eyebrow">Campus Roomies administration</p><h1>Operations overview</h1><p className="admin-muted">Manage platform listings, reports, and catalog activity.</p></div>
        <div className="admin-heading-actions"><Link className="button button-secondary" href="/admin/analytics">View analytics <ArrowRight size={16} /></Link><Link className="button" href="/admin/moderation">Review reports <ArrowRight size={16} /></Link></div>
      </div>
      {error && <p className="admin-alert" role="alert">{error}</p>}
      {reportsError && <p className="admin-alert" role="alert">Unable to load the open report count: {reportsError}</p>}
      {!dashboard && !error && <p className="admin-muted" role="status">Loading catalog summary…</p>}
      {dashboard && <>
        <section className="admin-stat-grid admin-stat-grid-three" aria-label="Platform totals">
          <article className="admin-stat-card"><span><Building2 size={18} /> Institutions</span><strong>{dashboard.institutions}</strong><small>{dashboard.active_institutions} active · {dashboard.archived_institutions} archived</small></article>
          <article className="admin-stat-card"><span><MapPin size={18} /> Areas</span><strong>{dashboard.areas}</strong><small>{dashboard.active_areas} active · {dashboard.archived_areas} archived</small></article>
          <Link className="admin-stat-card admin-stat-link" href="/admin/moderation"><span><Flag size={18} /> Open reports</span><strong>{openReportCount ?? '—'}</strong><small>{openReportCount === 1 ? 'Needs administrator review' : 'Need administrator review'}</small></Link>
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>Recent catalog changes</h2><p className="admin-muted">Latest administrator activity</p></div><Link className="arrow-link" href="/admin/audit">View audit history <ArrowRight size={15} /></Link></div>
          {dashboard.recentActions.length === 0 ? <p className="admin-empty">No catalog changes have been recorded yet.</p> : (
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Action</th><th>Record</th><th>Administrator</th><th>When</th></tr></thead><tbody>
              {dashboard.recentActions.map((action) => <tr key={action.id}><td className="admin-capitalize">{formatAction(action)}</td><td>{action.areaName ?? action.institutionName ?? action.entityType.toLowerCase()}</td><td>{action.adminFirstName} {action.adminLastName}</td><td>{new Date(action.createdAt).toLocaleString()}</td></tr>)}
            </tbody></table></div>
          )}
        </section>
      </>}
    </div>
  );
}
