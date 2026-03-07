import { cn } from '@/lib/utils';
import { BatteryStatus } from '@/types/battery';

interface SoHProgressBarProps {
  soh: number;
  status: BatteryStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

export const SoHProgressBar = ({
  soh,
  status,
  size = 'md',
  showLabel = true,
  animate = true,
}: SoHProgressBarProps) => {
  const statusColors = {
    healthy: 'bg-status-healthy',
    repairable: 'bg-status-repairable',
    recyclable: 'bg-status-recyclable',
  };

  const glowColors = {
    healthy: 'shadow-[0_0_10px_hsl(152,75%,40%,0.4)]',
    repairable: 'shadow-[0_0_10px_hsl(38,92%,50%,0.4)]',
    recyclable: 'shadow-[0_0_10px_hsl(0,72%,51%,0.4)]',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-5',
  };

  return (
    <div className="w-full space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">State of Health</span>
          <span className={cn(
            "font-bold text-lg transition-all duration-300",
            status === 'healthy' && 'text-status-healthy',
            status === 'repairable' && 'text-status-repairable',
            status === 'recyclable' && 'text-status-recyclable'
          )}>
            {soh}%
          </span>
        </div>
      )}
      <div className={cn(
        "w-full overflow-hidden rounded-full bg-muted relative",
        heights[size]
      )}>
        {/* Track marks */}
        <div className="absolute inset-0 flex">
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="absolute h-full w-px bg-foreground/10"
              style={{ left: `${mark}%` }}
            />
          ))}
        </div>

        {/* Progress fill */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden",
            statusColors[status],
            animate && glowColors[status]
          )}
          style={{
            width: animate ? `${soh}%` : `${soh}%`,
            animation: animate ? 'battery-charge 1.5s ease-out forwards' : undefined,
            ['--charge-level' as string]: `${soh}%`,
          }}
        >
          {/* Shimmer effect */}
          {animate && soh > 20 && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
              style={{ backgroundSize: '200% 100%' }}
            />
          )}
        </div>
      </div>

      {/* Status indicators */}
      {size === 'lg' && (
        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
          <span>Critical</span>
          <span>Fair</span>
          <span>Good</span>
          <span>Excellent</span>
        </div>
      )}
    </div>
  );
};
