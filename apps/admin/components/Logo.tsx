export function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="inline-flex items-center justify-center rounded-[10px] bg-orange font-bold text-white"
        style={{ width: size, height: size, fontSize: size * 0.55 }}
      >
        t
      </span>
      <span className="text-[18px] font-bold tracking-tight text-ink">
        talantly
        <span className="text-orange">.</span>
      </span>
    </span>
  );
}
