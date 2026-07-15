import type { ReactNode } from "react";
import styles from "./Badge.module.css";

interface BadgeProps {
  children: ReactNode;
  variant?: "verified" | "neutral" | "action" | "danger";
  icon?: ReactNode;
}

/** r8, kichik yorliq. Yashil faqat tekshirilgan holat uchun. */
export function Badge({
  children,
  variant = "neutral",
  icon,
}: BadgeProps): JSX.Element {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
}
