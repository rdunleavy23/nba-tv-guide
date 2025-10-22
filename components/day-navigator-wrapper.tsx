'use client';

import { useState } from 'react';
import { DayNavigator } from '@/components/day-navigator';

export function DayNavigatorWrapper() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  return (
    <DayNavigator 
      currentDate={currentDate} 
      onDateChange={(date) => {
        setCurrentDate(date);
        console.log('Date changed to:', date);
      }} 
    />
  );
}
