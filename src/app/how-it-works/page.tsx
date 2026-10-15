import Link from 'next/link';
import { Header, Footer } from '@/components/site-chrome';

export default function HowItWorksPage() {
  return <><Header /><main className="info-page shell"><p className="eyebrow">How it works</p><h1>A better starting point for finding home around campus.</h1><p className="info-lede">No noisy group chats. No guessing what a room costs. Just useful information, followed by a conversation when you&apos;re ready.</p><div className="info-list">{[['01','Browse in public','Start with the rooms, areas, prices, and preferences that matter to you.'],['02','Complete your profile','Before contact, share enough context to make a respectful introduction.'],['03','Connect on WhatsApp','Campus Roomies hands you off to the lister. Ask questions and make arrangements directly.']].map(([n,t,c]) => <div key={n}><span>{n}</span><div><h2>{t}</h2><p>{c}</p></div></div>)}</div><Link className="button" href="/browse">Explore rooms →</Link></main><Footer /></>;
}
