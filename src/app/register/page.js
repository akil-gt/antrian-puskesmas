'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/api';
import Toast from '@/components/Toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nama: '', nik: '', alamat: '', noHp: '', tanggalLahir: '', username: '', password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.register(form);
      setToast({ message: 'Registrasi berhasil! Mengalihkan ke login...', type: 'success' });
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4 group">
            <div className="relative transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/LogoPuskesmasTamamaung.jpeg"
                alt="Logo Puskesmas Tamamaung"
                width={64}
                height={64}
                className="rounded-full object-cover ring-4 ring-white shadow-lg"
              />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Akun Baru</h1>
          <p className="text-gray-500 mt-2">Lengkapi data diri Anda untuk mendaftar</p>
        </div>

        <div className="card animate-fade-in">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data Pribadi Section */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Data Pribadi</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input type="text" name="nama" className="input-field" value={form.nama} onChange={handleChange} required placeholder="Masukkan nama lengkap" />
                </div>
                <div>
                  <label className="label">NIK</label>
                  <input type="text" name="nik" className="input-field" value={form.nik} onChange={handleChange} required placeholder="Nomor Induk Kependudukan" />
                </div>
                <div>
                  <label className="label">Alamat</label>
                  <input type="text" name="alamat" className="input-field" value={form.alamat} onChange={handleChange} required placeholder="Masukkan alamat lengkap" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">No. HP</label>
                    <input type="text" name="noHp" className="input-field" value={form.noHp} onChange={handleChange} required placeholder="08xxxxxxxxxx" />
                  </div>
                  <div>
                    <label className="label">Tanggal Lahir</label>
                    <input type="date" name="tanggalLahir" className="input-field" value={form.tanggalLahir} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Akun Section */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Data Akun</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Username</label>
                  <input type="text" name="username" className="input-field" value={form.username} onChange={handleChange} required placeholder="Pilih username" />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" name="password" className="input-field" value={form.password} onChange={handleChange} required placeholder="Buat password" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  <span>Daftar</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
