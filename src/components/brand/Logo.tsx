import { cn } from "@/lib/utils";

export function Logo({
  className,
  withWordmark = true,
  size = 28,
}: {
  className?: string;
  withWordmark?: boolean;
  size?: number;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Hostiq logo"
      >
        <defs>
          <linearGradient id="hostiq-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="oklch(0.72 0.17 162)" />
            <stop offset="1" stopColor="oklch(0.82 0.15 168)" />
          </linearGradient>
        </defs>
        <path
          d="M16 2L28 7v9c0 7-5.2 12.5-12 14C9.2 28.5 4 23 4 16V7l12-5z"
          fill="url(#hostiq-grad)"
        />
        <path
          d="M11 10v12M21 10v12M11 16h10"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark && (
        <span className="text-lg font-semibold tracking-tight">
          Host<span className="text-primary">iq</span>
        </span>
      )}
    </div>
  );
}
