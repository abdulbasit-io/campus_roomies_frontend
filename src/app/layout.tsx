import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { SessionProvider } from '@/lib/session';
import { AnalyticsTracker } from '@/components/analytics-tracker';

export const metadata: Metadata = {
  title: 'Campus Roomies',
  description: 'Housing around your campus, made easier.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AnalyticsTracker />
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
