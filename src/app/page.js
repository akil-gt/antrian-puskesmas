'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import StatsGrid from '@/components/StatsGrid';
import InstallBanner from '@/components/InstallBanner';
import { usePolling } from '@/hooks/usePolling';
import { queue } from '@/lib/api';

export default function HomePage() {
  const { data } = usePolling(() => queue.monitor(), 5000);

  const stats = data
    ? { menunggu: data.menunggu, dipanggil: data.dipanggil, sedangBerobat: data.sedangBerobat, selesai: data.selesai }
    : { menunggu: 0, dipanggil: 0, sedangBerobat: 0, selesai: 0 };

  return (
    <div className="min-h-screen">
      <Navbar transparent />

      {/* Hero */}
      <section className="animate-fade-in relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white pt-28 pb-24 px-4">
        <div className="absolute top-10 left-5 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-5 w-96 h-96 bg-primary-300/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRjMC0xLjEuOS0yIDItMmgydi00YzAtMS4xLS45LTItMi0yaC00YzEuMSAwIDItLjkgMi0ydjJoNGMxLjEgMCAyIC45IDIgMmgtMnptMC0xMmMwLTEuMS0uOS0yLTItMmgtNHY0aDJjMS4xIDAgMi0uOSAyLTJoMnptLTEyIDJjMC0xLjEuOS0yIDItMmgyVjE0aC00YzEuMSAwIDItLjkgMi0yaDJ6bTAgMTJjMC0xLjEtLjktMi0yLTJoLTJ2NGgyYzEuMSAwIDItLjkgMi0yaDJ6bTEyLTZjMC0xLjEuOS0yIDItMmgydjJoLTJ2LTJ6bS0xMiA2YzAtMS4xLS45LTItMi0yaC0ydjJoMmMxLjEgMCAyLS45IDItMmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-8 animate-slide-up">
            <div className="inline-block p-1.5 bg-white/10 rounded-full backdrop-blur-sm">
              <Image
                src="/LogoPuskesmasTamamaung.jpeg"
                alt="Logo Puskesmas Tamamaung"
                width={110}
                height={110}
                className="rounded-full object-cover mx-auto shadow-xl"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight text-balance">
            Antrian Digital
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-2 font-medium">
            Puskesmas Tamamaung
          </p>
          <p className="text-base text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ambil nomor antrian secara online, pantau status secara real-time, dan hindari antrean panjang.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-primary-700 font-bold py-3.5 px-8 rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl text-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/monitor"
              className="border-2 border-white/30 text-white font-semibold py-3.5 px-8 rounded-lg hover:bg-white/10 hover:border-white/60 transition-all duration-300 text-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Pantau Antrian
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="animate-fade-in max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <StatsGrid stats={stats} />
      </section>

      {/* Cara Menggunakan */}
      <section className="animate-fade-in max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Cara Menggunakan</h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Ikuti langkah mudah berikut untuk menggunakan layanan antrian digital
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Daftar Akun', desc: 'Buat akun baru dengan mengisi data diri Anda secara lengkap.' },
            { step: '2', title: 'Ambil Nomor', desc: 'Masuk ke dashboard dan ambil nomor antrian untuk hari ini.' },
            { step: '3', title: 'Tunggu Dipanggil', desc: 'Pantau status antrian secara real-time. Anda akan dipanggil saat giliran tiba.' },
          ].map((item, index) => (
            <div
              key={item.step}
              className="card text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-lg transition-all duration-300">
                {item.step}
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 pt-12 pb-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-10 text-center md:text-left">
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Puskesmas Tamamaung</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Sistem Antrian Digital untuk memudahkan pasien mendapatkan layanan kesehatan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Navigasi</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/register" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Daftar
                  </Link>
                </li>
                <li>
                  <Link href="/monitor" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Pantau Antrian
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Masuk
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Kontak</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Jl. Abdullah Daeng Sirua No.158</li>
                <li>Masale, Kec. Panakkukang</li>
                <li>Kota Makassar, Sulawesi Selatan 90231</li>
                <li>(0411) 450592</li>
                <li>
                  <a href="https://maps.app.goo.gl/yV6pFRLwQX6uVgNt5" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 transition-colors underline underline-offset-2">
                    Lihat di Google Maps
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            &copy; 2026 Puskesmas Tamamaung. Sistem Antrian Digital.
          </div>
        </div>
      </footer>

      <InstallBanner />
    </div>
  );
}
