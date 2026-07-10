import {
  ARCHETYPE_META,
  DIRECTION_LABELS_UZ,
  LEVEL_LABELS_UZ,
} from "@talantly/shared";
import type { PublicTalentCard } from "@/lib/server/publicData";
import { BOT_START_IZLOVCHI } from "@/lib/links";
import { Seal } from "./Seal";

export function TalentCard({
  talent,
  withCta = false,
}: {
  talent: PublicTalentCard;
  withCta?: boolean;
}): JSX.Element {
  const archetype = talent.archetypeCode
    ? ARCHETYPE_META[talent.archetypeCode]
    : null;
  const extraTags = talent.skillTags.length - 3;
  return (
    <article className="flex flex-col rounded-card border border-line bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-3">
        {talent.photoUrl ? (
          <img
            src={talent.photoUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange text-[17px] font-bold text-white">
            {talent.displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[15px] font-bold text-ink">
            <span className="truncate">{talent.displayName}</span>
            <Seal size={16} className="shrink-0" />
          </p>
          <p className="truncate text-[12px] text-ink-soft">
            {[
              talent.direction ? DIRECTION_LABELS_UZ[talent.direction] : null,
              talent.city,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {talent.level && (
          <span className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
            {talent.level === "intern" ? "🌱" : "💼"}{" "}
            {LEVEL_LABELS_UZ[talent.level]}
          </span>
        )}
      </div>

      {talent.headline && (
        <p className="mt-2.5 text-[13px] italic leading-relaxed text-ink-soft">
          &quot;{talent.headline}&quot;
        </p>
      )}

      {(archetype || talent.skillTags.length > 0) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {archetype && (
            <span className="rounded-full bg-orange-tint px-2.5 py-1 text-[11px] font-semibold text-orange-deep">
              {archetype.emoji} {talent.archetypeLabel ?? archetype.label}
            </span>
          )}
          {talent.skillTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
              +{extraTags}
            </span>
          )}
        </div>
      )}

      <div className="min-h-3 flex-1" />
      <div className="flex items-center gap-2 border-t border-line pt-3">
        {talent.score !== null && (
          <span className="rounded-full bg-green-tint px-2.5 py-1 text-[12px] font-bold text-green-deep">
            {talent.score} ball
          </span>
        )}
        {talent.rating !== null && (
          <span className="text-[12px] font-semibold text-orange">
            {"★".repeat(talent.rating)}
            <span className="text-line">{"★".repeat(5 - talent.rating)}</span>
          </span>
        )}
        {withCta && (
          <a
            href={BOT_START_IZLOVCHI}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto rounded-full bg-orange px-4 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-orange-deep active:scale-95"
          >
            Telegramda so&apos;rash
          </a>
        )}
      </div>
    </article>
  );
}
