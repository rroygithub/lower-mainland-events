import { SkeletonCard } from "@/components/skeleton-card";

export default function EventsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="h-12 w-64 animate-pulse rounded-2xl bg-slate-200" />
      <div className="h-20 animate-pulse rounded-3xl border border-slate-200 bg-white" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
