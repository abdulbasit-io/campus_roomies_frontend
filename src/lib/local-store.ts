import type { Listing } from '@/lib/domain';

export const savedListingsKey = 'campus-roomies-saved-listings';
export const draftsKey = 'campus-roomies-drafts';
export const reportsKey = 'campus-roomies-reports';

export function readStoredIds(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem(key) ?? '[]') as string[]; } catch { return []; }
}

export function writeStoredIds(key: string, ids: string[]) {
  window.localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new Event('campus-roomies-storage'));
}

export function getSavedListings(listings: Listing[]) {
  const ids = new Set(readStoredIds(savedListingsKey));
  return listings.filter((listing) => ids.has(listing.id));
}
