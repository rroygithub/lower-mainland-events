import { NewsletterSignupForm } from "@/components/newsletter-signup-form";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <NewsletterSignupForm />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Lower Mainland Indian Events</p>
            <p className="text-sm text-slate-600">
              Listings are curated from organizer submissions, community sources, and public event pages.
            </p>
          </div>
          <div className="text-sm text-slate-500">
            Discover concerts, festivals, food nights, family programs, and community gatherings across Metro Vancouver.
          </div>
        </div>
      </div>
    </footer>
  );
}
