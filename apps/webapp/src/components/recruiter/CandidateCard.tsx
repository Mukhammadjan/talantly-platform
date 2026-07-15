"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import { Avatar, ScoreBadge, SkillTag, VerifiedSeal } from "./ui";
import { usePayment } from "./PaymentSheet";
import { useRecruiter } from "@/lib/recruiter/store";
import type { Candidate } from "@/lib/recruiter/data";

export function CandidateCard({ c }: { c: Candidate }): JSX.Element {
  const router = useRouter();
  const { isUnlocked, isSaved, toggleSave } = useRecruiter();
  const { open } = usePayment();
  const locked = c.premium && !isUnlocked(c.id);
  const saved = isSaved(c.id);

  const go = (): void => {
    if (locked) open(c.id);
    else router.push(`/ish/nomzod/${c.id}`);
  };

  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-surface p-4">
      <button type="button" onClick={go} className="block w-full text-left">
        <div className="flex items-start gap-3">
          <Avatar name={c.name} tone={c.tone} blurred={locked} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={`truncate text-[16px] font-semibold text-text ${
                  locked ? "select-none blur-[5px]" : ""
                }`}
              >
                {locked ? "Ismi berkitilgan" : c.name}
              </h3>
            </div>
            <p className="mt-0.5 text-[13.5px] text-muted">
              {c.role} · {c.archetype}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-dim">
              <Icon name="pin" size={13} />
              {c.district}
            </div>
          </div>
          <ScoreBadge score={c.score} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.skills.map((s) => (
            <SkillTag key={s} label={s} />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          {c.verified ? <VerifiedSeal compact /> : <span />}
          <span className="text-[13px] font-medium text-orange">
            {locked ? "Ochish uchun bosing" : "Profilni ochish"}
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => toggleSave(c.id)}
        aria-label={saved ? "Saqlanganlardan olib tashlash" : "Saqlash"}
        className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full ${
          saved ? "text-orange" : "text-dim"
        } active:bg-surface2`}
      >
        <Icon name="bookmark" size={18} />
      </button>

      {locked ? (
        <button
          type="button"
          onClick={go}
          className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-surface/60 to-transparent pb-4"
        >
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-text px-3.5 py-2 text-[13px] font-semibold text-white">
            <Icon name="lock" size={15} />
            Premium nomzod
          </span>
        </button>
      ) : null}
    </div>
  );
}
