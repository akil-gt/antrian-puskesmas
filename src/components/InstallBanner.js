'use client';

import { useState, useEffect } from 'react';

function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    let timer;

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('installBannerDismissed');
      if (!dismissed) {
        clearTimeout(timer);
        timer = setTimeout(() => setShow(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setShow(false);
      localStorage.setItem('installBannerDismissed', 'true');
    });

    const dismissed = localStorage.getItem('installBannerDismissed');
    if (isMobile() && !dismissed) {
      timer = setTimeout(() => setShow(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShow(false);
      if (result.outcome === 'accepted') {
        localStorage.setItem('installBannerDismissed', 'true');
      }
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 animate-slide-up">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-center gap-3">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-primary-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Install Aplikasi</p>
          {deferredPrompt ? (
            <p className="text-xs text-gray-500">Pasang Antrian Puskesmas di layar utama HP</p>
          ) : (
            <p className="text-xs text-gray-500">Buka menu Chrome &rarr; &quot;Add to Home Screen&quot;</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {deferredPrompt ? (
            <button onClick={handleInstall}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all shadow-sm">
              Install
            </button>
          ) : (
            <span className="text-[10px] text-gray-400 italic max-w-[100px] leading-tight">
              Menu &vellip; &rarr; Pasang
            </span>
          )}
          <button onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
