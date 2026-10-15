import { SavedRooms } from '@/components/saved-rooms';
import { Footer, Header } from '@/components/site-chrome';

export default function SavedRoomsPage() { return <><Header /><main className="account-page shell"><div className="account-page-heading"><div><p className="eyebrow">Your account</p><h1>Saved rooms</h1><p>Keep the spaces worth coming back to in one place.</p></div></div><SavedRooms /></main><Footer /></>; }
