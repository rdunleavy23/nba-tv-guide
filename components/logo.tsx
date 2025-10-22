interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Screen icon */}
      <div className="relative">
        <div className="w-6 h-4 bg-primary rounded-sm flex items-center justify-center">
          <div className="w-3 h-2 bg-primary-foreground rounded-sm opacity-80"></div>
        </div>
        {/* Signal bars */}
        <div className="absolute -right-1 top-0 flex flex-col gap-0.5">
          <div className="w-0.5 h-1 bg-primary"></div>
          <div className="w-0.5 h-1.5 bg-primary"></div>
          <div className="w-0.5 h-1 bg-primary"></div>
        </div>
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight">Screen</span>
        <span className="text-sm font-medium text-muted-foreground -mt-1">Assist</span>
      </div>
    </div>
  );
}
