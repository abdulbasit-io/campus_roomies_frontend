import { Suspense } from 'react';
import { SeekerWizard } from '@/components/seeker-wizard';

export default function RoomNeededPage() {
  return <Suspense fallback={<main className="wizard-page shell"><p className="contact-loading" role="status">Loading your search…</p></main>}><SeekerWizard /></Suspense>;
}
