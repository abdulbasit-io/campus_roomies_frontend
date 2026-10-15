export const listingIntents = ['ROOM_AVAILABLE', 'ROOM_NEEDED'] as const;
export type ListingIntent = (typeof listingIntents)[number];

export const listingStatuses = ['DRAFT', 'ACTIVE', 'FOUND', 'RESTRICTED'] as const;
export type ListingStatus = (typeof listingStatuses)[number];
