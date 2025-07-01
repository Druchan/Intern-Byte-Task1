import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret';

export function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { 
    expiresIn: '15m',
    issuer: 'secure-auth-app',
    audience: 'secure-auth-client'
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { 
    expiresIn: '7d',
    issuer: 'secure-auth-app',
    audience: 'secure-auth-client'
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'secure-auth-app',
      audience: 'secure-auth-client'
    });
  } catch (error) {
    throw new Error('Invalid access token');
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'secure-auth-app',
      audience: 'secure-auth-client'
    });
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}