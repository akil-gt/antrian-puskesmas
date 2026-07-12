import jwt from 'jsonwebtoken';

const SECRET: string = process.env.JWT_SECRET!;
if (!SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface TokenPayload {
  id: string;
  username: string;
  nama: string;
  role: string;
}

export function verifyToken(req: Request): TokenPayload {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new AuthError('Token tidak ditemukan', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    throw new AuthError('Token tidak valid', 401);
  }
}

export function verifyAdmin(req: Request): TokenPayload {
  const payload = verifyToken(req);
  if (payload.role !== 'admin') {
    throw new AuthError('Access denied', 403);
  }
  return payload;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export { SECRET };
