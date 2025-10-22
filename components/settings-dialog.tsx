'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { getClientRegionOverride, setClientRegionOverride } from '@/lib/region';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [zip, setZip] = useState('');
  const [darkMode, setDarkMode] = useState(true);

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
    
    // Validate ZIP code (basic 5-digit check)
    if (value && /^\d{5}$/.test(value)) {
      setClientRegionOverride(value);
    } else if (value === '') {
      // Clear override
      setClientRegionOverride('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input 
              id="zip" 
              value={zip}
              onChange={(e) => handleZipChange(e.target.value)}
              placeholder="90210"
              maxLength={5}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              For accurate blackout detection
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Dark Mode</Label>
            <Switch 
              id="theme"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
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
