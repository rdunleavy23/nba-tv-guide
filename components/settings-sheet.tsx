'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { getClientRegionOverride, setClientRegionOverride } from '@/lib/region';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * SettingsSheet component - client component for ZIP override
 * Uses shadcn Dialog for production-quality modal
 */
export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const [zipCode, setZipCode] = useState('');
  const [saved, setSaved] = useState(false);

  // Load current ZIP override on mount
  useEffect(() => {
    const currentZip = getClientRegionOverride();
    if (currentZip) {
      setZipCode(currentZip);
    }
  }, []);

  // Handle ZIP code change with auto-save
  const handleZipChange = async (value: string) => {
    setZipCode(value);
    
    // Validate ZIP code (basic 5-digit check)
    if (value && /^\d{5}$/.test(value)) {
      setClientRegionOverride(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else if (value === '') {
      // Clear override
      setClientRegionOverride('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <div className="flex items-center gap-2">
              <Input
                id="zip"
                type="text"
                value={zipCode}
                onChange={(e) => handleZipChange(e.target.value)}
                placeholder="90210"
                maxLength={5}
                className="font-mono"
                pattern="\d{5}"
              />
              {saved && <Check className="h-4 w-4 text-green-500" />}
            </div>
            <p className="text-xs text-muted-foreground">
              For accurate blackout detection
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
