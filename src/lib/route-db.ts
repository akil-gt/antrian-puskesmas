import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { QueueData, User, AdminData } from '@/types';

const SEED_DIR = path.join(process.cwd(), 'data');

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : SEED_DIR;

const ARCHIVES_DIR = path.join(DATA_DIR, 'archives');

const globalForData = globalThis as typeof globalThis & {
  __queues?: QueueData;
  __users?: User[];
  __admin?: AdminData;
};

function seedFile(name: string): void {
  const src = path.join(SEED_DIR, name);
  const dest = path.join(DATA_DIR, name);
  if (!fs.existsSync(dest) && fs.existsSync(src)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.trim()) return fallback;
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, 'utf8');
  // Verify write
  const verify = fs.readFileSync(filePath, 'utf8');
  if (verify !== json) {
    throw new Error(`Write verification failed for ${filePath}`);
  }
}

function initFromFiles() {
  if (globalForData.__queues) return;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(ARCHIVES_DIR, { recursive: true });

  seedFile('queues.json');
  seedFile('users.json');
  seedFile('admin.json');

  const queuesFile = path.join(DATA_DIR, 'queues.json');
  const usersFile = path.join(DATA_DIR, 'users.json');
  const adminFile = path.join(DATA_DIR, 'admin.json');

  globalForData.__queues = readJsonFile(queuesFile, { date: new Date().toISOString().split('T')[0], counter: 0, queues: [] });
  globalForData.__users = readJsonFile(usersFile, []);
  const rawAdmin = readJsonFile<AdminData>(adminFile, { username: 'admin', password: 'admin123' });
  if (!rawAdmin.password.startsWith('$2a$') && !rawAdmin.password.startsWith('$2b$')) {
    rawAdmin.password = bcrypt.hashSync(rawAdmin.password, 10);
    writeJsonFile(adminFile, rawAdmin);
  }
  globalForData.__admin = rawAdmin;
}

function persist(type: 'queues' | 'users' | 'admin'): void {
  const file = path.join(DATA_DIR, `${type}.json`);
  let data: unknown;
  if (type === 'queues') data = globalForData.__queues;
  else if (type === 'users') data = globalForData.__users;
  else if (type === 'admin') data = globalForData.__admin;
  writeJsonFile(file, data);

  // Sync to seed file for local development (persists across restarts)
  if (!process.env.VERCEL) {
    const seedFile = path.join(SEED_DIR, `${type}.json`);
    writeJsonFile(seedFile, data);
  }
}

export function getQueues(): QueueData {
  initFromFiles();
  const today = new Date().toISOString().split('T')[0];
  if (globalForData.__queues!.date !== today) {
    resetQueues();
  }
  return globalForData.__queues!;
}

export function saveQueues(data: QueueData): void {
  globalForData.__queues = data;
  persist('queues');
}

export function getUsers(): User[] {
  initFromFiles();
  return globalForData.__users!;
}

export function saveUsers(users: User[]): void {
  globalForData.__users = users;
  persist('users');
}

export function getAdmin(): AdminData {
  initFromFiles();
  return globalForData.__admin!;
}

export function saveAdmin(data: AdminData): void {
  globalForData.__admin = data;
  persist('admin');
}

function archiveCurrentQueues(): void {
  const q = globalForData.__queues;
  if (!q || q.queues.length === 0) return;
  fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
  const archiveFile = path.join(ARCHIVES_DIR, `${q.date}.json`);
  if (!fs.existsSync(archiveFile)) {
    writeJsonFile(archiveFile, q);
  }
}

export function getArchiveList(): string[] {
  if (!fs.existsSync(ARCHIVES_DIR)) return [];
  return fs.readdirSync(ARCHIVES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .sort();
}

export function getArchive(date: string): QueueData | null {
  const file = path.join(ARCHIVES_DIR, `${date}.json`);
  if (!fs.existsSync(file)) return null;
  return readJsonFile(file, null);
}

export function resetQueues(): void {
  archiveCurrentQueues();
  const today = new Date().toISOString().split('T')[0];
  globalForData.__queues = { date: today, counter: 0, queues: [] };
  persist('queues');
}

export function isQueueExpired(queue: { status: string; calledAt: string | null }): boolean {
  if (queue.status === 'dipanggil' && queue.calledAt) {
    const elapsed = (Date.now() - new Date(queue.calledAt).getTime()) / (1000 * 60);
    return elapsed > 5;
  }
  return false;
}
