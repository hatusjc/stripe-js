'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 flex items-start gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
        <Smartphone size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold">Instalar LifeOS</p>
        <p className="text-slate-400 text-xs mt-0.5">Adicione à tela inicial para acesso rápido e uso offline</p>
        <button
          onClick={handleInstall}
          className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all"
        >
          <Download size={12} /> Instalar App
        </button>
      </div>
      <button onClick={() => setShow(false)} className="text-slate-500 hover:text-slate-300 shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
