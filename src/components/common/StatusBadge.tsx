import { cn } from '@/lib/utils';
import { BatteryStatus } from '@/types/battery';

interface StatusBadgeProps {
  status: BatteryStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  healthy: {
    label: 'Reusable',
    emoji: '🟢',
    className: 'bg-status-healthy/10 text-status-healthy border-status-healthy/20',
  },
  repairable: {
    label: 'Repairable',
    emoji: '🟡',
    className: 'bg-status-repairable/10 text-status-repairable border-status-repairable/20',
  },
  recyclable: {
    label: 'Recyclable',
    emoji: '🔴',
    className: 'bg-status-recyclable/10 text-status-recyclable border-status-recyclable/20',
  },
};

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        config.className,
        size === 'sm' && "px-2 py-0.5 text-xs",
        size === 'md' && "px-3 py-1 text-sm",
        size === 'lg' && "px-4 py-1.5 text-base"
      )}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
};
