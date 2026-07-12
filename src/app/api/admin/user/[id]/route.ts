import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { deleteUser } from '@/lib/queries/users';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    const { id } = params;
    const deleted = await deleteUser(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Pasien tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Pasien berhasil dihapus' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Delete user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}