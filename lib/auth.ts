import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'flashstock_super_secret_key_123_abc';

export interface ISessionUser {
  id: string;
  email: string;
  role: 'superadmin' | 'merchant';
}

export function signToken(user: ISessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): ISessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as ISessionUser;
  } catch {
    return null;
  }
}

export function getSession(req: NextRequest): ISessionUser | null {
  // Try reading from authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // Try reading from cookies
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/fs_token=([^;]+)/);
  if (match) {
    return verifyToken(match[1]);
  }

  return null;
}
