"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const { user, admin, logoutUser, logoutAdmin } = useAuth() as {
    user: { nama: string } | null;
    admin: boolean;
    logoutUser: () => void;
    logoutAdmin: () => void;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent ? "bg-transparent" : "bg-white/95 backdrop-blur-sm shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-200 group-hover:shadow-primary-300 transition-all duration-300">
              <Image
                src="/LogoPuskesmasTamamaung.jpeg"
                alt="Logo"
                width={36}
                height={36}
                className="rounded-full object-cover w-full h-full"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-900 leading-tight">Puskesmas Tamamaung</h1>
              <p className="text-[10px] font-medium text-primary-600 uppercase tracking-widest leading-tight">Antrian Digital</p>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {admin ? (
              <>
                <span className="hidden sm:inline text-sm font-medium text-gray-600 bg-primary-50 px-3 py-1.5 rounded-full text-primary-700">
                  Admin
                </span>
                <button onClick={logoutAdmin} className="btn-outline !py-1.5 !px-3 text-xs sm:text-sm">Logout</button>
              </>
            ) : user ? (
              <>
                <Link href="/patient" className="btn-outline !py-1.5 !px-3 text-xs sm:text-sm">Antrian Saya</Link>
                <button onClick={logoutUser} className="btn-outline !py-1.5 !px-3 text-xs sm:text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link href="/register" className="btn-outline !py-1.5 !px-3 text-xs sm:text-sm">Daftar</Link>
                <Link href="/login" className="btn-primary !py-1.5 !px-3 text-xs sm:text-sm">Masuk</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}