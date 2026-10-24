'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackAnalyticsEvent } from '@/lib/analytics';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const dedupeKey = `campus-roomies-analytics-page:${pathname}`;
    const now = Date.now();
    try {
      const lastVisit = Number(window.sessionStorage.getItem(dedupeKey) ?? 0);
      if (now - lastVisit < 1500) return;
      window.sessionStorage.setItem(dedupeKey, String(now));
    } catch {
      // Tracking still proceeds if session storage is unavailable.
    }

    if (pathname === '/' || pathname === '/browse') {
      void trackAnalyticsEvent('DISCOVERY_VIEW');
      return;
    }
    if (pathname === '/listings/new/room-available') {
      void trackAnalyticsEvent('LISTING_DRAFT_STARTED', { intent: 'ROOM_AVAILABLE' });
      return;
    }
    if (pathname === '/listings/new/room-needed') {
      void trackAnalyticsEvent('LISTING_DRAFT_STARTED', { intent: 'ROOM_NEEDED' });
      return;
    }
    const contactMatch = /^\/listings\/([^/]+)\/contact$/.exec(pathname);
    if (contactMatch && uuidPattern.test(contactMatch[1])) {
      void trackAnalyticsEvent('CONTACT_VIEW', { listingId: contactMatch[1] });
      return;
    }
    const listingMatch = /^\/listings\/([^/]+)$/.exec(pathname);
    if (listingMatch && uuidPattern.test(listingMatch[1])) {
      void trackAnalyticsEvent('LISTING_VIEW', { listingId: listingMatch[1] });
    }
  }, [pathname]);

  return null;
}
