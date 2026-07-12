import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, mutate } from '@/lib/db';
import type { QueueEntry, QueueData, MonitorResponse } from '@/types';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getQueues(): Promise<QueueData> {
  const today = getToday();

  const queueMeta = await queryOne<{ date: string; counter: number }>(
    'SELECT queue_date as date, counter FROM queue_metadata WHERE queue_date = ?',
    [today]
  );

  if (!queueMeta) {
    await mutate(
      'INSERT INTO queue_metadata (id, queue_date, counter) VALUES (?, ?, ?)',
      [uuidv4(), today, 0]
    );
  }

  const queues = await query<QueueEntry>(
    `SELECT id, user_id as userId, nama, nomor, status, created_at as createdAt, called_at as calledAt
     FROM queues WHERE queue_date = ? ORDER BY created_at`,
    [today]
  );

  return {
    date: today,
    counter: queueMeta?.counter || 0,
    queues: queues.map(q => ({
      ...q,
      createdAt: q.createdAt,
      calledAt: q.calledAt,
      calledExpired: false,
    }))
  };
}

export async function getMonitorData(): Promise<MonitorResponse> {
  const today = getToday();
  const queueData = await getQueues();
  const all = queueData.queues;
  const current = all.find(q => q.status === 'dipanggil') || all.find(q => q.status === 'sedang_berobat');

  return {
    date: today,
    totalQueue: all.length,
    currentNumber: current?.nomor || '-',
    menunggu: all.filter(q => q.status === 'menunggu').length,
    dipanggil: all.filter(q => q.status === 'dipanggil').length,
    sedangBerobat: all.filter(q => q.status === 'sedang_berobat').length,
    selesai: all.filter(q => q.status === 'selesai').length,
    menungguList: all.filter(q => q.status === 'menunggu').map(q => ({ id: q.id, nomor: q.nomor, nama: q.nama, createdAt: q.createdAt })),
    dipanggilList: all.filter(q => q.status === 'dipanggil').map(q => ({ id: q.id, nomor: q.nomor, nama: q.nama, calledAt: q.calledAt })),
    sedangBerobatList: all.filter(q => q.status === 'sedang_berobat').map(q => ({ id: q.id, nomor: q.nomor, nama: q.nama })),
    selesaiList: all.filter(q => q.status === 'selesai').map(q => ({ id: q.id, nomor: q.nomor, nama: q.nama })),
  };
}

export async function getQueueByUserId(userId: string): Promise<QueueEntry | null> {
  const today = getToday();
  return queryOne<QueueEntry>(
    `SELECT id, user_id as userId, nama, nomor, status, created_at as createdAt, called_at as calledAt
     FROM queues WHERE user_id = ? AND queue_date = ? ORDER BY created_at DESC`,
    [userId, today]
  );
}

export async function createQueueEntry(data: { userId: string; nama: string; nomor: string; status: QueueEntry['status']; calledAt: string | null }): Promise<QueueEntry> {
  const today = getToday();
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  await mutate(
    'INSERT INTO queues (id, user_id, nama, nomor, status, queue_date, created_at, called_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.userId, data.nama, data.nomor, data.status, today, createdAt, data.calledAt]
  );

  return { id, ...data, createdAt, calledExpired: false };
}

export async function updateQueueStatus(id: string, status: QueueEntry['status'], calledAt?: string | null): Promise<boolean> {
  const result = await mutate(
    'UPDATE queues SET status = ?, called_at = ? WHERE id = ?',
    [status, calledAt || null, id]
  );
  return result.affectedRows > 0;
}

export async function deleteQueue(id: string): Promise<boolean> {
  const result = await mutate('DELETE FROM queues WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function deleteUserTodayQueue(userId: string): Promise<boolean> {
  const today = getToday();
  const result = await mutate(
    'DELETE FROM queues WHERE user_id = ? AND queue_date = ?',
    [userId, today]
  );
  return result.affectedRows > 0;
}

export async function incrementCounter(): Promise<number> {
  const today = getToday();
  const meta = await queryOne<{ counter: number }>(
    'SELECT counter FROM queue_metadata WHERE queue_date = ?',
    [today]
  );

  const newCounter = (meta?.counter || 0) + 1;

  if (meta) {
    await mutate('UPDATE queue_metadata SET counter = ? WHERE queue_date = ?', [newCounter, today]);
  } else {
    await mutate('INSERT INTO queue_metadata (id, queue_date, counter) VALUES (?, ?, ?)', [uuidv4(), today, newCounter]);
  }

  return newCounter;
}

export async function getNextQueueNumber(): Promise<string> {
  const counter = await incrementCounter();
  return `A${String(counter).padStart(3, '0')}`;
}

export async function resetQueues(): Promise<void> {
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const yesterdayQueues = await query<QueueEntry>(
    `SELECT id, user_id as userId, nama, nomor, status, created_at as createdAt, called_at as calledAt
     FROM queues WHERE queue_date = ?`,
    [yesterday]
  );

  if (yesterdayQueues.length > 0) {
    const yesterdayMeta = await queryOne<{ counter: number }>(
      'SELECT counter FROM queue_metadata WHERE queue_date = ?',
      [yesterday]
    );

    const archiveData = {
      date: yesterday,
      counter: yesterdayMeta?.counter || 0,
      queues: yesterdayQueues,
    };

    await mutate(
      'INSERT INTO queue_archives (queue_date, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
      [yesterday, JSON.stringify(archiveData)]
    );
  }

  await mutate('DELETE FROM queues WHERE queue_date = ?', [today]);
  await mutate('DELETE FROM queue_metadata WHERE queue_date = ?', [today]);
}