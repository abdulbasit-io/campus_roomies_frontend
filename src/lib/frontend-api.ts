import { apiMutation, apiRequest } from './api';
import type { Listing, ListingIntent } from './domain';
import type { SessionProfile } from './session';

export type Institution = {
  id: string;
  name: string;
  abbreviation: string;
};

export type InstitutionArea = {
  id: string;
  name: string;
};

export type ListingPreferences = {
  roommateGender?: string | null;
  academicLevel?: string | null;
  studyAtmosphere?: string | null;
  smokingRule?: string | null;
  utilityPreference?: string | null;
  lifestyleTraits?: string[];
};

export type ApiListing = {
  id: string;
  intent: ListingIntent;
  institutionId: string;
  institution: string;
  abbreviation: string;
  areaId: string;
  area: string;
  landmark: string | null;
  title: string;
  accommodationType: string;
  priceAmount: number | null;
  pricePeriod: 'YEAR' | 'SESSION' | null;
  availabilityType: 'AVAILABLE_NOW' | 'NEXT_SESSION' | 'SPECIFIC_DATE';
  availabilityDate: string | null;
  availabilityNote: string | null;
  description: string;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  images: Array<{ id: string; url: string; position: number }>;
  preferences: ListingPreferences;
  targetBudgetAmount?: number;
  targetBudgetPeriod?: 'YEAR' | 'SESSION';
  targetAreaId?: string;
  targetArea?: string | null;
  about?: string;
  ownerDisplayName?: string;
  ownerInitials?: string;
};

export type PaginatedListings = {
  items: ApiListing[];
  page: number;
  pageSize: number;
  total: number;
};

export type Profile = {
  userId: string;
  email: string;
  gender: 'MALE' | 'FEMALE';
  firstName: string;
  lastName: string;
  whatsappNumber: string | null;
  phoneConfirmed: boolean;
  institutionId: string | null;
  institutionName?: string | null;
  department: string | null;
  academicLevel: string | null;
  about: string | null;
  photoUrl: string | null;
  profileComplete: boolean;
};

export type ListingDraftInput = {
  intent: ListingIntent;
  institutionId?: string;
  areaId?: string;
  landmark?: string;
  title?: string;
  accommodationType?: string;
  priceAmount?: number;
  pricePeriod?: 'YEAR' | 'SESSION';
  availabilityType?: 'AVAILABLE_NOW' | 'NEXT_SESSION' | 'SPECIFIC_DATE';
  availabilityDate?: string | null;
  availabilityNote?: string;
  description?: string;
  targetBudgetAmount?: number;
  targetBudgetPeriod?: 'YEAR' | 'SESSION';
  targetAreaId?: string;
  about?: string;
  preferences?: {
    roommateGender?: 'MALE' | 'FEMALE';
    academicLevel?: string;
    studyAtmosphere?: string;
    smokingRule?: string;
    utilityPreference?: string;
    lifestyleTraits?: string[];
  };
};

export type DraftImage = {
  id: string;
  url: string;
  providerAssetId: string;
  position: number;
};

export type OwnedDraft = {
  id: string;
  intent: ListingIntent;
  status: string;
  institution_id: string | null;
  area_id: string | null;
  target_area_id: string | null;
  title: string | null;
  landmark: string | null;
  accommodation_type: string | null;
  price_amount: number | null;
  price_period: 'YEAR' | 'SESSION' | null;
  availability_type: 'AVAILABLE_NOW' | 'NEXT_SESSION' | 'SPECIFIC_DATE' | null;
  availability_date: string | null;
  description: string | null;
  target_budget_amount: number | null;
  target_budget_period: 'YEAR' | 'SESSION' | null;
  about: string | null;
  preferences?: Record<string, unknown> | null;
  images?: DraftImage[];
};

export type ImageBatchResult = {
  uploaded: DraftImage[];
  failures: Array<{ index: number; message: string }>;
};

type UploadAuthorization = {
  provider: 'CLOUDINARY';
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string[];
  maxFileSizeBytes: number;
};

const fallbackImage = '';

function readable(value: string | null | undefined): string {
  if (!value) return '';
  return value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export function toCardListing(listing: ApiListing): Listing {
  const preferences = listing.preferences ?? {};
  const features = [
    preferences.studyAtmosphere,
    preferences.smokingRule,
    preferences.utilityPreference,
    ...(preferences.lifestyleTraits ?? []),
  ].filter((feature): feature is string => Boolean(feature));
  return {
    id: listing.id,
    title: listing.title,
    area: listing.area,
    institution: listing.abbreviation || listing.institution,
    price: listing.priceAmount ?? listing.targetBudgetAmount ?? 0,
    period: (listing.pricePeriod ?? listing.targetBudgetPeriod) === 'YEAR' ? 'year' : 'session',
    roomType: readable(listing.accommodationType),
    availability: readable(listing.availabilityType),
    description: listing.description,
    image: listing.images?.[0]?.url ?? fallbackImage,
    distance: listing.landmark ?? '',
    features,
    owner: listing.ownerDisplayName ?? 'Campus Roomies member',
    ownerInitials: listing.ownerInitials ?? 'CR',
  };
}

export function listInstitutions(): Promise<Institution[]> {
  return apiRequest('/institutions');
}

export function listAreas(institutionId: string): Promise<InstitutionArea[]> {
  return apiRequest(`/institutions/${institutionId}/areas`);
}

export function searchListings(input: {
  institutionId?: string;
  areaId?: string;
  intent?: ListingIntent;
  accommodationType?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
} = {}): Promise<PaginatedListings> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  return apiRequest(`/discover/listings${params.size ? `?${params.toString()}` : ''}`);
}

export function getPublicListing(id: string): Promise<ApiListing> {
  return apiRequest(`/listings/${id}`);
}

export function getOwnedListing(id: string): Promise<ApiListing> {
  return apiRequest(`/me/listings/owned/${id}`);
}

export function getMyProfile(): Promise<Profile> {
  return apiRequest('/me/profile');
}

export function updateMyProfile(input: {
  whatsappNumber?: string;
  confirmWhatsapp?: boolean;
  institutionId?: string;
  department?: string;
  academicLevel?: string;
  about?: string;
}): Promise<Profile> {
  return apiMutation('/me/profile', 'PATCH', input);
}

export function login(email: string, password: string): Promise<SessionProfile> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: 'MALE' | 'FEMALE';
}): Promise<SessionProfile> {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function logout(): Promise<{ signedOut: boolean }> {
  return apiMutation('/auth/logout', 'POST');
}

export function getDraft(): Promise<OwnedDraft | null> {
  return apiRequest('/me/listings/draft');
}

export function listMyListings(): Promise<OwnedDraft[]> {
  return apiRequest('/me/listings');
}

export function createDraft(input: ListingDraftInput): Promise<OwnedDraft> {
  return apiMutation('/me/listings', 'POST', input);
}

export function updateDraft(id: string, input: Partial<ListingDraftInput>): Promise<OwnedDraft> {
  return apiMutation(`/me/listings/${id}`, 'PATCH', input);
}

export function publishDraft(id: string): Promise<OwnedDraft> {
  return apiMutation(`/me/listings/${id}/publish`, 'POST');
}

export function markListingFound(id: string): Promise<{ id: string; status: string }> {
  return apiMutation(`/me/listings/${id}/found`, 'POST');
}

export async function uploadDraftImages(
  listingId: string,
  files: File[],
  firstPosition: number,
): Promise<ImageBatchResult> {
  const authorization = await apiMutation<UploadAuthorization>('/media/upload-authorizations', 'POST');
  const results = await Promise.allSettled(files.map(async (file, index) => {
    if (file.size > authorization.maxFileSizeBytes) {
      throw new Error(`${file.name}: image must be no larger than ${Math.floor(authorization.maxFileSizeBytes / (1024 * 1024))} MB.`);
    }
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!authorization.allowedFormats.includes(extension)) {
      throw new Error(`${file.name}: choose a JPG, PNG, or WebP image.`);
    }
    const form = new FormData();
    form.set('file', file);
    form.set('api_key', authorization.apiKey);
    form.set('timestamp', String(authorization.timestamp));
    form.set('signature', authorization.signature);
    form.set('folder', authorization.folder);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(authorization.cloudName)}/image/upload`,
      { method: 'POST', body: form },
    );
    const result = await response.json() as { public_id?: string; error?: { message?: string } };
    if (!response.ok || !result.public_id) {
      throw new Error(`${file.name}: ${result.error?.message ?? 'The image upload failed.'}`);
    }
    return apiMutation<DraftImage>(`/media/listings/${listingId}/images`, 'POST', {
      providerAssetId: result.public_id,
      position: firstPosition + index,
    });
  }));
  return {
    uploaded: results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []),
    failures: results.flatMap((result, index) => result.status === 'rejected'
      ? [{
        index,
        message: result.reason instanceof Error ? result.reason.message : 'An image could not be uploaded.',
      }]
      : []),
  };
}

export function removeDraftImage(listingId: string, imageId: string): Promise<{ id: string }> {
  return apiMutation(`/media/listings/${listingId}/images/${imageId}`, 'DELETE');
}

export function createInterest(id: string): Promise<{ id: string; listingId: string }> {
  return apiMutation(`/listings/${id}/interests`, 'POST');
}

export function withdrawInterest(id: string): Promise<{ id: string; listingId: string }> {
  return apiMutation(`/listings/${id}/interests`, 'DELETE');
}

export function requestContact(id: string): Promise<{ handoffType: string; handoffUrl: string }> {
  return apiMutation(`/listings/${id}/contact`, 'POST');
}

export function submitReport(
  id: string,
  input: { reason: string; details?: string },
): Promise<{ id: string; listingId: string }> {
  return apiMutation(`/listings/${id}/reports`, 'POST', input);
}
