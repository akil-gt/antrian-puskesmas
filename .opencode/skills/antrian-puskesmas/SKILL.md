---
name: antrian-puskesmas
description: Use when working on the Antrian Digital Puskesmas Tamamaung project — a Next.js 14 queue management app with JWT auth, OTP via Fonnte, and file-based data storage.
---

# Antrian Digital Puskesmas Tamamaung

Next.js 14 (App Router) full-stack queue management system for Puskesmas Tamamaung.

## Tech Stack
- **Framework**: Next.js 14 (App Router), React 18, Tailwind CSS 3
- **Auth**: JWT (jsonwebtoken 24h), bcryptjs (no plaintext fallback)
- **Database**: In-memory + data/*.json files
- **SMS**: Fonnte API (FONNTE_API_KEY)
- **Deploy**: Vercel

## Key Patterns
- API routes use `verifyToken()` / `verifyAdmin()` from `src/lib/route-auth.ts`
- All admin routes must call `verifyAdmin(request)` at the top
- Rate limiting via `rateLimitByIp(req, 'prefix', max, windowMs)` from `src/lib/rate-limit.ts`
- Input validation via `src/lib/validation.ts` (validatePhone, validateNIK, etc.)
- Queue format: A001, A002... Reset otomatis tengah malam
- Status flow: menunggu → dipanggil (5 menit timeout → hangus) → sedang_berobat → selesai

## Security Rules (already applied)
1. Security headers in `next.config.js` (CSP, HSTS, X-Frame-Options, etc.)
2. JWT_SECRET wajib via environment variable
3. bcrypt-only authentication
4. Rate limiting on login (5x/menit), register (5x/menit), send-otp (3x/menit)
5. Input validation for NIK (16 digit), phone, username, password (min 6)
6. Admin password already hashed with bcrypt

## Critical Env Vars
- `JWT_SECRET` — required
- `FONNTE_API_KEY` — untuk SMS OTP
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USERNAME`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` — database connection
