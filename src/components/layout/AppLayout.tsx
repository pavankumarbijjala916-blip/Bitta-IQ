import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 gradient-mesh opacity-60 pointer-events-none" aria-hidden />
      <Navbar />
      <motion.main
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.main>
    </div>
  );
};
