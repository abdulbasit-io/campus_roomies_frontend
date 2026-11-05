import Link from 'next/link';
import { Header, Footer } from '@/components/site-chrome';
import { ResumeListingDraft } from '@/components/resume-listing-draft';

export default async function NewListingPage({ searchParams }: { searchParams: Promise<{ intent?: string }> }) {
  const { intent } = await searchParams;
  if (intent === 'ROOM_NEEDED') return <RoomNeededEntry />;
  return (
    <>
      <Header />
      <main className="intent-entry shell">
        <h1>What are you looking for?</h1>
        <p className="intent-entry-lede">Everyone here is looking for a roommate. Choose the path that describes your situation today.</p>
        <ResumeListingDraft />
        <div className="intent-entry-grid">
          <Link className="intent-entry-card" href="/listings/new/room-available"><span className="intent-icon">⌂</span><h2>I have a room</h2><p>List the room and tell people what kind of roommate would fit your home.</p><strong>List a room →</strong></Link>
          <Link className="intent-entry-card intent-entry-card-orange" href="/listings/new/room-needed"><span className="intent-icon">＋</span><h2>Looking for a place?</h2><p>Share your budget, areas, and living preferences so people with rooms can find you.</p><strong>Create your profile →</strong></Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function RoomNeededEntry() {
  return (
    <>
      <Header />
      <main className="auth-page shell">
        <div className="auth-card"><p className="eyebrow">Looking for a place</p><h1>Tell people what kind of home you need.</h1><p className="auth-copy">You do not need to have a room yet. Share your preferences and let the right listers find you.</p><Link className="button full-width" href="/listings/new/room-needed">Create your profile →</Link><Link className="back-link" href="/listings/new">← Choose another path</Link></div>
      </main>
      <Footer />
    </>
  );
}
