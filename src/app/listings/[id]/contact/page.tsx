import Link from 'next/link';
import { Footer, Header } from '@/components/site-chrome';
import { ContactHandoff } from '@/components/contact-handoff';

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <><Header /><main className="handoff-page shell"><div className="handoff-card"><ContactHandoff listingId={id} /><Link className="back-link" href={`/listings/${id}`}>← Back to listing</Link><div className="review-note">Meet in a safe place, visit the room, and never transfer money before you are comfortable with the arrangement.</div></div></main><Footer /></>;
}
