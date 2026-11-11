import Link from 'next/link';
import { Header, Footer } from '@/components/site-chrome';
import { Reveal } from '@/components/reveal';

export default function HowItWorksPage() {
  return <><Header /><main className="info-page shell"><Reveal><p className="eyebrow">How it works</p><h1>A better starting point for finding home around campus.</h1></Reveal><Reveal delay={90}><p className="info-lede">No noisy group chats. No guessing what a room costs. Just useful information, followed by a conversation when you&apos;re ready.</p></Reveal><div className="info-list">{[['01','Browse in public','Start with the rooms, areas, prices, and preferences that matter to you.'],['02','Complete your profile','Before contact, share enough context to make a respectful introduction.'],['03','Connect on WhatsApp','Campus Roomies hands you off to the lister. Ask questions and make arrangements directly.']].map(([n,t,c], index) => <Reveal as="article" delay={index * 80} key={n}><span>{n}</span><div><h2>{t}</h2><p>{c}</p></div></Reveal>)}</div><Reveal delay={260}><Link className="button" href="/browse">Explore roommates →</Link></Reveal></main><Footer /></>;
}
