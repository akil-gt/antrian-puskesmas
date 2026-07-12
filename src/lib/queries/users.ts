import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, mutate } from '@/lib/db';
import type { User } from '@/types';

export async function getUsers(): Promise<Omit<User, 'password'>[]> {
  return query<Omit<User, 'password'>>(
    'SELECT id, nama, nik, alamat, no_hp as noHp, tanggal_lahir as tanggalLahir, username, created_at as createdAt FROM users ORDER BY created_at DESC'
  );
}

export async function getUserById(id: string): Promise<User | null> {
  return queryOne<User>(
    'SELECT id, nama, nik, alamat, no_hp as noHp, tanggal_lahir as tanggalLahir, username, password, created_at as createdAt FROM users WHERE id = ?',
    [id]
  );
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return queryOne<User>(
    'SELECT id, nama, nik, alamat, no_hp as noHp, tanggal_lahir as tanggalLahir, username, password, created_at as createdAt FROM users WHERE username = ?',
    [username]
  );
}

export async function getUserByNIK(nik: string): Promise<User | null> {
  return queryOne<User>(
    'SELECT id, nama, nik, alamat, no_hp as noHp, tanggal_lahir as tanggalLahir, username, password, created_at as createdAt FROM users WHERE nik = ?',
    [nik]
  );
}

export async function createUser(data: { nama: string; nik: string; alamat: string; noHp: string; tanggalLahir: string; username: string; password: string }): Promise<User> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  await mutate(
    'INSERT INTO users (id, nama, nik, alamat, no_hp, tanggal_lahir, username, password, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.nama, data.nik, data.alamat, data.noHp, data.tanggalLahir, data.username, data.password, createdAt]
  );
  
  return { id, ...data, createdAt };
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await mutate('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function updatePassword(id: string, password: string): Promise<boolean> {
  const result = await mutate('UPDATE users SET password = ? WHERE id = ?', [password, id]);
  return result.affectedRows > 0;
}