'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { queue } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';
import Navbar from '@/components/Navbar';
import StatsGrid from '@/components/StatsGrid';
import StatusBadge from '@/components/StatusBadge';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';

export default function PatientDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [taking, setTaking] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchMyQueue = useCallback(() => queue.myQueue(), []);
  const fetchMonitor = useCallback(() => queue.monitor(), []);

  const { data: myQueueData, loading: queueLoading } = usePolling(fetchMyQueue, 5000);
  const { data: monitorData } = usePolling(fetchMonitor, 5000);

  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  const handleTakeQueue = async () => {
    setTaking(true);
    try {
      const data = await queue.take();
      setToast({ message: `Nomor antrian ${data.queue.nomor} berhasil diambil!`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setTaking(false);
    }
  };

  const stats = monitorData
    ? { menunggu: monitorData.menunggu, dipanggil: monitorData.dipanggil, sedangBerobat: monitorData.sedangBerobat, selesai: monitorData.selesai }
    : { menunggu: 0, dipanggil: 0, sedangBerobat: 0, selesai: 0 };

  const currentQueue = myQueueData?.queue;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Antrian</h1>
          <p className="text-gray-500 mt-1">Selamat datang, {user?.nama}</p>
        </div>

        {/* Current Queue */}
        <section className="animate-fade-in">
          <div className="card !p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Nomor Antrian Saya
              </h2>
            </div>

            <div className="p-6">
              {queueLoading ? (
                <Spinner size="md" className="py-10" />
              ) : currentQueue ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-primary-50 rounded-2xl flex items-center justify-center border-2 border-primary-200 shadow-inner">
                        <p className="text-4xl font-extrabold text-primary-600 tracking-tight">{currentQueue.nomor}</p>
                      </div>
                      {currentQueue.status === 'dipanggil' && (
                        <div className="absolute -top-2 -right-2">
                          <span className="flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-500 items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <StatusBadge status={currentQueue.status} />
                      {currentQueue.status === 'dipanggil' && (
                        <p className="text-amber-600 font-semibold text-sm animate-pulse-slow flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          Silakan datang ke loket sekarang!
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 space-y-1 bg-gray-50 rounded-xl px-4 py-3 sm:self-center">
                    <p>Dibuat: {new Date(currentQueue.createdAt).toLocaleTimeString('id-ID')}</p>
                    {currentQueue.calledAt && (
                      <p className="text-amber-700 font-medium">Dipanggil: {new Date(currentQueue.calledAt).toLocaleTimeString('id-ID')}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-6 text-lg">Anda belum mengambil nomor antrian hari ini</p>
                  <button
                    onClick={handleTakeQueue}
                    disabled={taking}
                    className="btn-primary text-lg !py-4 !px-10 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    {taking ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Mengambil...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        Ambil Nomor Antrian
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="animate-fade-in">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Statistik Hari Ini
            </h2>
            <StatsGrid stats={stats} />
          </div>
        </section>

        {/* Queue Progress */}
        {monitorData && monitorData.currentNumber && (
          <section className="animate-fade-in">
            <div className="card text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Sedang Dipanggil
              </h2>
              <p className="text-6xl font-extrabold text-primary-600 py-6 tracking-tight">{monitorData.currentNumber}</p>
              <p className="text-sm text-gray-500 bg-gray-50 inline-block px-4 py-2 rounded-full">
                Total antrian hari ini: {monitorData.totalQueue}
              </p>
            </div>
          </section>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
