'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { AdminAnalytics, AnalyticsBreakdown, adminApi } from '@/lib/admin-api';

const ranges = [7, 30, 90] as const;

function number(value: number): string {
  return value.toLocaleString();
}

function BreakdownPanel({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: AnalyticsBreakdown[];
  emptyLabel: string;
}) {
  const maximum = Math.max(...items.map((item) => item.sessions), 1);
  return (
    <section className="admin-panel analytics-breakdown">
      <h2>{title}</h2>
      {items.length === 0 ? <p className="admin-empty">{emptyLabel}</p> : (
        <ol>
          {items.map((item) => (
            <li key={item.label}>
              <div className="analytics-breakdown-label">
                <span>{item.label.replaceAll('_', ' ')}</span>
                <strong>{number(item.sessions)} sessions</strong>
              </div>
              <div className="analytics-bar-track" aria-hidden="true">
                <span style={{ width: `${Math.max((item.sessions / maximum) * 100, 2)}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState<(typeof ranges)[number]>(30);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setAnalytics(null);
    setError('');
    adminApi.analytics(days)
      .then((result) => { if (active) setAnalytics(result); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load analytics.');
      });
    return () => { active = false; };
  }, [days]);

  return (
    <div className="admin-page">
      <div className="admin-page-heading analytics-heading">
        <div>
          <Link href="/admin" className="arrow-link"><ArrowLeft size={15} /> Administration</Link>
          <p className="eyebrow">Product analytics</p>
          <h1>Understand how students connect</h1>
          <p className="admin-muted">First-party, privacy-limited activity. Counts are not cross-site or WhatsApp conversation tracking.</p>
        </div>
        <label className="admin-filter">Reporting period
          <select value={days} onChange={(event) => setDays(Number(event.target.value) as (typeof ranges)[number])}>
            {ranges.map((range) => <option key={range} value={range}>Last {range} days</option>)}
          </select>
        </label>
      </div>

      {error && <p className="admin-alert" role="alert">{error}</p>}
      {!analytics && !error && <p className="admin-muted" role="status">Loading product analytics…</p>}
      {analytics && <>
        <section className="admin-stat-grid analytics-stat-grid" aria-label="Key platform metrics">
          <article className="admin-stat-card"><span>Registered users</span><strong>{number(analytics.summary.totalUsers)}</strong><small>{number(analytics.summary.newUsers)} joined in this period</small></article>
          <article className="admin-stat-card"><span>Unique visitors</span><strong>{number(analytics.summary.visitors)}</strong><small>Pseudonymous first-party visitors in this period</small></article>
          <article className="admin-stat-card"><span>Meaningfully active</span><strong>{number(analytics.summary.activeUsers)}</strong><small>Registered users with a tracked action</small></article>
          <article className="admin-stat-card"><span>Active listings</span><strong>{number(analytics.summary.activeListings)}</strong><small>{number(analytics.summary.activeRoomListings)} rooms · {number(analytics.summary.activeSeekerListings)} room requests</small></article>
          <article className="admin-stat-card"><span>Interests recorded</span><strong>{number(analytics.summary.interests)}</strong><small>During the selected period</small></article>
          <article className="admin-stat-card"><span>Handoffs authorized</span><strong>{number(analytics.summary.handoffs)}</strong><small>{number(analytics.summary.whatsappOpens)} WhatsApp link opens</small></article>
          <article className="admin-stat-card"><span>Listings published</span><strong>{number(analytics.summary.publishedListings)}</strong><small>During the selected period</small></article>
          <article className="admin-stat-card"><span>Total handoffs</span><strong>{number(analytics.summary.totalHandoffs)}</strong><small>Recorded since analytics began</small></article>
        </section>

        <section className="admin-panel analytics-actions">
          <h2>Engagement actions</h2>
          <div>
            <p><strong>{number(analytics.summary.searches)}</strong><span>Searches performed</span></p>
            <p><strong>{number(analytics.summary.savedListings)}</strong><span>Listings saved</span></p>
            <p><strong>{number(analytics.summary.listingDrafts)}</strong><span>Listing flows started</span></p>
            <p><strong>{number(analytics.summary.photosAdded)}</strong><span>Photo batches added</span></p>
          </div>
        </section>

        <section className="admin-panel analytics-funnel">
          <div className="admin-panel-heading">
            <div><h2><BarChart3 size={18} /> Discovery-to-contact funnel</h2><p className="admin-muted">Distinct browser sessions with each recorded step during the period.</p></div>
          </div>
          <ol>
            {analytics.funnel.map((stage, index) => (
              <li key={stage.eventName}>
                <span className="analytics-step">{index + 1}</span>
                <span className="analytics-stage-name">{stage.label}</span>
                <strong>{number(stage.sessions)}</strong>
                <small>{stage.conversionFromPrevious === null ? 'Starting point' : `${stage.conversionFromPrevious}% from previous step`}</small>
              </li>
            ))}
          </ol>
          <p className="admin-footnote">{analytics.limitations.handoff} {analytics.limitations.funnel}</p>
        </section>

        <div className="analytics-breakdown-grid">
          <BreakdownPanel title="Institutions" items={analytics.breakdowns.institution} emptyLabel="No institution-tagged events in this period." />
          <BreakdownPanel title="Listing intent" items={analytics.breakdowns.listingIntent} emptyLabel="No listing-intent events in this period." />
          <BreakdownPanel title="Acquisition source" items={analytics.breakdowns.acquisitionSource} emptyLabel="No source-tagged events in this period." />
          <BreakdownPanel title="Device" items={analytics.breakdowns.device} emptyLabel="No device-tagged events in this period." />
        </div>
        <p className="admin-footnote analytics-disclaimer">
          Visitors are identified using a pseudonymous first-party identifier lasting up to 30 days; raw events are retained for 90 days. {analytics.limitations.activeUsers} Analytics does not store search text, full page URLs, or contact details.
        </p>
      </>}
    </div>
  );
}
