import type { ListingIntent } from './domain';

const localDraftKey = 'campus-roomies-listing-draft';

export type LocalListingDraft = {
  intent: ListingIntent;
  step: number;
  draftId: string;
  values: Record<string, unknown>;
  savedAt: number;
};

export function readLocalListingDraft(intent: ListingIntent): LocalListingDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(localDraftKey) ?? 'null') as Partial<LocalListingDraft> | null;
    if (!parsed || parsed.intent !== intent || typeof parsed.values !== 'object' || parsed.values === null) return null;
    return {
      intent,
      step: typeof parsed.step === 'number' ? parsed.step : 0,
      draftId: typeof parsed.draftId === 'string' ? parsed.draftId : '',
      values: parsed.values,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function writeLocalListingDraft(draft: Omit<LocalListingDraft, 'savedAt'>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(localDraftKey, JSON.stringify({ ...draft, savedAt: Date.now() }));
}

export function clearLocalListingDraft(intent: ListingIntent) {
  const draft = readLocalListingDraft(intent);
  if (draft?.intent === intent) window.localStorage.removeItem(localDraftKey);
}
