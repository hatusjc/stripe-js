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
        'bg-[rgba(15,23,42,0.85)] border border-white/[0.08] rounded-[24px] backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.25)]',
        hover && 'hover:bg-[rgba(15,23,42,0.95)] hover:border-white/[0.12] transition-all cursor-pointer active:scale-[0.99]',
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
  return <div className={cn('p-5 pb-3', className)}>{children}</div>;
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-5 pb-5', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h3 className={cn('text-[15px] font-medium text-slate-200/85', className)}>{children}</h3>;
}
