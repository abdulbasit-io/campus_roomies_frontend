import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { SessionProvider } from '@/lib/session';
import { AnalyticsTracker } from '@/components/analytics-tracker';

const vercelAnalyticsEnabled = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED === 'true';

export const metadata: Metadata = {
  title: 'Campus Roomies',
  description: 'Housing around your campus, made easier.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SessionProvider>
          <AnalyticsTracker />
          {children}
        </SessionProvider>
        {vercelAnalyticsEnabled && <Analytics />}
      </body>
    </html>
  );
}
