import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: 'volunteer' | 'organization' | 'admin';
    email: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication token required' },
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'volunova_jwt_fallback_secret_key_2026';
    const decoded = jwt.verify(token, secret) as any;

    req.user = {
      userId: decoded.sub || decoded.userId,
      role: decoded.role || 'volunteer',
      email: decoded.email || '',
    };
    next();
  } catch (err: any) {
    return res.status(403).json({
      ok: false,
      error: { code: 'FORBIDDEN', message: 'Invalid or expired token' },
    });
  }
}

export function optionalToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'volunova_jwt_fallback_secret_key_2026';
      const decoded = jwt.verify(token, secret) as any;
      req.user = {
        userId: decoded.sub || decoded.userId,
        role: decoded.role || 'volunteer',
        email: decoded.email || '',
      };
    } catch {
      // Ignored for optional token
    }
  }
  next();
}

export function requireRole(allowedRoles: ('volunteer' | 'organization' | 'admin')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions' },
      });
    }
    next();
  };
}
