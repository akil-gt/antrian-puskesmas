export async function sendSms(to: string, message: string): Promise<void> {
  const apiKey = process.env.FONNTE_API_KEY;

  if (!apiKey) {
    console.log(`[SMS DEV] To: ${to}, Message: ${message}`);
    return;
  }

  const res = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target: to,
      message,
      delay: '0',
    }),
  });

  const data = await res.json();
  if (!res.ok || data.status !== true) {
    console.error('Fonnte error:', data);
    throw new Error('Gagal mengirim SMS');
  }
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function buildOtpMessage(code: string): string {
  return `Kode OTP Antrian Puskesmas Tamamaung: ${code}\n\nKode berlaku 5 menit. Jangan bagikan kode ini kepada siapa pun.`;
}
