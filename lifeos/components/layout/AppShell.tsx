'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AuthGate } from '@/components/auth/AuthGate';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FloatingApprovalQueue } from '@/components/notifications/FloatingApprovalQueue';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <AuthGate>{children}</AuthGate>;
  if (!user.onboardingComplete) return <OnboardingWizard />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-60 min-h-screen overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-slate-950 px-4 py-5 pb-28 lg:px-6 lg:py-6 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileBottomNav onMoreClick={() => setMobileMenuOpen(true)} />
      {/* Global floating bank notification approvals */}
      <FloatingApprovalQueue />
    </div>
  );
}
