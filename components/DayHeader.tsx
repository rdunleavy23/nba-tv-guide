'use client';

interface DayHeaderProps {
  date: string;
  gameCount: number;
  isToday?: boolean;
}

export default function DayHeader({ date, gameCount, isToday = false }: DayHeaderProps) {
  const formatDate = (dateString: string) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 py-3 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">ScreenAssist</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm font-semibold text-gray-800">
              {isToday ? 'Today' : formatDate(date)}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-600">
              {gameCount} game{gameCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          NBA Schedule
        </div>
      </div>
    </div>
  );
}
