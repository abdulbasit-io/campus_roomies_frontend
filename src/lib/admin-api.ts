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

export const adminApi = {
  dashboard: () => apiRequest<AdminDashboard>('/admin/dashboard'),
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
