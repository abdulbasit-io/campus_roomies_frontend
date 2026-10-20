export function getLocalRedirectTarget(
  value: string | null,
  fallback = '/browse',
  origin = 'http://localhost',
): string {
  if (!value) return fallback;
  try {
    const target = new URL(value, origin);
    if (target.origin !== new URL(origin).origin) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

export function authLink(path: string, next: string | null): string {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}
