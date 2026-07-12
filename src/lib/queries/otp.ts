import { v4 as uuidv4 } from 'uuid';
import { queryOne, mutate } from '@/lib/db';

export async function saveOtp(phone: string, code: string): Promise<void> {
  const id = uuidv4();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  await mutate(
    'INSERT INTO otp_codes (id, phone, code, expires_at) VALUES (?, ?, ?, ?)',
    [id, phone, code, expiresAt]
  );
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await queryOne<{ id: string }>(
    `SELECT id FROM otp_codes
     WHERE phone = ? AND code = ? AND used = 0 AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [phone, code]
  );
  if (!otp) return false;
  await mutate('UPDATE otp_codes SET used = 1 WHERE id = ?', [otp.id]);
  return true;
}

export async function expireOldOtps(phone: string): Promise<void> {
  await mutate('UPDATE otp_codes SET used = 1 WHERE phone = ? AND used = 0', [phone]);
}
