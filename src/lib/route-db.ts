import fs from 'fs';
import path from 'path';
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

  if (fs.existsSync(queuesFile)) {
    globalForData.__queues = JSON.parse(fs.readFileSync(queuesFile, 'utf8'));
  } else {
    globalForData.__queues = {
      date: new Date().toISOString().split('T')[0],
      counter: 0,
      queues: [],
    };
  }

  if (fs.existsSync(usersFile)) {
    globalForData.__users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  } else {
    globalForData.__users = [];
  }

  if (fs.existsSync(adminFile)) {
    globalForData.__admin = JSON.parse(fs.readFileSync(adminFile, 'utf8'));
  } else {
    globalForData.__admin = { username: 'admin', password: 'admin123' };
  }
}

function persist(type: 'queues' | 'users' | 'admin'): void {
  const file = path.join(DATA_DIR, `${type}.json`);
  let data: unknown;
  if (type === 'queues') data = globalForData.__queues;
  else if (type === 'users') data = globalForData.__users;
  else if (type === 'admin') data = globalForData.__admin;
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
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
    fs.writeFileSync(archiveFile, JSON.stringify(q, null, 2));
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
  return JSON.parse(fs.readFileSync(file, 'utf8'));
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
