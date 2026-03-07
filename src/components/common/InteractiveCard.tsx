import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'border';
  delay?: number;
}

export const InteractiveCard = ({
  children,
  className,
  hoverEffect = 'lift',
  delay = 0,
}: InteractiveCardProps) => {
  const hoverEffects = {
    lift: 'hover:-translate-y-1 hover:shadow-elevated',
    glow: 'hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]',
    scale: 'hover:scale-[1.02]',
    border: 'hover:border-primary/50',
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-6 shadow-card transition-all duration-300 ease-out animate-fade-in",
        hoverEffects[hoverEffect],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
