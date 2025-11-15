'use client';

import { useTimeZone } from '@/components/timezone-provider';
import { formatGameTime } from '@/lib/timezone';

interface GameTimeProps {
  utcTime: string;
  className?: string;
}

/**
 * GameTime - Client component that formats game time according to user's timezone preference
 *
 * Uses TimeZoneProvider context to respect user's choice of ET vs local time
 */
export function GameTime({ utcTime, className = '' }: GameTimeProps) {
  const { settings } = useTimeZone();

  const timeString = formatGameTime(utcTime, settings.displayZone, true);

  return (
    <time className={className} dateTime={utcTime}>
      {timeString}
    </time>
  );
}
