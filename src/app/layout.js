import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const PWARegister = dynamic(() => import('@/components/PWARegister'), { ssr: false });
const InstallBanner = dynamic(() => import('@/components/InstallBanner'), { ssr: false });

export const metadata = {
  title: 'Antrian Digital - Puskesmas Tamamaung',
  description: 'Sistem Antrian Digital Puskesmas Tamamaung. Ambil nomor antrian secara online dan pantau status secara real-time.',
  icons: {
    icon: '/LogoPuskesmasTamamaung.jpeg',
    apple: '/LogoPuskesmasTamamaung.jpeg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Antrian Digital - Puskesmas Tamamaung',
    description: 'Sistem Antrian Digital Puskesmas Tamamaung',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#16a34a" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/LogoPuskesmasTamamaung.jpeg" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <PWARegister />
          {children}
          <InstallBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
