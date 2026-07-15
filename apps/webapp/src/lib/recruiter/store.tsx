"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CONVERSATIONS, type ChatMessage } from "./data";

interface PersistState {
  subscribed: boolean;
  unlocked: string[];
  saved: string[];
  sent: string[];
  requested: string[];
  threads: Record<string, ChatMessage[]>;
  readNotifs: string[];
}

const STORAGE_KEY = "talantly.recruiter.v1";

const seedThreads = (): Record<string, ChatMessage[]> => {
  const t: Record<string, ChatMessage[]> = {};
  for (const c of CONVERSATIONS) t[c.candidateId] = [...c.messages];
  return t;
};

const initial: PersistState = {
  subscribed: false,
  unlocked: [],
  saved: [],
  sent: ["jasur"],
  requested: [],
  threads: seedThreads(),
  readNotifs: [],
};

interface Store extends PersistState {
  isUnlocked: (id: string) => boolean;
  unlock: (id: string) => void;
  subscribe: () => void;
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  markSent: (id: string) => void;
  markRequested: (id: string) => void;
  isRequested: (id: string) => boolean;
  sendMessage: (candidateId: string, text: string) => void;
  markNotifRead: (id: string) => void;
  isNotifRead: (id: string) => boolean;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function RecruiterProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<PersistState>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initial, ...(JSON.parse(raw) as PersistState) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state, hydrated]);

  const isUnlocked = useCallback(
    (id: string) => state.subscribed || state.unlocked.includes(id),
    [state.subscribed, state.unlocked],
  );

  const unlock = useCallback((id: string) => {
    setState((s) =>
      s.unlocked.includes(id) ? s : { ...s, unlocked: [...s.unlocked, id] },
    );
  }, []);

  const subscribe = useCallback(() => {
    setState((s) => ({ ...s, subscribed: true }));
  }, []);

  const toggleSave = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      saved: s.saved.includes(id)
        ? s.saved.filter((x) => x !== id)
        : [...s.saved, id],
    }));
  }, []);

  const markSent = useCallback((id: string) => {
    setState((s) =>
      s.sent.includes(id) ? s : { ...s, sent: [...s.sent, id] },
    );
  }, []);

  const markRequested = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      requested: s.requested.includes(id) ? s.requested : [...s.requested, id],
      sent: s.sent.includes(id) ? s.sent : [...s.sent, id],
    }));
  }, []);

  const sendMessage = useCallback((candidateId: string, text: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    const msg: ChatMessage = {
      id: `me-${now.getTime()}`,
      from: "me",
      text,
      time,
    };
    setState((s) => ({
      ...s,
      threads: {
        ...s.threads,
        [candidateId]: [...(s.threads[candidateId] ?? []), msg],
      },
    }));
  }, []);

  const markNotifRead = useCallback((id: string) => {
    setState((s) =>
      s.readNotifs.includes(id)
        ? s
        : { ...s, readNotifs: [...s.readNotifs, id] },
    );
  }, []);

  const reset = useCallback(() => setState(initial), []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      isUnlocked,
      unlock,
      subscribe,
      toggleSave,
      isSaved: (id) => state.saved.includes(id),
      markSent,
      markRequested,
      isRequested: (id) => state.requested.includes(id) || state.sent.includes(id),
      sendMessage,
      markNotifRead,
      isNotifRead: (id) => state.readNotifs.includes(id),
      reset,
    }),
    [
      state,
      isUnlocked,
      unlock,
      subscribe,
      toggleSave,
      markSent,
      markRequested,
      sendMessage,
      markNotifRead,
      reset,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRecruiter(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRecruiter must be used within RecruiterProvider");
  return ctx;
}
