import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { getUsers, saveUsers } from '@/lib/route-db';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    const { id } = params;
    const users = getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Pasien tidak ditemukan' }, { status: 404 });
    }
    users.splice(index, 1);
    saveUsers(users);
    return NextResponse.json({ message: 'Pasien berhasil dihapus' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
