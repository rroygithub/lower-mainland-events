import { AdminAuthCard } from "@/components/admin-auth-card";
import { AdminSourceManager } from "@/components/admin-source-manager";
import { requireAdminUser } from "@/lib/auth";
import { getSourceConfigsForAdmin } from "@/lib/events";

export default async function AdminSourcesPage() {
  const user = await requireAdminUser();
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <AdminAuthCard />
      </div>
    );
  }

  const sources = await getSourceConfigsForAdmin();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950">Event sources</h1>
        <p className="text-base text-slate-600">Add community feeds and public event pages, then run imports into staging.</p>
      </div>
      <AdminSourceManager initialSources={sources} />
    </div>
  );
}
