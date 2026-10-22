import { apiMutation, apiRequest } from './api';

export type CatalogInstitution = {
  id: string;
  name: string;
  abbreviation: string;
  archivedAt: string | null;
  areaCount?: number;
};

export type CatalogArea = {
  id: string;
  institutionId: string;
  name: string;
  archivedAt: string | null;
};

export type AdminAuditAction = {
  id: string;
  entityType: 'INSTITUTION' | 'AREA';
  action: string;
  institutionId: string | null;
  areaId: string | null;
  institutionName: string | null;
  areaName: string | null;
  adminFirstName: string;
  adminLastName: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type AdminDashboard = {
  institutions: number;
  active_institutions: number;
  archived_institutions: number;
  areas: number;
  active_areas: number;
  archived_areas: number;
  recentActions: AdminAuditAction[];
};

export type ModerationReport = {
  id: string;
  listingId: string;
  reporterId: string;
  reason: 'SUSPICIOUS_LISTING' | 'MISLEADING_INFORMATION' | 'INAPPROPRIATE_CONTENT' | 'SAFETY_CONCERN' | 'OTHER';
  details: string | null;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  intent: 'ROOM_AVAILABLE' | 'ROOM_NEEDED';
  title: string;
  listingStatus: 'DRAFT' | 'ACTIVE' | 'FOUND' | 'RESTRICTED';
};

export type ModerationAuditAction = {
  id: string;
  listingId: string | null;
  reportId: string | null;
  action: 'RESTRICT' | 'RESTORE' | 'RESOLVE_REPORT' | 'MARK_FOUND';
  reason: string | null;
  createdAt: string;
  listingTitle: string | null;
  adminFirstName: string;
  adminLastName: string;
};

export type QueuedAdminEmail = {
  jobId: string;
  status: 'QUEUED';
};

export type ModeratedListingResult = {
  listingId: string;
  status: 'ACTIVE' | 'RESTRICTED' | 'FOUND';
};

export const adminApi = {
  dashboard: () => apiRequest<AdminDashboard>('/admin/dashboard'),
  reports: (page: number, pageSize = 20) => apiRequest<PaginatedResult<ModerationReport>>(
    `/moderation/reports?page=${page}&pageSize=${pageSize}`,
  ),
  moderationAudit: (page: number, pageSize = 20) => apiRequest<PaginatedResult<ModerationAuditAction>>(
    `/moderation/audit?page=${page}&pageSize=${pageSize}`,
  ),
  report: (reportId: string) => apiRequest<ModerationReport>(`/moderation/reports/${reportId}`),
  restrictListing: (listingId: string, reason: string) => apiMutation<ModeratedListingResult>(
    `/moderation/listings/${listingId}/restrict`,
    'POST',
    { reason },
  ),
  restoreListing: (listingId: string, reason: string) => apiMutation<ModeratedListingResult>(
    `/moderation/listings/${listingId}/restore`,
    'POST',
    { reason },
  ),
  markListingFound: (listingId: string, reason: string) => apiMutation<ModeratedListingResult>(
    `/moderation/listings/${listingId}/found`,
    'POST',
    { reason },
  ),
  resolveReport: (reportId: string, reason: string) => apiMutation<{ reportId: string; status: 'RESOLVED' }>(
    `/moderation/reports/${reportId}/resolve`,
    'POST',
    { reason },
  ),
  queueEmail: (input: { recipient: string; subject: string; text: string }) => apiMutation<QueuedAdminEmail>(
    '/moderation/emails',
    'POST',
    input,
  ),
  listInstitutions: (includeArchived = false) => apiRequest<CatalogInstitution[]>(
    `/admin/institutions?includeArchived=${includeArchived}`,
  ),
  createInstitution: (input: { name: string; abbreviation: string }) => apiMutation<CatalogInstitution>(
    '/admin/institutions',
    'POST',
    input,
  ),
  updateInstitution: (id: string, input: { name: string; abbreviation: string }) => apiMutation<CatalogInstitution>(
    `/admin/institutions/${id}`,
    'PATCH',
    input,
  ),
  archiveInstitution: (id: string) => apiMutation<CatalogInstitution>(
    `/admin/institutions/${id}/archive`,
    'POST',
  ),
  restoreInstitution: (id: string) => apiMutation<CatalogInstitution>(
    `/admin/institutions/${id}/restore`,
    'POST',
  ),
  listAreas: (institutionId: string, includeArchived = true) => apiRequest<CatalogArea[]>(
    `/admin/institutions/${institutionId}/areas?includeArchived=${includeArchived}`,
  ),
  createArea: (institutionId: string, name: string) => apiMutation<CatalogArea>(
    `/admin/institutions/${institutionId}/areas`,
    'POST',
    { name },
  ),
  updateArea: (institutionId: string, areaId: string, name: string) => apiMutation<CatalogArea>(
    `/admin/institutions/${institutionId}/areas/${areaId}`,
    'PATCH',
    { name },
  ),
  archiveArea: (institutionId: string, areaId: string) => apiMutation<CatalogArea>(
    `/admin/institutions/${institutionId}/areas/${areaId}/archive`,
    'POST',
  ),
  restoreArea: (institutionId: string, areaId: string) => apiMutation<CatalogArea>(
    `/admin/institutions/${institutionId}/areas/${areaId}/restore`,
    'POST',
  ),
  audit: (page: number, entityType?: 'INSTITUTION' | 'AREA') => {
    const query = new URLSearchParams({ page: String(page), pageSize: '20' });
    if (entityType) query.set('entityType', entityType);
    return apiRequest<PaginatedResult<AdminAuditAction>>(`/admin/audit?${query.toString()}`);
  },
};
