'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearLocalListingDraft, readLocalListingDraft, type LocalListingDraft } from '@/lib/listing-local-draft';

const draftTargets = {
  ROOM_AVAILABLE: '/listings/new/room-available',
  ROOM_NEEDED: '/listings/new/room-needed',
} as const;

export function ResumeListingDraft() {
  const [draft, setDraft] = useState<LocalListingDraft | null>(null);

  useEffect(() => {
    setDraft(readLocalListingDraft('ROOM_AVAILABLE') ?? readLocalListingDraft('ROOM_NEEDED'));
  }, []);

  if (!draft) return null;

  const title = typeof draft.values.title === 'string' && draft.values.title
    ? draft.values.title
    : draft.intent === 'ROOM_AVAILABLE' ? 'Your room listing' : 'Your room search';
  const stepLabel = ['Details', 'Preferences', 'Photos', 'Review'][draft.step] ?? 'Details';
  const currentDraft = draft;

  function startOver() {
    if (!window.confirm('Start a new listing? Your current draft will be permanently removed from this browser.')) return;
    clearLocalListingDraft(currentDraft.intent);
    setDraft(null);
  }

  return (
    <div className="draft-resume" role="status">
      <div>
        <p className="eyebrow">Draft in progress</p>
        <h2>{title}</h2>
        <p>You can continue from the {stepLabel} step.</p>
      </div>
      <div className="draft-resume-actions">
        <Link className="button button-small" href={draftTargets[draft.intent]}>Continue draft →</Link>
        <button className="draft-start-over" type="button" onClick={startOver}>Start over</button>
      </div>
    </div>
  );
}
