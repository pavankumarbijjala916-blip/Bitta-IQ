import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  variant?: 'default' | 'healthy' | 'repairable' | 'recyclable';
  className?: string;
  delay?: number;
}

const variantStyles = {
  default: 'bg-card border-border',
  healthy: 'bg-status-healthy/5 border-status-healthy/20',
  repairable: 'bg-status-repairable/5 border-status-repairable/20',
  recyclable: 'bg-status-recyclable/5 border-status-recyclable/20',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  healthy: 'bg-status-healthy/10 text-status-healthy',
  repairable: 'bg-status-repairable/10 text-status-repairable',
  recyclable: 'bg-status-recyclable/10 text-status-recyclable',
};

const glowStyles = {
  default: 'hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]',
  healthy: 'hover:shadow-[0_0_30px_hsl(var(--status-healthy)/0.2)]',
  repairable: 'hover:shadow-[0_0_30px_hsl(var(--status-repairable)/0.2)]',
  recyclable: 'hover:shadow-[0_0_30px_hsl(var(--status-recyclable)/0.2)]',
};

export const StatsCard = ({
  title,
  value,
  icon,
  variant = 'default',
  className,
  delay = 0,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-in-up group cursor-default",
        variantStyles[variant],
        glowStyles[variant],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        variant === 'default' && 'bg-gradient-to-br from-primary/5 to-transparent',
        variant === 'healthy' && 'bg-gradient-to-br from-status-healthy/5 to-transparent',
        variant === 'repairable' && 'bg-gradient-to-br from-status-repairable/5 to-transparent',
        variant === 'recyclable' && 'bg-gradient-to-br from-status-recyclable/5 to-transparent',
      )} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl lg:text-4xl font-bold text-foreground transition-transform duration-300 group-hover:scale-105 origin-left tabular-nums">
            {value}
          </p>
        </div>
        <div className={cn(
          "rounded-lg p-2.5 shrink-0 transition-all duration-300 group-hover:scale-110",
          iconStyles[variant]
        )}>
          {icon}
        </div>
      </div>

      {/* Subtle accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full",
        variant === 'default' && 'bg-primary',
        variant === 'healthy' && 'bg-status-healthy',
        variant === 'repairable' && 'bg-status-repairable',
        variant === 'recyclable' && 'bg-status-recyclable',
      )} />
    </div>
  );
};
