'use client';

import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StreamingOption } from '@/lib/streaming-types';

interface ChannelLinkButtonProps {
  option: StreamingOption;
  className?: string;
}

/**
 * Normalize channel labels to short, consistent forms
 */
function getShortLabel(label: string): string {
  const shortLabels: Record<string, string> = {
    'League Pass': 'LP',
    'NBA TV': 'NBA TV',
    'ESPN': 'ESPN',
    'ABC': 'ABC',
    'NBC': 'NBC',
    'Peacock': 'Peacock',
    'Prime': 'Prime',
    'TV info TBD': 'TBD',
  };
  return shortLabels[label] || label.substring(0, 8); // Fallback to first 8 chars
}

export function ChannelLinkButton({ option, className = '' }: ChannelLinkButtonProps) {
  const ariaLabel = `Open ${option.label} in external app (opens externally)`;
  const openInNewTab = option.openInNewTab ?? false; // Default to false for deep links
  
  return (
    <a
      href={option.links.web}
      {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-2 px-2.5 h-9 min-h-10 w-[80px]",
        "border border-border/40 bg-transparent hover:bg-muted/10",
        "text-xs font-normal text-foreground/80 rounded-md",
        "transition-colors",
        className
      )}
    >
      <span className="text-xs truncate">{getShortLabel(option.label)}</span>
      <ArrowUpRight className="h-3.5 w-3.5 opacity-60 shrink-0" aria-hidden="true" />
    </a>
  );
}

