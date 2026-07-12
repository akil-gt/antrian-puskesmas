export async function sendSms(to: string, message: string): Promise<void> {
  const apiKey = process.env.FONNTE_API_KEY;

  if (!apiKey) {
    console.log(`[SMS DEV] To: ${to}, Message: ${message}`);
    return;
  }

  const target = to.startsWith('62') ? '0' + to.slice(2) : to;

  const res = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target,
      message,
      delay: '0',
    }),
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    const text = await res.text();
    console.error('Fonnte non-JSON response:', res.status, text);
    throw new Error(`Fonnte API error: ${res.status}`);
  }

  if (!res.ok) {
    console.error('Fonnte HTTP error:', res.status, data);
    throw new Error(`Fonnte API error: ${data?.reason || data?.error || 'Unknown'}`);
  }

  if (data.status !== true) {
    console.error('Fonnte response error:', data);
    throw new Error(data?.reason || data?.error || 'Gagal mengirim SMS');
  }
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function buildOtpMessage(code: string): string {
  return `Kode OTP Antrian Puskesmas Tamamaung: ${code}\n\nKode berlaku 5 menit. Jangan bagikan kode ini kepada siapa pun.`;
}
