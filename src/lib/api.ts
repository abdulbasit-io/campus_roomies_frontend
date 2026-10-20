export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
  requestId?: string;
};

export type ApiEnvelope<T> = { data: T };

export class ApiRequestError extends Error {
  constructor(public readonly error: ApiError, public readonly status: number) {
    const fieldErrors = Object.entries(error.fields ?? {}).map(([field, message]) => {
      const readableField = field
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replaceAll('_', ' ')
        .toLowerCase();
      return `${readableField}: ${message}`;
    });
    super(fieldErrors.length ? `${error.message} ${fieldErrors.join(' ')}` : error.message);
    this.name = 'ApiRequestError';
  }
}

const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN;

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiOrigin) {
    throw new ApiRequestError({ code: 'API_NOT_CONFIGURED', message: 'The Campus Roomies API is not configured yet.' }, 0);
  }
  const response = await fetch(`${apiOrigin}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await response.json().catch(() => null) as { data?: T; error?: ApiError } | null;
  if (!response.ok) {
    throw new ApiRequestError(body?.error ?? { code: 'REQUEST_FAILED', message: 'Something went wrong. Please try again.' }, response.status);
  }
  return (body?.data ?? body) as T;
}

export async function apiMutation<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const csrf = await apiRequest<{ token: string }>('/auth/csrf');
  return apiRequest<T>(path, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    headers: { 'x-csrf-token': csrf.token },
  });
}

export function getApiOrigin(): string | undefined {
  return apiOrigin;
}
