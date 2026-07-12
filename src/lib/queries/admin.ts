import bcrypt from 'bcryptjs';
import { queryOne, mutate } from '@/lib/db';
import type { AdminData } from '@/types';

export async function getAdmin(): Promise<AdminData> {
  const row = await queryOne<{ username: string; password: string }>(
    'SELECT username, password FROM admin LIMIT 1'
  );

  if (!row) {
    const hashed = await bcrypt.hash('admin123', 10);
    await mutate('INSERT INTO admin (username, password) VALUES (?, ?)', ['admin', hashed]);
    return { username: 'admin', password: hashed };
  }

  if (!row.password.startsWith('$2a$') && !row.password.startsWith('$2b$')) {
    const hashed = await bcrypt.hash(row.password, 10);
    await mutate('UPDATE admin SET password = ? WHERE username = ?', [hashed, row.username]);
    return { username: row.username, password: hashed };
  }

  return row;
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const admin = await getAdmin();
  if (admin.username !== username) return false;
  return bcrypt.compare(password, admin.password);
}