import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: EmptyStateProps): JSX.Element {
  return (
    <div className={styles.wrap}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <p className={styles.title}>{title}</p>
      {text ? <p className={styles.text}>{text}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
