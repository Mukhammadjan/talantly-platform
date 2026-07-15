import type { ReactNode } from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

/** Kontekst sarlavhasi — ilova nomi YO'Q (Telegram header'da bor).
 *  Orqaga tugmasi chizilmaydi — tg.BackButton ishlatiladi (useBackButton). */
export function Header({ title, subtitle, right }: HeaderProps): JSX.Element {
  return (
    <header className={styles.header}>
      <div className={styles.texts}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.sub}>{subtitle}</p> : null}
      </div>
      {right ? <div className={styles.right}>{right}</div> : null}
    </header>
  );
}
