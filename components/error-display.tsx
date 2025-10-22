'use client';

export function ErrorDisplay() {
  return (
    <div className="p-8 text-center">
      <p className="text-sm text-muted-foreground mb-2">
        Couldn&apos;t load games.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Retry
      </button>
    </div>
  );
}
