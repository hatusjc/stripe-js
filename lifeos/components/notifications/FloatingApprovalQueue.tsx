'use client';

import { useBankNotificationStore } from '@/lib/store/bankNotificationStore';
import { TransactionApprovalModal } from './TransactionApprovalModal';

export function FloatingApprovalQueue() {
  const { pendingTransactions } = useBankNotificationStore();

  if (pendingTransactions.length === 0) return null;

  // Show one at a time as a floating card in the bottom-right
  const first = pendingTransactions[0];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 animate-in slide-in-from-bottom-4">
      <div className="relative">
        {/* Stack indicator for multiple */}
        {pendingTransactions.length > 1 && (
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold z-10 shadow-lg">
            {pendingTransactions.length}
          </div>
        )}
        <TransactionApprovalModal pending={first} />
      </div>
    </div>
  );
}
