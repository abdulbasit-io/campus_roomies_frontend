import Link from 'next/link';
import { Footer, Header } from '@/components/site-chrome';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="not-found-page shell">
        <p className="not-found-code" aria-hidden="true">404</p>
        <p className="eyebrow">Page not found</p>
        <h1>This page seems to have moved out.</h1>
        <p className="not-found-copy">
          The link may be out of date, or the page may no longer be available.
          Let&apos;s get you back to finding your place.
        </p>
        <div className="not-found-actions">
          <Link className="button" href="/">Back to home</Link>
          <Link className="button button-secondary" href="/browse">Browse rooms</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
