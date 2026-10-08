type P = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const XIcon = ({ size = 28 }: P) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const CheckIcon = ({ size = 30 }: P) => (
  <svg {...base(size)}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

export const UndoIcon = ({ size = 22 }: P) => (
  <svg {...base(size)} strokeWidth={2.2}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 010 11H11" />
  </svg>
);

export const HeartIcon = ({ size = 22, filled = false }: P & { filled?: boolean }) => (
  <svg {...base(size)} strokeWidth={2.2} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.6a4.3 4.3 0 017.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
  </svg>
);

export const ClockIcon = ({ size = 22 }: P) => (
  <svg {...base(size)} strokeWidth={2.2}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const InfoIcon = ({ size = 22 }: P) => (
  <svg {...base(size)} strokeWidth={2.2}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const DiceIcon = ({ size = 24 }: P) => (
  <svg {...base(size)} strokeWidth={2.2}>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <circle cx="9" cy="9" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="15" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="9" cy="15" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const PinIcon = ({ size = 20 }: P) => (
  <svg {...base(size)} strokeWidth={2.2}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);

export const BookIcon = ({ size = 20 }: P) => (
  <svg {...base(size)} strokeWidth={2.2}>
    <path d="M5 4.5h9.5a3 3 0 013 3V20H8a3 3 0 01-3-3z" />
    <path d="M5 17a3 3 0 013-3h9.5" />
  </svg>
);

export const ShareIcon = ({ size = 20 }: P) => (
  <svg {...base(size)} strokeWidth={2.2}>
    <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5" />
    <path d="M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" />
  </svg>
);
