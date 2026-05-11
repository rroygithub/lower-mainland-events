import { SkeletonCard } from "@/components/skeleton-card";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-3">
        <div className="h-12 w-72 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-6 w-full max-w-2xl animate-pulse rounded-2xl bg-slate-100" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
