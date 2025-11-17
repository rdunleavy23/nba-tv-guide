'use client';

import { useSwipeable } from 'react-swipeable';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

interface SwipeableGameListProps {
  children: ReactNode;
  currentDate?: Date;
}

export function SwipeableGameList({ children, currentDate }: SwipeableGameListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (daysToAdd: number) => {
    const date = currentDate || new Date();
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + daysToAdd);

    // Update URL with new date
    const dateStr = newDate.toISOString().split('T')[0];
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', dateStr);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      // Swipe left = next day (feels natural on mobile)
      handleDateChange(1);
    },
    onSwipedRight: () => {
      // Swipe right = previous day
      handleDateChange(-1);
    },
    trackMouse: false, // Only track touch, not mouse (desktop users use buttons)
    preventScrollOnSwipe: true, // Prevent vertical scroll during horizontal swipe
    trackTouch: true,
  });

  return <div {...swipeHandlers}>{children}</div>;
}
