import { query, queryOne } from '@/lib/db';
import type { QueueData } from '@/types';

export async function getArchiveList(): Promise<string[]> {
  const rows = await query<{ queue_date: string }>(
    'SELECT queue_date FROM queue_archives ORDER BY queue_date DESC'
  );
  return rows.map(r => r.queue_date);
}

export async function getArchive(date: string): Promise<QueueData | null> {
  const row = await queryOne<{ data: string }>(
    'SELECT data FROM queue_archives WHERE queue_date = ?',
    [date]
  );
  if (!row) return null;
  return typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
}