import { WebFooter } from "@/components/web/WebFooter";
import { WebHeader } from "@/components/web/WebHeader";
import type { ReactNode } from "react";
import styles from "./web.module.css";

// Keng desktop web qobig'i — ochiq (guest) tajriba. Telegram konteyneri emas.
export default function WebShellLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className={styles.web}>
      <WebHeader />
      {children}
      <WebFooter />
    </div>
  );
}
