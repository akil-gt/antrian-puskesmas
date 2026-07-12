import bcrypt from 'bcryptjs';
import { AuthError, verifyAdmin } from '@/lib/route-auth';
import { updatePassword } from '@/lib/queries/users';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    verifyAdmin(request);
    const { id } = params;
    const { password } = await request.json();

    if (!password || password.length < 3) {
      return NextResponse.json({ error: 'Password minimal 3 karakter' }, { status: 400 });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const updated = await updatePassword(id, hashed);
    
    if (!updated) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Password berhasil direset' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Update password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}