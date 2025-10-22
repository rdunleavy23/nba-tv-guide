'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DayNavigatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function DayNavigator({ currentDate, onDateChange }: DayNavigatorProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={goToPreviousDay} aria-label="Previous day">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm tabular-nums px-2">
        {formatDate(currentDate)}
      </span>
      <Button variant="ghost" size="icon" onClick={goToNextDay} aria-label="Next day">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
