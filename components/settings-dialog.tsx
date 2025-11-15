'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getClientRegionOverride, setClientRegionOverride } from '@/lib/region';
import { useTimeZone, getTimeZoneLabel } from '@/components/timezone-provider';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [zip, setZip] = useState('');
  const [zipSaved, setZipSaved] = useState(false);
  const { settings, updateMode } = useTimeZone();

  // Load current ZIP override on mount
  useEffect(() => {
    const currentZip = getClientRegionOverride();
    if (currentZip) {
      setZip(currentZip);
    }
  }, []);

  // Handle ZIP code change with auto-save
  const handleZipChange = async (value: string) => {
    setZip(value);
    setZipSaved(false);

    // Validate ZIP code (basic 5-digit check)
    if (value && /^\d{5}$/.test(value)) {
      setClientRegionOverride(value);
      setZipSaved(true);
      // Clear saved indicator after 2 seconds
      setTimeout(() => setZipSaved(false), 2000);
    } else if (value === '') {
      // Clear override
      setClientRegionOverride('');
    }
  };

  const handleClearZip = () => {
    setZip('');
    setClientRegionOverride('');
    setZipSaved(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* ZIP Code Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="zip">ZIP Code</Label>
              {zip && (
                <button
                  onClick={handleClearZip}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="zip"
                value={zip}
                onChange={(e) => handleZipChange(e.target.value)}
                placeholder="90210"
                maxLength={5}
                className="font-mono pr-8"
              />
              {zipSaved && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-xs">
                  ✓
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              For accurate League Pass blackout detection
            </p>
          </div>

          {/* Timezone Setting */}
          <div className="space-y-2">
            <Label>Time Display</Label>
            <div className="space-y-2">
              <button
                onClick={() => updateMode('et')}
                className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                  settings.mode === 'et'
                    ? 'border-primary bg-accent'
                    : 'border-muted hover:bg-accent/50'
                }`}
              >
                <div className="font-medium text-sm">Eastern Time</div>
                <div className="text-xs text-muted-foreground">
                  Standard for NBA schedule
                </div>
              </button>
              <button
                onClick={() => updateMode('local')}
                className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                  settings.mode === 'local'
                    ? 'border-primary bg-accent'
                    : 'border-muted hover:bg-accent/50'
                }`}
              >
                <div className="font-medium text-sm">Local Time</div>
                <div className="text-xs text-muted-foreground">
                  {settings.localZone
                    ? settings.localZone.split('/').pop()?.replace(/_/g, ' ')
                    : 'Auto-detected'}
                </div>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {getTimeZoneLabel(settings)}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
