export function ProgressBar({ value }: { value: number }): JSX.Element {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div
        className="h-full rounded-full bg-orange transition-all duration-300 ease-out"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
