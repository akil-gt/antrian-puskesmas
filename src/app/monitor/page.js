'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import StatsGrid from '@/components/StatsGrid';
import QueueCard from '@/components/QueueCard';
import Spinner from '@/components/Spinner';
import { usePolling } from '@/hooks/usePolling';
import { queue } from '@/lib/api';

export default function MonitorPage() {
  const { data, loading } = usePolling(() => queue.monitor(), 3000);

  const stats = data
    ? { menunggu: data.menunggu, dipanggil: data.dipanggil, sedangBerobat: data.sedangBerobat, selesai: data.selesai }
    : { menunggu: 0, dipanggil: 0, sedangBerobat: 0, selesai: 0 };

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/LogoPuskesmasTamamaung.jpeg"
              alt="Logo Puskesmas Tamamaung"
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
            <div>
              <h1 className="text-lg font-bold">Monitor Antrian - Puskesmas Tamamaung</h1>
              <p className="text-xs text-gray-400">{today}</p>
            </div>
          </div>
          <Link href="/" className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-all">
            Kembali
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Current Number - Big Display */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Nomor Sedang Dipanggil</p>
          <p className="text-7xl md:text-9xl font-extrabold text-primary-400 animate-pulse-slow">
            {loading ? '---' : data?.currentNumber || '---'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
          {[
            { label: 'Menunggu', value: stats.menunggu, color: 'text-blue-400', bg: 'bg-blue-900/30' },
            { label: 'Dipanggil', value: stats.dipanggil, color: 'text-amber-400', bg: 'bg-amber-900/30' },
            { label: 'Berobat', value: stats.sedangBerobat, color: 'text-purple-400', bg: 'bg-purple-900/30' },
            { label: 'Selesai', value: stats.selesai, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
          ].map((item) => (
            <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
              <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-sm text-gray-400 mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Queue Lists */}
        {loading ? (
          <Spinner size="lg" className="py-16" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Menunggu */}
            <div className="animate-fade-in">
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-700">
                Menunggu
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data?.menungguList?.length > 0 ? data.menungguList.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800 border-l-4 border-blue-500">
                    <span className="font-bold text-lg">{q.nomor}</span>
                    <span className="text-xs text-gray-400">{q.nama}</span>
                  </div>
                )) : (
                  <p className="text-gray-600 text-sm text-center py-4">Kosong</p>
                )}
              </div>
            </div>

            {/* Dipanggil */}
            <div className="animate-fade-in">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-700">
                Dipanggil
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data?.dipanggilList?.length > 0 ? data.dipanggilList.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800 border-l-4 border-amber-500 animate-pulse-slow">
                    <span className="font-bold text-lg text-amber-400">{q.nomor}</span>
                    <span className="text-xs text-gray-400">{q.nama}</span>
                  </div>
                )) : (
                  <p className="text-gray-600 text-sm text-center py-4">Kosong</p>
                )}
              </div>
            </div>

            {/* Sedang Berobat */}
            <div className="animate-fade-in">
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-700">
                Sedang Berobat
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data?.sedangBerobatList?.length > 0 ? data.sedangBerobatList.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800 border-l-4 border-purple-500">
                    <span className="font-bold text-lg">{q.nomor}</span>
                    <span className="text-xs text-gray-400">{q.nama}</span>
                  </div>
                )) : (
                  <p className="text-gray-600 text-sm text-center py-4">Kosong</p>
                )}
              </div>
            </div>

            {/* Selesai */}
            <div className="animate-fade-in">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-700">
                Selesai
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data?.selesaiList?.length > 0 ? data.selesaiList.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800 border-l-4 border-emerald-500 opacity-70">
                    <span className="font-bold text-lg">{q.nomor}</span>
                    <span className="text-xs text-gray-400">{q.nama}</span>
                  </div>
                )) : (
                  <p className="text-gray-600 text-sm text-center py-4">Kosong</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-amber-500/80 text-sm">
            Peringatan: Antrian yang sudah dipanggil akan hangus setelah 5 menit jika tidak hadir.
          </p>
        </div>
      </div>
    </div>
  );
}
