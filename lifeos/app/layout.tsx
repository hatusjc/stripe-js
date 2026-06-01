import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LifeOS — Personal Operating System',
  description: 'O Sistema Operacional para Adultos Responsáveis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="bg-slate-950 antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col ml-60 min-h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
