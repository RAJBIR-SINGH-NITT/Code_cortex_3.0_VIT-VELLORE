const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function LogoMark({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 1.8l8.2 3.05v6.1c0 5.36-3.48 9.94-8.2 11.25C7.28 20.89 3.8 16.31 3.8 10.95v-6.1L12 1.8z"
      />
      <path
        d="M12 1.8l8.2 3.05v6.1c0 5.36-3.48 9.94-8.2 11.25V1.8z"
        fill="rgba(255,255,255,0.14)"
      />
      <path
        d="M8.4 12.1l2.4 2.4 4.8-5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconShieldCheck({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l7 2.7v5.5c0 4.6-3 8.7-7 9.9-4-1.2-7-5.3-7-9.9V5.7L12 3z" />
      <path d="M9 11.9l2.1 2.1 3.9-4.2" />
    </svg>
  );
}

export function IconBug({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3 3 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

export function IconSearch({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.6 16.6 21 21" />
      <path d="M9.4 9.3a1.7 1.7 0 0 1 3.3.5c0 1.1-1.6 1.3-1.6 2.3" />
      <path d="M11.1 14.6h.01" />
    </svg>
  );
}

export function IconCheck({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconX({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function IconClock({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconServer({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01" />
      <path d="M7 16.5h.01" />
    </svg>
  );
}

export function IconDatabase({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5v13c0 1.66 3.58 3 8 3s8-1.34 8-3v-13" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
    </svg>
  );
}

export function IconChip({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </svg>
  );
}

export function IconChevronDown({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconChevronRight({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function IconArrowRight({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 12h16" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

export function IconRefresh({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export function IconInfo({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function IconAlert({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 4.2 2.9 19.4a1 1 0 0 0 .86 1.6h16.48a1 1 0 0 0 .86-1.6L12 4.2z" />
      <path d="M12 10v4.5" />
      <path d="M12 17.8h.01" />
    </svg>
  );
}

export function IconFileSearch({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
      <path d="M14 3v5h5" />
      <circle cx="11" cy="13.5" r="2.5" />
      <path d="M13 15.5l2 2" />
    </svg>
  );
}

export function IconActivity({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />
    </svg>
  );
}

export function IconUpload({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 15V4" />
      <path d="M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function IconFile({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M13 3v5h5" />
    </svg>
  );
}

export function IconTrash({ className = "w-5 h-5" }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export function IconSpinner({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
