import type { ReactNode } from "react";

// HugeIcons uslubida — stroke rounded, 1.5px, currentColor. fill YO'Q.
export type IconName =
  | "back"
  | "close"
  | "search"
  | "filter"
  | "chevron"
  | "check"
  | "user"
  | "users"
  | "briefcase"
  | "star"
  | "pin"
  | "bookmark"
  | "lock"
  | "send"
  | "chat"
  | "bell"
  | "map"
  | "board"
  | "grid"
  | "home"
  | "doc"
  | "plus"
  | "calendar"
  | "edit"
  | "camera"
  | "sparkle"
  | "phone"
  | "download"
  | "info";

const PATHS: Record<IconName, ReactNode> = {
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  chevron: <path d="M9 5l7 7-7 7" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3.5 3.5 0 0 1 0 6.8M17 19a5.5 5.5 0 0 0-2.5-4.6" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 12.5h18" />
    </>
  ),
  star: (
    <path d="M12 4.5l2.35 4.76 5.25.77-3.8 3.7.9 5.23L12 16.68 7.3 18.96l.9-5.23-3.8-3.7 5.25-.77z" />
  ),
  pin: (
    <>
      <path d="M12 21c4-3.5 7-6.7 7-10a7 7 0 1 0-14 0c0 3.3 3 6.5 7 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </>
  ),
  bookmark: <path d="M6 4.5h12v15l-6-3.8-6 3.8z" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  send: <path d="M20 4L3.5 11l6.5 2.2M20 4l-6 16-3.5-6.8M20 4L10 13.2" />,
  chat: (
    <path d="M20 12a7.5 7.5 0 0 1-10.6 6.8L4 20l1.2-4.1A7.5 7.5 0 1 1 20 12z" />
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </>
  ),
  map: (
    <>
      <path d="M9 4.5L4 6.5v13l5-2 6 2 5-2v-13l-5 2-6-2z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </>
  ),
  board: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M9 4.5v15M15 4.5v15" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </>
  ),
  home: <path d="M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5" />,
  doc: (
    <>
      <path d="M6 3.5h7l5 5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M13 3.5V9h5M8.5 13h7M8.5 16.5h7" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16M8 3.5v4M16 3.5v4" />
    </>
  ),
  edit: <path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.5V20z" />,
  camera: (
    <>
      <path d="M4 8.5h3l1.5-2h7L17 8.5h3a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </>
  ),
  sparkle: (
    <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
  ),
  phone: (
    <path d="M6 4.5h3l1.5 4-2 1.5a10 10 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5C11 19.5 4.5 13 4.4 6.1A1.5 1.5 0 0 1 6 4.5z" />
  ),
  download: <path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
};

export function Icon({
  name,
  size = 24,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
