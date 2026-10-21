export const listingIntents = ['ROOM_AVAILABLE', 'ROOM_NEEDED'] as const;
export type ListingIntent = (typeof listingIntents)[number];

export const listingStatuses = ['DRAFT', 'ACTIVE', 'FOUND', 'RESTRICTED'] as const;
export type ListingStatus = (typeof listingStatuses)[number];

export type Listing = {
  id: string;
  title: string;
  area: string;
  institution: string;
  price: number;
  period: 'year' | 'session';
  roomType: string;
  availability: string;
  description: string;
  image: string;
  distance?: string;
  features: string[];
  owner: string;
  ownerInitials: string;
  ownerUserId?: string;
  ownerPhotoUrl?: string | null;
};

export const sampleListings: Listing[] = [
  {
    id: 'camp-ensuite',
    title: 'Spacious Ensuite Room off Camp Junction',
    area: 'Camp',
    institution: 'FUNAAB',
    price: 220000,
    period: 'year',
    roomType: 'Single room',
    availability: 'Available now',
    description: 'A bright, private room with a calm study corner, close enough to walk home after a long day on campus.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85',
    distance: '5 mins walk',
    features: ['Shared flat', 'Quiet', 'Generator backup'],
    owner: 'Aisha M.',
    ownerInitials: 'AM',
  },
  {
    id: 'camp-single',
    title: 'Well-ventilated Single Room at Camp',
    area: 'Camp',
    institution: 'FUNAAB',
    price: 280000,
    period: 'year',
    roomType: 'Single room',
    availability: 'Next session',
    description: 'Good natural light, a practical kitchen, and a little breathing room for work, rest, and everyday life.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=85',
    distance: '6 mins walk',
    features: ['Borehole', 'Security', 'Move-in ready'],
    owner: 'Tunde O.',
    ownerInitials: 'TO',
  },
  {
    id: 'harmony-self-contain',
    title: 'New Self Contain in Harmony Phase 2',
    area: 'Harmony',
    institution: 'FUNAAB',
    price: 350000,
    period: 'year',
    roomType: 'Self-contained',
    availability: 'Available now',
    description: 'A self-contained space with private facilities and a quieter rhythm, designed for focused campus living.',
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1000&q=85',
    distance: '10 mins to gate',
    features: ['Gated', 'Fitted', 'Private'],
    owner: 'Zainab B.',
    ownerInitials: 'ZB',
  },
  {
    id: 'oluwo-flat',
    title: 'Warm shared flat close to Oluwo',
    area: 'Oluwo',
    institution: 'FUNAAB',
    price: 180000,
    period: 'session',
    roomType: 'Shared room',
    availability: 'Next session',
    description: 'A friendly shared home for someone who enjoys company, clear boundaries, and splitting household routines fairly.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=85',
    distance: '12 mins to gate',
    features: ['Shared utilities', 'Social', 'Secure'],
    owner: 'Chidi E.',
    ownerInitials: 'CE',
  },
];

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
