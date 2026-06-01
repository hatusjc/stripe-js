import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ className, children, onClick, hover }: CardProps) {
  return (
    <div
      className={cn(
        'bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm',
        hover && 'hover:bg-slate-800/80 hover:border-slate-600/50 transition-all cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-4 pb-2', className)}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-4 pb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h3 className={cn('text-sm font-semibold text-slate-200', className)}>{children}</h3>;
}
