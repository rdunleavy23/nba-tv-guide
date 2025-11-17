'use client';

import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { isToday } from 'date-fns';

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

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
    }
  };

  // NBA season date limits (approximate)
  const seasonStart = new Date('2024-10-01');
  const seasonEnd = new Date('2025-06-30');
  const currentIsToday = isToday(currentDate);

  return (
    <div className="flex items-center gap-1">
      {/* Previous Day Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPreviousDay}
        aria-label="Previous day"
        className="hover:bg-accent/20"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Date Picker Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={`text-sm tabular-nums px-3 gap-2 h-10 ${
              currentIsToday ? 'bg-accent/10 font-medium' : ''
            }`}
            aria-label="Select date"
          >
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(currentDate)}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleSelectDate}
            initialFocus
            fromDate={seasonStart}
            toDate={seasonEnd}
            defaultMonth={currentDate}
          />
        </PopoverContent>
      </Popover>

      {/* Next Day Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNextDay}
        aria-label="Next day"
        className="hover:bg-accent/20"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
