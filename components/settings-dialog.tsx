'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTimeZone, getTimeZoneLabel } from '@/components/timezone-provider';
import { useTheme } from 'next-themes';
import { Monitor, Sun, Moon } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateMode } = useTimeZone();
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Setting */}
          <div className="space-y-2">
            <Label>Appearance</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 px-3 py-3 rounded-md border transition-colors ${
                  theme === 'light'
                    ? 'border-primary bg-accent'
                    : 'border-muted hover:bg-accent/50'
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-xs font-medium">Light</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 px-3 py-3 rounded-md border transition-colors ${
                  theme === 'dark'
                    ? 'border-primary bg-accent'
                    : 'border-muted hover:bg-accent/50'
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-xs font-medium">Dark</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center gap-2 px-3 py-3 rounded-md border transition-colors ${
                  theme === 'system'
                    ? 'border-primary bg-accent'
                    : 'border-muted hover:bg-accent/50'
                }`}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-xs font-medium">System</span>
              </button>
            </div>
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
