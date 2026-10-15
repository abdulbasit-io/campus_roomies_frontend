import { Header, Footer } from '@/components/site-chrome';

export default function PrivacyPage() {
  return <><Header /><main className="info-page shell"><p className="eyebrow">Privacy</p><h1>Your details should work for you, not against you.</h1><p className="info-lede">We only ask for information that helps students discover rooms, understand fit, and connect with care. Public profiles use your first name and last-name initial.</p><div className="info-list"><div><span>01</span><div><h2>Public by choice</h2><p>Your phone number and private contact details are never shown on a listing page.</p></div></div><div><span>02</span><div><h2>Clear handoff</h2><p>Contact begins after sign-in, profile completion, and phone confirmation, then continues on WhatsApp.</p></div></div></div></main><Footer /></>;
}
