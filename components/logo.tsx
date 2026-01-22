interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={className}>
      <span className="text-lg font-bold italic text-foreground">
        ScreenAssist
      </span>
    </div>
  );
}
