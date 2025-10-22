'use client';

// Client component for settings trigger
export function SettingsTrigger() {
  return (
    <button
      onClick={() => {
        // This will be handled by ClientWrapper's keyboard listener
        const event = new KeyboardEvent('keydown', {
          key: ',',
          metaKey: true,
        });
        window.dispatchEvent(event);
      }}
      className="text-xs text-muted-foreground hover:text-foreground"
    >
      Settings
    </button>
  );
}
