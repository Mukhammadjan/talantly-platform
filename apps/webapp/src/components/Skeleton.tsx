import type { CSSProperties } from "react";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}

export function Skeleton({
  width,
  height = 16,
  radius,
  className = "",
}: SkeletonProps): JSX.Element {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: radius,
  };
  return (
    <span
      className={`${styles.sk} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
