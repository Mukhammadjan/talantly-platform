import type { ReactNode } from "react";

// HugeIcons uslubi — stroke rounded 1.5px, 24 grid, izchil vizual og'irlik.
export type IconName =
  | "back"
  | "close"
  | "search"
  | "filter"
  | "chevron"
  | "arrow"
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
  | "info"
  | "swap"
  | "copy"
  | "settings"
  | "globe"
  | "logout";

const PATHS: Record<IconName, ReactNode> = {
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  close: <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-3.8-3.8" />
    </>
  ),
  filter: <path d="M5 6.5h14M8 12h8M11 17.5h2" />,
  chevron: <path d="M9.5 6 15.5 12l-6 6" />,
  arrow: <path d="M5 12h13m0 0-5.5-5.5M18 12l-5.5 5.5" />,
  check: <path d="M5.5 12.5 10 17 18.5 7.5" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 19.5a5.5 5.5 0 0 0-2-4.3" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
      <path d="M8.5 7.5V6.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1M3 13.5h18M10.5 13.5h3" />
    </>
  ),
  star: (
    <path d="M12 4.5l2.35 4.76 5.25.77-3.8 3.7.9 5.23L12 16.68l-4.7 2.28.9-5.23-3.8-3.7 5.25-.77z" />
  ),
  pin: (
    <>
      <path d="M12 21c4-3.5 7-6.7 7-10a7 7 0 1 0-14 0c0 3.3 3 6.5 7 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </>
  ),
  bookmark: <path d="M6.5 4.5h11a1 1 0 0 1 1 1v14l-6.5-4-6.5 4v-14a1 1 0 0 1 1-1z" />,
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" />
    </>
  ),
  send: <path d="M20.5 3.5 3 10.2l6.5 2.3 2.3 6.5z M20.5 3.5 9.5 12.5" />,
  chat: (
    <>
      <path d="M20 11.5a7.5 7.5 0 0 1-10.9 6.7L4.5 19.5l1.3-4.4A7.5 7.5 0 1 1 20 11.5z" />
      <path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 3.5 1.3 4.8 1.3 4.8H5.2S6.5 13.5 6.5 10z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </>
  ),
  map: (
    <>
      <path d="M9 4.5 4.5 6.3v13.2l4.5-1.8 6 1.8 4.5-1.8V4.5l-4.5 1.8z" />
      <path d="M9 4.5v13.2M15 6.3v13.2" />
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
      <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
    </>
  ),
  home: (
    <path d="M3.5 10.5 12 4l8.5 6.5M5.5 9.3V19a1 1 0 0 0 1 1H10v-4.5a2 2 0 0 1 4 0V20h3.5a1 1 0 0 0 1-1V9.3" />
  ),
  doc: (
    <>
      <path d="M6.5 3.5h6.5l4.5 4.5V19.5a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M13 3.5V8.5h4.5M8.5 13h7M8.5 16.5h4.5" />
    </>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16M8 3.5v4M16 3.5v4" />
    </>
  ),
  edit: (
    <path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2 4 20zM14.5 8 16.8 10.3" />
  ),
  camera: (
    <>
      <path d="M4 8.5h3l1.5-2h7l1.5 2h3a1 1 0 0 1 1 1V18.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </>
  ),
  sparkle: (
    <path d="M12 4l1.5 4.2 4.2 1.5-4.2 1.5L12 15.4l-1.5-4.2L6.3 9.7l4.2-1.5zM18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
  ),
  phone: (
    <path d="M6 4.5h3l1.5 4-2 1.5a10 10 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5C11 19.5 4.5 13 4.4 6.1A1.5 1.5 0 0 1 6 4.5z" />
  ),
  download: <path d="M12 4v10m0 0-4-4m4 4 4-4M5 18.5h14" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11.2v5M12 8h.01" />
    </>
  ),
  swap: <path d="M7 8h11m0 0-3-3m3 3-3 3M17 16H6m0 0 3-3m-3 3 3 3" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3 5.5 5.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.3 2.3 3.5 5.3 3.5 8.5s-1.2 6.2-3.5 8.5c-2.3-2.3-3.5-5.3-3.5-8.5S9.7 5.8 12 3.5z" />
    </>
  ),
  logout: <path d="M14 8.5V6a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5h6A1.5 1.5 0 0 0 14 18v-2.5M10 12h10m0 0-3-3m3 3-3 3" />,
};

export function Icon({
  name,
  size = 24,
  className,
  filled = false,
}: {
  name: IconName;
  size?: number;
  className?: string;
  /** Faol/urg'uli holat — qalinroq stroke (to'ldirilgan taassurot). */
  filled?: boolean;
}): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={filled ? 2.1 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
