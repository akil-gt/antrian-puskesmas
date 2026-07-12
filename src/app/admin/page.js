'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { admin } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import Spinner from '@/components/Spinner';
import Toast from '@/components/Toast';

const STATUS_FILTERS = ['all', 'menunggu', 'dipanggil', 'sedang_berobat', 'selesai', 'hangus'];
const STATUS_LABELS = { all: 'Semua', menunggu: 'Menunggu', dipanggil: 'Dipanggil', sedang_berobat: 'Berobat', selesai: 'Selesai', hangus: 'Hangus' };

export default function AdminDashboard() {
  const { admin: isAdmin, loading: authLoading, logoutAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('queues');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [editPass, setEditPass] = useState({ id: '', password: '' });
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [archiveData, setArchiveData] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const fetchQueues = useCallback(() => admin.queues(), []);
  const fetchUsers = useCallback(() => admin.users(), []);
  const fetchArchives = useCallback(() => admin.archives(), []);

  const { data: queueData, loading: queueLoading } = usePolling(fetchQueues, 3000);
  const { data: userData, loading: userLoading } = usePolling(fetchUsers, 10000);
  const { data: archivesList } = usePolling(fetchArchives, 15000);

  if (!authLoading && !isAdmin) {
    router.push('/admin/login');
    return null;
  }

  const handleCall = async (id) => {
    try {
      await admin.callPatient(id);
      setToast({ message: 'Pasien berhasil dipanggil', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await admin.updateStatus(id, status);
      setToast({ message: 'Status berhasil diperbarui', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleUpdatePassword = async (id) => {
    if (!editPass.password || editPass.password.length < 3) {
      setToast({ message: 'Password minimal 3 karakter', type: 'error' });
      return;
    }
    try {
      await admin.updatePassword(id, editPass.password);
      setToast({ message: 'Password berhasil diperbarui', type: 'success' });
      setEditPass({ id: '', password: '' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleLoadArchive = async (date) => {
    setArchiveLoading(true);
    setSelectedArchive(date);
    try {
      const data = await admin.archive(date);
      setArchiveData(data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus antrian ini?')) return;
    try {
      await admin.deleteQueue(id);
      setToast({ message: 'Antrian berhasil dihapus', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Yakin ingin menghapus pasien ini? Semua data pasien akan hilang permanen.')) return;
    try {
      await admin.deleteUser(id);
      setToast({ message: 'Pasien berhasil dihapus', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const allQueues = queueData?.all || [];
  const filteredQueues = statusFilter === 'all' ? allQueues : allQueues.filter((q) => q.status === statusFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Dashboard Admin</h1>
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200 self-start sm:self-auto">
            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Total: {queueData?.totalQueue || 0} antrian
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Antrian</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{queueData?.totalQueue || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Menunggu</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{queueData?.menunggu?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dipanggil / Berobat</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{(queueData?.dipanggil?.length || 0) + (queueData?.sedangBerobat?.length || 0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pasien</p>
            <p className="text-2xl font-bold text-primary-600 mt-1">{userData?.users?.length || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1 mb-6 w-fit shadow-sm">
          {[
            { key: 'queues', label: 'Antrian' },
            { key: 'archives', label: 'Arsipan' },
            { key: 'users', label: 'Data Pasien' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Queues Tab */}
        {activeTab === 'queues' && (
          <div className="animate-fade-in">
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ease-in-out ${
                    statusFilter === s
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-200 ring-2 ring-primary-300 ring-offset-1'
                      : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200 shadow-sm'
                  }`}
                >
                  {STATUS_LABELS[s]}
                  {s !== 'all' && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none">
                      {allQueues.filter((q) => q.status === s).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {queueLoading ? (
              <Spinner size="lg" className="py-20" />
            ) : filteredQueues.length === 0 ? (
              <div className="card text-center py-14 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <p className="text-lg font-medium">Tidak ada antrian</p>
                <p className="text-sm mt-1">Belum ada pasien yang mendaftar</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Nomor</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Nama</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">NIK</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">No. HP</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Waktu</th>
                        <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredQueues.map((q, idx) => (
                        <tr key={q.id} className="hover:bg-primary-50/40 transition-all duration-150 ease-in-out group">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 text-primary-700 font-extrabold text-sm ring-1 ring-primary-200">
                              {q.nomor}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="font-medium text-gray-900">{q.nama}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">{q.nik}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-500">{q.noHp}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={q.status} />
                            {q.status === 'dipanggil' && q.calledAt && (
                              <div className="mt-1.5">
                                <CountdownTimer calledAt={q.calledAt} />
                              </div>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-400 text-xs">
                            {new Date(q.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex justify-end gap-1.5">
                              {q.status === 'menunggu' && (
                                <button onClick={() => handleCall(q.id)} className="btn-warning !py-1.5 !px-3 text-xs shadow-sm">
                                  Panggil
                                </button>
                              )}
                              {q.status === 'dipanggil' && (
                                <button onClick={() => handleStatus(q.id, 'sedang_berobat')} className="btn-success !py-1.5 !px-3 text-xs shadow-sm">
                                  Proses
                                </button>
                              )}
                              {q.status === 'sedang_berobat' && (
                                <button onClick={() => handleStatus(q.id, 'selesai')} className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-semibold py-1.5 px-3 rounded-lg transition-all shadow-sm">
                                  Selesai
                                </button>
                              )}
                              {(q.status === 'menunggu' || q.status === 'dipanggil') && (
                                <button onClick={() => handleStatus(q.id, 'hangus')} className="text-xs bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-1.5 px-3 rounded-lg transition-all shadow-sm">
                                  Batalkan
                                </button>
                              )}
                              <button onClick={() => handleDelete(q.id)} className="text-xs bg-gray-100 text-gray-500 hover:bg-gray-200 font-semibold py-1.5 px-3 rounded-lg transition-all hover:text-red-600 shadow-sm">
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Archive Tab */}
        {activeTab === 'archives' && (
          <div className="animate-fade-in">
            <div className="flex flex-wrap gap-2 mb-4">
              {archivesList?.archives?.length > 0 ? archivesList.archives.map((date) => (
                <button
                  key={date}
                  onClick={() => handleLoadArchive(date)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ease-in-out ${
                    selectedArchive === date
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-200 ring-2 ring-primary-300 ring-offset-1'
                      : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-200 shadow-sm'
                  }`}
                >
                  {date}
                </button>
              )) : (
                <div className="card text-center py-10 text-gray-400 w-full border-2 border-dashed border-gray-200 rounded-2xl">
                  <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-base font-medium mb-1">Belum ada arsip</p>
                  <p className="text-xs text-gray-400">Data hari sebelumnya akan otomatis tersimpan saat hari berganti</p>
                </div>
              )}
            </div>

            {archiveLoading ? (
              <Spinner size="lg" className="py-20" />
            ) : archiveData ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300">
                <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Arsip: {selectedArchive}
                  </h3>
                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm self-start sm:self-auto">Total: {archiveData.totalQueue} antrian</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Nomor</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Nama</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">NIK</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">No. HP</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {archiveData.queues.map((q) => (
                        <tr key={q.id} className="hover:bg-primary-50/40 transition-all duration-150 ease-in-out">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 text-primary-700 font-extrabold text-sm ring-1 ring-primary-200">
                              {q.nomor}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-900">{q.nama}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">{q.nik}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-500">{q.noHp}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap"><StatusBadge status={q.status} /></td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-400 text-xs">
                            {new Date(q.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedArchive ? null : (
              <div className="card text-center py-14 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-lg font-medium">Pilih tanggal arsip</p>
                <p className="text-sm mt-1 text-gray-400">Klik tanggal di atas untuk melihat data</p>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            {userLoading ? (
              <Spinner size="lg" className="py-20" />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Nama</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">NIK</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">No. HP</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Alamat</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Username</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Password</th>
                        <th className="text-left px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Terdaftar</th>
                        <th className="text-right px-4 sm:px-6 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {userData?.users?.map((u) => (
                        <tr key={u.id} className="hover:bg-primary-50/40 transition-all duration-150 ease-in-out">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.nama}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">{u.nik}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-500">{u.noHp}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-500 max-w-[160px] truncate">{u.alamat}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-500">{u.username}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {editPass.id === u.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editPass.password}
                                  onChange={(e) => setEditPass({ ...editPass, password: e.target.value })}
                                  className="w-24 px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 outline-none"
                                  placeholder="pass baru"
                                  autoFocus
                                />
                                <button onClick={() => handleUpdatePassword(u.id)} className="text-xs bg-primary-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-primary-700 font-medium transition-all shadow-sm">Simpan</button>
                                <button onClick={() => setEditPass({ id: '', password: '' })} className="text-xs bg-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-300 font-medium transition-all">Batal</button>
                              </div>
                            ) : (
                              <button onClick={() => setEditPass({ id: u.id, password: '' })} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 hover:text-primary-600 font-medium transition-all border border-gray-200">
                                Ganti Pass
                              </button>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-gray-400 text-xs">
                            {new Date(u.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                            <button onClick={() => handleDeleteUser(u.id)} className="text-xs bg-red-100 text-red-600 hover:bg-red-200 font-semibold py-1.5 px-3 rounded-lg transition-all border border-red-200">
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
