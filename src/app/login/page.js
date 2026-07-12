'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/api';
import Toast from '@/components/Toast';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { loginUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await auth.login(form);
      loginUser(data.token, data.user);
      setToast({ message: 'Login berhasil!', type: 'success' });
      setTimeout(() => router.push('/patient'), 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4 group">
            <Image
              src="/LogoPuskesmasTamamaung.jpeg"
              alt="Logo Puskesmas Tamamaung"
              width={48}
              height={48}
              className="rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Masuk ke Akun Anda</h1>
          <p className="text-gray-500 mt-1">Selamat datang kembali</p>
        </div>

        <div className="animate-fade-in">
          <div className="card">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 border border-red-200">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input-field transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input-field transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Masuk...' : 'Masuk'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
              Belum punya akun?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
