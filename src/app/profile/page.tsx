import Link from 'next/link';
import { Header, Footer } from '@/components/site-chrome';

export default function ProfilePage() {
  return <><Header /><main className="profile-page shell"><div className="profile-card"><div className="profile-avatar">A</div><p className="eyebrow">Your profile</p><h1>Let people know who they&apos;ll be sharing space with.</h1><p>Complete the few details that make a first conversation easier. Your phone number stays private until you choose to connect.</p><div className="profile-progress"><span><i /></span><strong>40% complete</strong></div><Link className="button" href="/profile/complete">Continue profile →</Link></div></main><Footer /></>;
}
