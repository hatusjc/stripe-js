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
}

export function StatCard({ title, value, subtitle, trend, icon, iconBg, valueColor, className, onClick }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm',
        onClick && 'hover:bg-slate-800/80 hover:border-slate-600 cursor-pointer transition-all',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-medium truncate">{title}</p>
          <p className={cn('text-xl font-bold mt-1 truncate', valueColor ?? 'text-slate-100')}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end gap-2 ml-2">
          {icon && (
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg ?? 'bg-slate-700')}>
              {icon}
            </div>
          )}
          {trend !== undefined && (
            <div className={cn('flex items-center gap-0.5 text-xs font-medium',
              trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'
            )}>
              {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
              <span>{trend > 0 ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
