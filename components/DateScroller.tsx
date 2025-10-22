'use client';

import { useRef } from 'react';

interface DateScrollerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  gameCounts?: Record<string, number>;
  liveGameCounts?: Record<string, number>;
}

export default function DateScroller({ selectedDate, onDateSelect, gameCounts, liveGameCounts }: DateScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  };

  const dates = generateDates();

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      const prevDate = dates[currentIndex - 1];
      onDateSelect(formatDateKey(prevDate));
      // Focus the previous button
      const prevButton = containerRef.current?.children[currentIndex - 1] as HTMLButtonElement;
      prevButton?.focus();
    } else if (e.key === 'ArrowRight' && currentIndex < dates.length - 1) {
      const nextDate = dates[currentIndex + 1];
      onDateSelect(formatDateKey(nextDate));
      // Focus the next button
      const nextButton = containerRef.current?.children[currentIndex + 1] as HTMLButtonElement;
      nextButton?.focus();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex gap-2 overflow-x-auto pb-2 mb-4"
      role="tablist"
      aria-label="Date selection"
    >
      {dates.map((date, index) => {
        const dateKey = formatDateKey(date);
        const isSelected = dateKey === selectedDate;
        
        const gameCount = gameCounts?.[dateKey] || 0;
        const liveCount = liveGameCounts?.[dateKey] || 0;
        const isToday = dateKey === selectedDate && date.toDateString() === new Date().toDateString();
        
        return (
          <button
            key={dateKey}
            onClick={() => onDateSelect(dateKey)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
              isSelected
                ? isToday && liveCount > 0
                  ? 'bg-red-700 text-white font-bold'
                  : 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`date-${dateKey}`}
            tabIndex={isSelected ? 0 : -1}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span>{formatDate(date)}</span>
                {liveCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              {gameCount > 0 && (
                <div className="text-xs opacity-75 mt-1">
                  {gameCount} game{gameCount !== 1 ? 's' : ''}
                  {liveCount > 0 && (
                    <span className="text-red-500 font-medium"> • {liveCount} live</span>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
