'use client';

interface DateScrollerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export default function DateScroller({ selectedDate, onDateSelect }: DateScrollerProps) {
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

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
      {dates.map((date) => {
        const dateKey = formatDateKey(date);
        const isSelected = dateKey === selectedDate;
        
        return (
          <button
            key={dateKey}
            onClick={() => onDateSelect(dateKey)}
            className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-[var(--accent)] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {formatDate(date)}
          </button>
        );
      })}
    </div>
  );
}
