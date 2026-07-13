import bcrypt from 'bcryptjs';
import { queryOne, mutate } from '@/lib/db';
import type { AdminData } from '@/types';

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

export async function getAdmin(): Promise<AdminData> {
  try {
    const row = await queryOne<{ username: string; password: string }>(
      'SELECT username, password FROM admin LIMIT 1'
    );

    if (!row) {
      console.log('[Admin] No admin found, creating default admin');
      const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      await mutate('INSERT INTO admin (username, password) VALUES (?, ?)', [DEFAULT_ADMIN_USERNAME, hashed]);
      return { username: DEFAULT_ADMIN_USERNAME, password: hashed };
    }

    // Handle null/empty password
    if (!row.password || typeof row.password !== 'string') {
      console.warn('[Admin] Admin password is null/empty, resetting to default');
      const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      await mutate('UPDATE admin SET password = ? WHERE username = ?', [hashed, row.username]);
      return { username: row.username, password: hashed };
    }

    // Upgrade legacy non-bcrypt password
    if (!row.password.startsWith('$2a$') && !row.password.startsWith('$2b$')) {
      console.log('[Admin] Upgrading legacy password to bcrypt');
      const hashed = await bcrypt.hash(row.password, 10);
      await mutate('UPDATE admin SET password = ? WHERE username = ?', [hashed, row.username]);
      return { username: row.username, password: hashed };
    }

    return row;
  } catch (error) {
    console.error('[Admin] getAdmin error:', error);
    // Fallback: return default admin without DB (allows login even if DB fails)
    const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    return { username: DEFAULT_ADMIN_USERNAME, password: hashed };
  }
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  try {
    const admin = await getAdmin();
    if (admin.username !== username) {
      console.warn('[Admin] Username mismatch:', { input: username, stored: admin.username });
      return false;
    }
    if (!admin.password) {
      console.error('[Admin] Stored password is empty');
      return false;
    }
    const result = await bcrypt.compare(password, admin.password);
    if (!result) {
      console.warn('[Admin] Password verification failed for user:', username);
    }
    return result;
  } catch (error) {
    console.error('[Admin] verifyAdmin error:', error);
    return false;
  }
}

// Optional: emergency reset admin password (call with env secret)
export async function resetAdminPassword(newPassword: string): Promise<boolean> {
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await mutate('UPDATE admin SET password = ? WHERE username = ?', [hashed, DEFAULT_ADMIN_USERNAME]);
    console.log('[Admin] Admin password reset successfully');
    return true;
  } catch (error) {
    console.error('[Admin] resetAdminPassword error:', error);
    return false;
  }
}