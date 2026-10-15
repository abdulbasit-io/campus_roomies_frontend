export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
  requestId?: string;
};

export class ApiRequestError extends Error {
  constructor(public readonly error: ApiError, public readonly status: number) {
    super(error.message);
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
