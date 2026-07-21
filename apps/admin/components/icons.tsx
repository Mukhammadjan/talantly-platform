const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M15.5 5.2a3.5 3.5 0 0 1 0 5.6M17.8 14.9c1.9.8 3 2.4 3 4.6" />
    </svg>
  );
}

export function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  );
}

export function IconBuilding() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M4.5 20.5V5.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v15" />
      <path d="M15.5 9.5h2a2 2 0 0 1 2 2v9" />
      <path d="M3 20.5h18" />
      <path d="M8 7.5h4M8 11h4M8 14.5h4" />
    </svg>
  );
}

export function IconInbox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M3.5 13.5 6 5.8A2 2 0 0 1 7.9 4.5h8.2A2 2 0 0 1 18 5.8l2.5 7.7v4a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M3.5 13.5h5l1.2 2h4.6l1.2-2h5" />
    </svg>
  );
}

export function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </svg>
  );
}

export function IconMatch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M10.5 13.5a4.5 4.5 0 0 0 6.4.4l3-3a4.5 4.5 0 1 0-6.4-6.4l-1.6 1.6" />
      <path d="M13.5 10.5a4.5 4.5 0 0 0-6.4-.4l-3 3a4.5 4.5 0 1 0 6.4 6.4l1.6-1.6" />
    </svg>
  );
}

export function IconQuestion() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.3a2.5 2.5 0 1 1 3.4 2.4c-.8.3-.9 1-1 1.8" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

export function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 4v14.5a1.5 1.5 0 0 0 1.5 1.5H20" />
      <path d="M8.5 15.5v-4M13 15.5V7.5M17.5 15.5v-6" />
    </svg>
  );
}

export function IconCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 9.5h18M6.5 14.5h4" />
    </svg>
  );
}

export function IconFlag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M5 21V4" />
      <path d="M5 4.5c3-1.5 6 1.5 9 0v8c-3 1.5-6-1.5-9 0" />
    </svg>
  );
}

export function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" />
    </svg>
  );
}

export function IconHistory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8" />
      <path d="M3.5 4v4h4M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconUserList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <circle cx="7.5" cy="8" r="3" />
      <path d="M3 19c0-2.5 2-4.5 4.5-4.5S12 16.5 12 19" />
      <path d="M15.5 8.5h5M15.5 13h5M15.5 17.5h5" />
    </svg>
  );
}

export function IconQueue() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 6.5h11M4 12h11M4 17.5h6" />
      <path d="M17.5 16l1.5 1.5 3-3" />
    </svg>
  );
}

export function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.4 7 8.5 4.1-1.1 7-4.3 7-8.5V6z" />
      <path d="M9.3 12l1.9 1.9 3.5-3.6" />
    </svg>
  );
}
