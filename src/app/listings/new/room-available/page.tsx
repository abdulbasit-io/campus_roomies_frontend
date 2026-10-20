import { Suspense } from 'react';
import { ListingWizard } from '@/components/listing-wizard';

export default function RoomAvailablePage() {
  return <Suspense fallback={<main className="wizard-page shell"><p className="contact-loading" role="status">Loading your listing…</p></main>}><ListingWizard /></Suspense>;
}
