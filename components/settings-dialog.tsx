'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTimeZone, getTimeZoneLabel } from '@/components/timezone-provider';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateMode } = useTimeZone();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
