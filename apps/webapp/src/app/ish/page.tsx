"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DIRECTION_LABELS_UZ, type Direction } from "@talantly/shared";
import { BottomNav, Screen, TopHeader } from "@/components/recruiter/Nav";
import { CandidateCard } from "@/components/recruiter/CandidateCard";
import { Chip } from "@/components/recruiter/ui";
import { Icon } from "@/components/recruiter/icons";
import { apiFetch, authenticate, isInsideTelegram } from "@/lib/api";
import type { FeedResponse } from "@/lib/apiTypes";
import { cardToCandidate } from "@/lib/recruiter/adapt";
import type { Candidate } from "@/lib/recruiter/data";
import { initTelegramUi } from "@/lib/telegram";

const DIRECTION_FILTERS = (
  Object.keys(DIRECTION_LABELS_UZ) as Direction[]
).map((value) => ({ value, label: DIRECTION_LABELS_UZ[value] }));

export default function FeedPage(): JSX.Element {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Direction | null>(null);

  useEffect(() => {
    initTelegramUi();
    if (!isInsideTelegram()) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    authenticate()
      .then(() => apiFetch<FeedResponse>("/api/feed"))
      .then((feed) => {
        if (cancelled) return;
        // No company profile yet → finish izlovchi onboarding first.
        if (!feed.company) {
          router.replace("/izlovchi");
          return;
        }
        setCandidates(feed.talents.map(cardToCandidate));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const list = useMemo(() => {
    if (!candidates) return [];
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q));
      const matchF = !filter || c.role === DIRECTION_LABELS_UZ[filter];
      return matchQ && matchF;
    });
  }, [candidates, query, filter]);

  return (
    <>
      <Screen>
        <TopHeader title="Nomzodlar" subtitle="Tekshirilgan talantlar" bell />

        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 rounded-input border border-line bg-surface px-3.5 py-3">
            <Icon name="search" size={20} className="text-dim" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ism, kasb yoki ko'nikma"
              className="w-full bg-transparent text-[15px] text-text outline-none placeholder:text-dim"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Tozalash"
                className="text-dim"
              >
                <Icon name="close" size={18} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto px-4">
          <Chip
            label="Barchasi"
            active={filter === null}
            onClick={() => setFilter(null)}
          />
          {DIRECTION_FILTERS.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              active={filter === f.value}
              onClick={() => setFilter(f.value)}
            />
          ))}
        </div>

        {failed ? (
          <div className="mx-4 mt-6 rounded-card border border-line bg-surface py-12 text-center">
            <p className="text-[15px] font-medium text-text">
              Ma&apos;lumotlarni yuklab bo&apos;lmadi
            </p>
            <p className="mt-1 text-[13px] text-muted">
              Ilovani yopib, qayta oching.
            </p>
          </div>
        ) : !candidates ? (
          <div className="mt-3 space-y-3 px-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="skeleton h-32 w-full rounded-card"
                aria-hidden
              />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-3 flex items-center justify-between px-4">
              <span className="text-[13px] text-muted">
                {list.length} ta nomzod topildi
              </span>
            </div>
            <div className="mt-2 space-y-3 px-4">
              {list.map((c) => (
                <CandidateCard key={c.id} c={c} />
              ))}
              {list.length === 0 ? (
                <div className="rounded-card border border-line bg-surface py-12 text-center">
                  <p className="text-[15px] font-medium text-text">
                    Hech narsa topilmadi
                  </p>
                  <p className="mt-1 text-[13px] text-muted">
                    Boshqa so&apos;z bilan qidirib ko&apos;ring
                  </p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </Screen>
      <BottomNav />
    </>
  );
}
