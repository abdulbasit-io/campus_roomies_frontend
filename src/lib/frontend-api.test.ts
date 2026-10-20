import { describe, expect, it } from 'vitest';
import { toCardListing, type ApiListing } from './frontend-api';

const listing: ApiListing = {
  id: 'listing-1',
  intent: 'ROOM_NEEDED',
  institutionId: 'institution-1',
  institution: 'Federal University of Agriculture, Abeokuta',
  abbreviation: 'FUNAAB',
  areaId: 'area-1',
  area: 'Camp',
  landmark: null,
  title: 'Looking for a quiet room',
  accommodationType: 'SINGLE_ROOM_SHARED_FLAT',
  priceAmount: null,
  pricePeriod: null,
  availabilityType: 'NEXT_SESSION',
  availabilityDate: null,
  availabilityNote: null,
  description: 'A quiet, considerate student looking for a room.',
  status: 'ACTIVE',
  publishedAt: null,
  updatedAt: '2026-01-01T00:00:00.000Z',
  images: [],
  preferences: {
    studyAtmosphere: 'Quiet study hours',
    lifestyleTraits: ['Early riser'],
  },
  targetBudgetAmount: 250000,
  targetBudgetPeriod: 'YEAR',
  targetAreaId: 'area-1',
  targetArea: 'Camp',
  about: 'A considerate student.',
  ownerDisplayName: 'Aisha M.',
  ownerInitials: 'AM',
};

describe('toCardListing', () => {
  it('uses room-needed budget and only real listing details', () => {
    expect(toCardListing(listing)).toMatchObject({
      id: 'listing-1',
      price: 250000,
      period: 'year',
      image: '',
      distance: '',
      owner: 'Aisha M.',
      ownerInitials: 'AM',
      features: ['Quiet study hours', 'Early riser'],
    });
  });

  it('does not invent preference features when they are missing', () => {
    expect(toCardListing({ ...listing, preferences: {} }).features).toEqual([]);
  });

  it('uses a seeker profile photo and labels room-needed availability as a search', () => {
    expect(toCardListing({
      ...listing,
      availabilityType: 'AVAILABLE_NOW',
      ownerPhotoUrl: 'https://images.example/student.jpg',
    })).toMatchObject({
      image: 'https://images.example/student.jpg',
      availability: 'Looking now',
    });
  });

  it('uses the custom accommodation description for Other room types', () => {
    expect(toCardListing({
      ...listing,
      accommodationType: 'OTHER',
      accommodationTypeOther: 'Studio apartment',
    }).roomType).toBe('Studio apartment');
  });
});
