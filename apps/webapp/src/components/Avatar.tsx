import styles from "./Avatar.module.css";

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
  blurred?: boolean;
}

/** Real foto bo'lsa o'shani; bo'lmasa harf-tile (gradient — yagona istisno).
 *  Mehmon uchun blur. AI yuz / stock YO'Q. */
export function Avatar({
  name,
  photoUrl,
  size = 48,
  blurred = false,
}: AvatarProps): JSX.Element {
  const letter = (name.trim()[0] ?? "T").toUpperCase();
  const dim = { width: size, height: size };

  if (photoUrl && !blurred) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={styles.photo}
        style={dim}
        aria-hidden="true"
      />
    );
  }
  return (
    <span
      className={`${styles.tile} ${blurred ? styles.blurred : ""}`}
      style={{ ...dim, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}
