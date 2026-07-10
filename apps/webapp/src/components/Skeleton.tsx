export function Skeleton({
  className = "",
}: {
  className?: string;
}): JSX.Element {
  return <div className={`skeleton rounded-input ${className}`} />;
}
