# AGENTS.md — Antrian Digital Puskesmas Tamamaung

## Project Overview
Aplikasi antrian digital untuk Puskesmas Tamamaung. Full-stack Next.js 14 dengan API Routes.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes (App Router)
- **Auth**: JWT (jsonwebtoken), bcryptjs
- **Database**: In-memory + data/*.json (deployed as files)
- **Components**: Navbar, QueueCard, StatsGrid, StatusBadge, CountdownTimer, Spinner, Toast
- **SMS Gateway**: Fonnte (via FONNTE_API_KEY)

## Project Structure
```
antrian-puskesmas/
├── data/                    # JSON data files (deployed, read at startup)
│   ├── queues.json
│   ├── users.json
│   ├── admin.json
│   └── archives/
├── public/
│   ├── LogoPuskesmasTamamaung.jpeg
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js (Home)
│   │   ├── not-found.js
│   │   ├── globals.css
│   │   ├── login/page.js
│   │   ├── register/page.js
│   │   ├── patient/page.js
│   │   ├── monitor/page.js
│   │   ├── admin/login/page.js
│   │   ├── admin/page.js
│   │   └── api/
│   │       ├── auth/login/route.ts
│   │       ├── auth/register/route.ts
│   │       ├── auth/admin/login/route.ts
│   │       ├── auth/send-otp/route.ts
│   │       ├── queue/take/route.ts
│   │       ├── queue/my-queue/route.ts
│   │       ├── queue/monitor/route.ts
│   │       ├── admin/queues/route.ts
│   │       ├── admin/queue/[id]/route.ts (DELETE)
│   │       ├── admin/queue/[id]/call/route.ts
│   │       ├── admin/queue/[id]/status/route.ts
│   │       ├── admin/queue/[id]/requeue/route.ts
│   │       ├── admin/users/route.ts
│   │       ├── admin/user/[id]/route.ts (DELETE)
│   │       ├── admin/user/[id]/password/route.ts
│   │       ├── admin/user/[id]/reset-queue/route.ts
│   │       ├── admin/archives/route.ts
│   │       └── admin/archives/[date]/route.ts
│   ├── components/ (Navbar.tsx, QueueCard.tsx, StatsGrid.js, etc.)
│   ├── context/AuthContext.js
│   ├── hooks/usePolling.js
│   ├── lib/
│   │   ├── api.js (frontend API client)
│   │   ├── route-auth.ts (JWT helper for API routes)
│   │   ├── route-db.ts (in-memory data store)
│   │   ├── rate-limit.ts (in-memory rate limiter)
│   │   ├── validation.ts (input validation)
│   │   └── sms.ts (Fonnte SMS gateway)
│   └── types/index.ts
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.local
└── package.json
```

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | next dev -p 3000 |
| `npm run build` | next build |
| `npm start` | next start -p 3000 |

## API Endpoints (Next.js API Routes)
- `POST /api/auth/register` — Register (rate limited: 5x/menit)
- `POST /api/auth/login` — Login (rate limited: 5x/menit)
- `POST /api/auth/admin/login` — Admin login (rate limited: 5x/menit)
- `POST /api/auth/send-otp` — Kirim OTP via Fonnte (rate limited: 3x/menit)
- `POST /api/queue/take` — Ambil antrian (auth)
- `GET /api/queue/my-queue` — Antrian saya (auth)
- `GET /api/queue/monitor` — Monitor publik
- `GET /api/admin/queues` — Semua antrian (admin)
- `PUT /api/admin/queue/:id/status` — Update status
- `PUT /api/admin/queue/:id/call` — Panggil pasien
- `DELETE /api/admin/queue/:id` — Hapus antrian
- `GET /api/admin/users` — Data pasien
- `PUT /api/admin/user/:id/password` — Reset password
- `GET /api/admin/archives` — Daftar arsip
- `GET /api/admin/archives/:date` — Detail arsip

## Queue System
- **Format**: A001, A002...
- **Status flow**: menunggu → dipanggil → sedang_berobat → selesai
- **Timeout**: 5 menit (dipanggil → hangus)
- **Reset otomatis**: tengah malam + archive
- **Data**: In-memory (diinisialisasi dari data/*.json saat cold start)

## Auth
- **Admin**: admin / admin123
- **JWT**: 24 jam, bcrypt only (no plaintext fallback)
- **Rate limiting**: Login 5x/menit per IP, OTP 3x/menit per IP

## Security Improvements (July 2026)
1. **Security Headers** — CSP, HSTS (63072000s), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Permissions-Policy, Referrer-Policy di `next.config.js`
2. **JWT Secret** — Wajib via `JWT_SECRET` env, hardcoded fallback dihapus
3. **Plaintext Password** — Semua fallback plaintext dihapus, bcrypt-only untuk login dan admin
4. **Rate Limiting** — `src/lib/rate-limit.ts` melindungi login, register, send-otp dari brute force
5. **Input Validation** — `src/lib/validation.ts` dengan validasi NIK (16 digit), nomor HP, username, password (min 6)
6. **Admin Password** — Sudah di-hash bcrypt di `data/admin.json`
7. **SMS OTP** — Terintegrasi dengan Fonnte via `FONNTE_API_KEY`

## Deployment (Vercel)
1. Push ke GitHub
2. Import di Vercel (https://vercel.com)
3. Set environment variables: JWT_SECRET, FONNTE_API_KEY, MYSQL_*
4. Data akan dibaca dari data/*.json saat cold start
