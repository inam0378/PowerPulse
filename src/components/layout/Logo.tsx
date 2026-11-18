import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pp-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00D4FF" /><stop offset=".55" stopColor="#3478FF" /><stop offset="1" stopColor="#625BFF" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#0B1226" stroke="url(#pp-g)" strokeWidth="1.5" />
      <path d="M5 17h5l2.5-6 4 11 3-8 1.8 3H27" fill="none" stroke="url(#pp-g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ name = "PowerPulse" }: { name?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg" aria-label={`${name} home`}>
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight">{name}</span>
    </Link>
  );
}
