import { getUserIdFromJwt } from '../../utils/jwt';

describe('getUserIdFromJwt', () => {
  it('should return null for empty token', () => {
    expect(getUserIdFromJwt('')).toBeNull();
    expect(getUserIdFromJwt(null)).toBeNull();
  });

  it('should return null for invalid token format', () => {
    expect(getUserIdFromJwt('invalid-token')).toBeNull();
  });

  it('should decode user id from a valid jwt payload', () => {
    // mock payload: { "sub": "123" }
    // header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    // payload: eyJzdWIiOiIxMjMifQ
    // signature: redundant
    const validToken = 'header.eyJzdWIiOiIxMjMifQ.signature';
    expect(getUserIdFromJwt(validToken)).toBe(123);
  });

  it('should handle Bearer prefix', () => {
    const validToken = 'Bearer header.eyJzdWIiOiIxMjMifQ.signature';
    expect(getUserIdFromJwt(validToken)).toBe(123);
  });

  it('should return null if sub is missing', () => {
    const tokenNoSub = 'header.e30.signature'; // eye30 = {}
    expect(getUserIdFromJwt(tokenNoSub)).toBeNull();
  });
});

