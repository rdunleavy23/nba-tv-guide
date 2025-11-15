interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={className}>
      <span className="text-xl font-bold italic text-foreground dark:text-white">
        ScreenAssist
      </span>
    </div>
  );
}
