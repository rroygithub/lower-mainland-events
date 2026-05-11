export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">Lower Mainland Indian Events</p>
          <p className="text-sm text-slate-600">
            Discover concerts, festivals, food nights, family programs, and community gatherings across Metro Vancouver.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          Built with Next.js, Supabase, and a mobile-first editorial event experience.
        </div>
      </div>
    </footer>
  );
}
