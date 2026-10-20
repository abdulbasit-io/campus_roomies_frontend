import { describe, expect, it } from 'vitest';
import { authLink, getLocalRedirectTarget } from './redirect';

describe('authentication return paths', () => {
  it('preserves a same-origin destination including its query string', () => {
    expect(getLocalRedirectTarget(
      '/listings/room-1/contact?from=detail',
      '/browse',
      'https://campusroomies.example',
    )).toBe('/listings/room-1/contact?from=detail');
  });

  it('uses the browse page for external or missing destinations', () => {
    expect(getLocalRedirectTarget(
      'https://attacker.example',
      '/browse',
      'https://campusroomies.example',
    )).toBe('/browse');
    expect(getLocalRedirectTarget(null)).toBe('/browse');
  });

  it('preserves the destination across login and registration links', () => {
    expect(authLink('/register', '/listings/new/room-needed'))
      .toBe('/register?next=%2Flistings%2Fnew%2Froom-needed');
  });
});
