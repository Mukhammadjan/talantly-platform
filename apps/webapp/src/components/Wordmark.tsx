import Image from "next/image";

const WORDMARK_RATIO = 1002 / 243;
const MARK_RATIO = 888 / 831;

/**
 * The official talantly wordmark (orange mark + type). Founder-supplied SVG in
 * public/assets/brand — never redraw it. `tone="light"` renders white type for
 * dark surfaces; default renders dark type for light surfaces.
 */
export function Wordmark({
  height = 40,
  tone = "dark",
  className = "",
}: {
  height?: number;
  tone?: "dark" | "light";
  className?: string;
}): JSX.Element {
  const src =
    tone === "light"
      ? "/assets/brand/talantly-wordmark-light.svg"
      : "/assets/brand/talantly-wordmark-dark.svg";
  return (
    <Image
      src={src}
      alt="talantly"
      width={Math.round(height * WORDMARK_RATIO)}
      height={height}
      priority
      unoptimized
      className={className}
    />
  );
}

/** The standalone orange talantly mark (icon), for tight/square placements. */
export function Mark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}): JSX.Element {
  return (
    <Image
      src="/assets/brand/talantly-mark.svg"
      alt=""
      width={Math.round(size * MARK_RATIO)}
      height={size}
      unoptimized
      aria-hidden
      className={className}
    />
  );
}
