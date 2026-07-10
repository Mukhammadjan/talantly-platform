export default function Loading() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex items-baseline justify-between">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-4 w-24" />
      </div>
      <div className="mb-5 flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-10 w-32" />
        ))}
      </div>
      <div className="card p-4 shadow-soft">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <div className="skeleton h-5 w-1/4" />
            <div className="skeleton h-5 w-16" />
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-5 w-1/5" />
            <div className="skeleton h-5 w-20" />
            <div className="skeleton h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
