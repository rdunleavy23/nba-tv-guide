'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedGameListProps {
  children: ReactNode;
  dateKey: string; // Unique key for the date to trigger animations
}

export function AnimatedGameList({ children, dateKey }: AnimatedGameListProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={dateKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
