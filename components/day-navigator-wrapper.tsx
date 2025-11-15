'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DayNavigator } from '@/components/day-navigator';

interface DayNavigatorWrapperProps {
  initialDate?: Date;
}

export function DayNavigatorWrapper({ initialDate }: DayNavigatorWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentDate, setCurrentDate] = useState(() => {
    // Use initialDate from props, or date from URL, or today
    if (initialDate) return initialDate;
    const urlDate = searchParams.get('date');
    if (urlDate) {
      const parsed = new Date(urlDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  // Sync with URL when it changes externally
  useEffect(() => {
    const urlDate = searchParams.get('date');
    if (urlDate) {
      const parsed = new Date(urlDate);
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(parsed);
      }
    } else if (!initialDate) {
      // Reset to today if no date in URL and no initial date
      setCurrentDate(new Date());
    }
  }, [searchParams, initialDate]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    // Update URL with new date
    const dateStr = date.toISOString().split('T')[0];
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', dateStr);
    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  return (
    <DayNavigator 
      currentDate={currentDate} 
      onDateChange={handleDateChange} 
    />
  );
}
