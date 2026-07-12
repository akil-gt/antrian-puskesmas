"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const { user: rawUser, admin, logoutUser, logoutAdmin } = useAuth();
  const user = rawUser as { nama: string } | null;

  return (
    <nav
      className={`w-full z-50 ${
        transparent
          ? "absolute top-0 left-0"
          : "bg-white shadow-sm"
      } transition-all`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/LogoPuskesmasTamamaung.jpeg"
              alt="Logo Puskesmas Tamamaung"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span
              className={`font-bold text-lg ${
                transparent ? "text-white" : "text-gray-900"
              }`}
            >
              Puskesmas Tamamaung
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  href="/patient"
                  className={`text-sm font-medium ${
                    transparent
                      ? "text-white/90 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  } transition-colors`}
                >
                  Dashboard
                </Link>
                <span
                  className={`text-sm ${
                    transparent ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {user.nama}
                </span>
                <button
                  onClick={logoutUser}
                  className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : admin ? (
              <>
                <Link
                  href="/admin"
                  className={`text-sm font-medium ${
                    transparent
                      ? "text-white/90 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  } transition-colors`}
                >
                  Dashboard Admin
                </Link>
                <button
                  onClick={logoutAdmin}
                  className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-primary text-sm !py-2 !px-4">
                  Masuk
                </Link>
                <Link
                  href="/admin/login"
                  className={`text-sm font-medium ${
                    transparent
                      ? "text-white/70 hover:text-white"
                      : "text-gray-500 hover:text-gray-700"
                  } transition-colors`}
                >
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
