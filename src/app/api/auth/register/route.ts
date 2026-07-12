import { NextRequest, NextResponse } from 'next/server';
import { AuthError } from '@/lib/route-auth';
import { getUserByUsername, getUserByNIK, createUser } from '@/lib/queries/users';
import { verifyOtp } from '@/lib/queries/otp';
import bcrypt from 'bcryptjs';
import { rateLimitByIp } from '@/lib/rate-limit';
import { validatePhone, validateNIK, validateUsername, validatePassword, validateNama } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimitByIp(req, 'register', 5, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 });
    }

    const { nama, nik, alamat, noHp, tanggalLahir, username, password, otp } = await req.json();

    if (!nama || !nik || !alamat || !noHp || !tanggalLahir || !username || !password || !otp) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (!validateNama(nama)) {
      return NextResponse.json({ error: 'Nama tidak valid' }, { status: 400 });
    }

    if (!validateNIK(nik)) {
      return NextResponse.json({ error: 'NIK harus 16 digit angka' }, { status: 400 });
    }

    if (!validatePhone(noHp)) {
      return NextResponse.json({ error: 'Nomor HP tidak valid' }, { status: 400 });
    }

    if (!validateUsername(username)) {
      return NextResponse.json({ error: 'Username 3-30 karakter (huruf, angka, underscore)' }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const phone = noHp.startsWith('0') ? '62' + noHp.slice(1) : noHp;
    const valid = await verifyOtp(phone, otp);
    if (!valid) {
      return NextResponse.json({ error: 'Kode OTP salah atau sudah kedaluwarsa' }, { status: 400 });
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 400 });
    }

    const existingNIK = await getUserByNIK(nik);
    if (existingNIK) {
      return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = {
      nama,
      nik,
      alamat,
      noHp,
      tanggalLahir,
      username,
      password: hashedPassword,
    };

    await createUser(newUser);

    return NextResponse.json({ message: 'Registrasi berhasil' }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
