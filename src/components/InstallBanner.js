'use client';

import { useState, useEffect } from 'react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('installBannerDismissed');
      if (!dismissed) setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setShow(false);
      localStorage.setItem('installBannerDismissed', 'true');
    });

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      localStorage.setItem('installBannerDismissed', 'true');
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 animate-slide-up">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-center gap-3">
        <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Install Aplikasi</p>
          <p className="text-xs text-gray-500 truncate">
            Pasang Antrian Puskesmas di layar utama&amp;nbsp;HP
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleInstall}
            className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all shadow-sm">
            Install
          </button>
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
