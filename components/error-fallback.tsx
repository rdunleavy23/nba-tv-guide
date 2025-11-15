'use client';

export function ErrorFallback() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="p-8 text-center">
      <p className="text-sm text-muted-foreground mb-2">
        Can&apos;t reach ESPN right now.
      </p>
      <button
        onClick={handleReload}
        className="text-sm text-primary underline-offset-4 hover:underline cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
