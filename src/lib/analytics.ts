import { apiMutation } from './api';

export type ProductAnalyticsEvent =
  | 'DISCOVERY_VIEW'
  | 'SEARCH_PERFORMED'
  | 'LISTING_VIEW'
  | 'CONTACT_VIEW'
  | 'LISTING_DRAFT_STARTED'
  | 'LISTING_PHOTO_ADDED'
  | 'LISTING_PUBLISHED'
  | 'LISTING_SAVED'
  | 'INTEREST_RECORDED'
  | 'HANDOFF_AUTHORIZED'
  | 'WHATSAPP_OPENED';

type AnalyticsContext = {
  listingId?: string;
  institutionId?: string;
  intent?: 'ROOM_AVAILABLE' | 'ROOM_NEEDED';
};

const sourceStorageKey = 'campus-roomies-analytics-source';
const sourceTtlMs = 30 * 24 * 60 * 60 * 1000;

export async function trackAnalyticsEvent(
  eventName: ProductAnalyticsEvent,
  context: AnalyticsContext = {},
): Promise<void> {
  if (typeof window === 'undefined') return;
  const source = getAcquisitionSource();
  try {
    await apiMutation('/analytics/events', 'POST', {
      eventName,
      device: window.innerWidth < 768 ? 'MOBILE' : 'DESKTOP',
      source,
      ...context,
    });
  } catch {
    console.warn('A product analytics event could not be recorded.');
  }
}

function getAcquisitionSource(): string {
  const stored = readStoredSource();
  if (stored) return stored;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const source = utmSource && /^[a-zA-Z0-9._-]{1,100}$/.test(utmSource)
    ? utmSource.toLowerCase()
    : referringHostname() ?? 'direct';
  try {
    window.localStorage.setItem(sourceStorageKey, JSON.stringify({
      source,
      expiresAt: Date.now() + sourceTtlMs,
    }));
  } catch {
    return source;
  }
  return source;
}

function readStoredSource(): string | null {
  try {
    const raw = window.localStorage.getItem(sourceStorageKey);
    if (!raw) return null;
    const value = JSON.parse(raw) as { source?: unknown; expiresAt?: unknown };
    if (typeof value.source !== 'string'
      || !/^[a-zA-Z0-9._-]{1,100}$/.test(value.source)
      || typeof value.expiresAt !== 'number'
      || value.expiresAt <= Date.now()) {
      window.localStorage.removeItem(sourceStorageKey);
      return null;
    }
    return value.source;
  } catch {
    return null;
  }
}

function referringHostname(): string | null {
  if (!document.referrer) return null;
  try {
    const hostname = new URL(document.referrer).hostname.toLowerCase();
    return hostname && hostname !== window.location.hostname
      ? hostname.replace(/[^a-z0-9.-]/g, '').slice(0, 100) || null
      : null;
  } catch {
    return null;
  }
}
