export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-6 w-3/4 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded-xl bg-slate-100" />
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
