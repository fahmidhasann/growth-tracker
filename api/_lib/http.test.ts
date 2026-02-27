import { describe, it, expect } from 'vitest';
import { isValidDate, parseJsonBody, sendMethodNotAllowed, sendServerError } from './http';

describe('isValidDate', () => {
  it('accepts valid ISO 8601 datetime strings', () => {
    expect(isValidDate('2024-01-15T10:30:00Z')).toBe(true);
    expect(isValidDate('2024-01-15T00:00:00.000Z')).toBe(true);
  });

  it('accepts date-only strings', () => {
    expect(isValidDate('2024-01-15')).toBe(true);
    expect(isValidDate('2000-12-31')).toBe(true);
  });

  it('rejects empty strings', () => {
    expect(isValidDate('')).toBe(false);
  });

  it('rejects non-date strings', () => {
    expect(isValidDate('not-a-date')).toBe(false);
    expect(isValidDate('hello world')).toBe(false);
  });

  it('rejects numeric strings that are not dates', () => {
    // "foo123" is NaN; a pure number string like "12345" may parse as a year
    expect(isValidDate('foo123')).toBe(false);
  });
});

describe('parseJsonBody', () => {
  it('returns the body as-is when it is already an object', () => {
    const req = { body: { email: 'test@test.com' } } as any;
    expect(parseJsonBody(req)).toEqual({ email: 'test@test.com' });
  });

  it('parses the body when it is a JSON string', () => {
    const req = { body: '{"email":"test@test.com"}' } as any;
    expect(parseJsonBody(req)).toEqual({ email: 'test@test.com' });
  });

  it('returns an empty object when body is absent', () => {
    const req = {} as any;
    expect(parseJsonBody(req)).toEqual({});
  });

  it('returns an empty object when body is null', () => {
    const req = { body: null } as any;
    expect(parseJsonBody(req)).toEqual({});
  });
});

describe('sendMethodNotAllowed', () => {
  it('sets Allow header and returns 405', () => {
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (k: string, v: string) => { headers[k] = v; },
      status: (code: number) => ({ json: (body: unknown) => ({ code, body }) }),
    } as any;
    const result = sendMethodNotAllowed(res, ['GET', 'POST']) as any;
    expect(headers['Allow']).toBe('GET, POST');
    expect(result.code).toBe(405);
    expect(result.body).toEqual({ error: 'Method not allowed' });
  });
});

describe('sendServerError', () => {
  it('returns 500 with the error message', () => {
    const res = {
      status: (code: number) => ({ json: (body: unknown) => ({ code, body }) }),
    } as any;
    const result = sendServerError(res, new Error('something went wrong')) as any;
    expect(result.code).toBe(500);
    expect(result.body).toEqual({ error: 'something went wrong' });
  });

  it('returns a generic message for non-Error values', () => {
    const res = {
      status: (code: number) => ({ json: (body: unknown) => ({ code, body }) }),
    } as any;
    const result = sendServerError(res, 'oops') as any;
    expect(result.code).toBe(500);
    expect(result.body).toEqual({ error: 'Unexpected server error' });
  });
});
