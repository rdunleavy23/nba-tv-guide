'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Open Settings</span>
              <kbd className="px-2 py-1 text-xs bg-muted rounded">⌘,</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Navigate Down</span>
              <kbd className="px-2 py-1 text-xs bg-muted rounded">j</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Navigate Up</span>
              <kbd className="px-2 py-1 text-xs bg-muted rounded">k</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Show Shortcuts</span>
              <kbd className="px-2 py-1 text-xs bg-muted rounded">?</kbd>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
