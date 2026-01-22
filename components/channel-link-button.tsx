'use client';

import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StreamingOption } from '@/lib/streaming-types';

interface ChannelLinkButtonProps {
  option: StreamingOption;
  className?: string;
}

/**
 * Get normalized display label for channel chips
 * Maps all channel variants to short, consistent labels
 */
function getChannelDisplayLabel(option: StreamingOption): string {
  const displayLabels: Record<string, string> = {
    // League Pass variants
    'LP': 'LP',
    'League Pass': 'LP',
    // NBA TV
    'NBA TV': 'NBA TV',
    // Networks
    'ESPN': 'ESPN',
    'ABC': 'ABC',
    'NBC': 'NBC',
    // OTT
    'Peacock': 'Peacock',
    'Prime': 'Prime',
    // Fallback
    'TV info TBD': 'TBD',
  };
  
  // Check by label first, then by id as fallback
  return displayLabels[option.label] || displayLabels[option.id] || option.label.substring(0, 8);
}

export function ChannelLinkButton({ option, className = '' }: ChannelLinkButtonProps) {
  const displayLabel = getChannelDisplayLabel(option);
  const ariaLabel = `Open ${displayLabel} in external app`;
  const openInNewTab = option.openInNewTab ?? false; // Default to false for deep links
  
  return (
    <a
      href={option.links.web}
      {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 h-10 min-w-[88px] px-3",
        "border border-border/20 bg-muted/30 hover:bg-muted/50",
        "text-xs font-medium text-foreground/90 rounded-md",
        "whitespace-nowrap transition-all active:scale-95",
        "touch-manipulation", // Improves touch responsiveness
        className
      )}
    >
      <span className="text-xs whitespace-nowrap">{displayLabel}</span>
      <ArrowUpRight className="h-3 w-3 opacity-50 shrink-0" aria-hidden="true" />
    </a>
  );
}

