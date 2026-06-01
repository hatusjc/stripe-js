import { cn, getProgressBarColor } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  color?: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, className, barClassName, showLabel, color, size = 'sm' }: ProgressBarProps) {
  const barColor = color ?? getProgressBarColor(value);

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-slate-700/60 rounded-full overflow-hidden h-2">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor, barClassName)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-end mt-1">
          <span className="text-[13px] text-slate-400">{Math.round(value)}%</span>
        </div>
      )}
    </div>
  );
}
