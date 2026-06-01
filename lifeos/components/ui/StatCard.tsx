import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: ReactNode;
  iconBg?: string;
  valueColor?: string;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'secondary';
}

export function StatCard({ title, value, subtitle, trend, icon, iconBg, valueColor, className, onClick, variant = 'default' }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-[rgba(15,23,42,0.85)] border border-white/[0.08] rounded-[20px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md flex flex-col justify-between',
        onClick && 'hover:bg-[rgba(15,23,42,0.95)] hover:border-white/[0.12] cursor-pointer transition-all active:scale-[0.99]',
        className
      )}
      style={{ minHeight: 120 }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-medium text-slate-300/85 truncate">{title}</p>
        {icon && (
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', iconBg ?? 'bg-slate-700')}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <p className={cn('text-[22px] font-bold leading-none truncate', valueColor ?? 'text-white')}>{value}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {subtitle && <p className="text-[13px] text-slate-500 truncate">{subtitle}</p>}
          {trend !== undefined && (
            <div className={cn('flex items-center gap-0.5 text-[13px] font-semibold shrink-0',
              trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'
            )}>
              {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
