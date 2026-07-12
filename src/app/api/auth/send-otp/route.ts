import { NextRequest, NextResponse } from 'next/server';
import { expireOldOtps, saveOtp } from '@/lib/queries/otp';
import { sendSms, generateOtpCode, buildOtpMessage } from '@/lib/sms';
import { rateLimitByIp } from '@/lib/rate-limit';
import { validatePhone } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimitByIp(req, 'send-otp', 3, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 });
    }

    const { noHp } = await req.json();

    if (!noHp || !validatePhone(noHp)) {
      return NextResponse.json({ error: 'Nomor HP tidak valid' }, { status: 400 });
    }

    const phone = noHp.startsWith('0') ? '62' + noHp.slice(1) : noHp;

    await expireOldOtps(phone);

    const code = generateOtpCode();
    await saveOtp(phone, code);

    try {
      await sendSms(phone, buildOtpMessage(code));
    } catch {
      return NextResponse.json({ error: 'Gagal mengirim SMS. Periksa nomor HP.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Kode OTP telah dikirim ke nomor HP Anda' }, { status: 200 });
  } catch (err) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
