import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'table' | 'chart';
}

export const LoadingSkeleton = ({ className, variant = 'default' }: LoadingSkeletonProps) => {
  const baseClasses = 'bg-secondary animate-pulse rounded';

  if (variant === 'card') {
    return (
      <div className={cn('p-6 rounded-xl border border-border', className)}>
        <div className={cn(baseClasses, 'h-6 w-1/3 mb-4')} />
        <div className={cn(baseClasses, 'h-4 w-full mb-2')} />
        <div className={cn(baseClasses, 'h-4 w-2/3')} />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4"
          >
            <div className={cn(baseClasses, 'h-12 flex-1')} />
            <div className={cn(baseClasses, 'h-12 w-24')} />
            <div className={cn(baseClasses, 'h-12 w-32')} />
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn('h-64 rounded-xl border border-border p-6', className)}>
        <div className={cn(baseClasses, 'h-6 w-1/4 mb-4')} />
        <div className={cn(baseClasses, 'h-full w-full')} />
      </div>
    );
  }

  return (
    <motion.div
      className={cn(baseClasses, 'h-4 w-full', className)}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

export const LoadingCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-secondary rounded animate-pulse" />
        <div className="h-8 w-8 bg-secondary rounded-full animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-secondary rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
      </div>
    </motion.div>
  );
};

export const LoadingTable = () => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="h-6 w-48 bg-secondary rounded animate-pulse" />
      </div>
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4"
          >
            <div className="h-10 flex-1 bg-secondary rounded animate-pulse" />
            <div className="h-10 w-24 bg-secondary rounded animate-pulse" />
            <div className="h-10 w-32 bg-secondary rounded animate-pulse" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

