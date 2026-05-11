import { AdminAuthCard } from "@/components/admin-auth-card";
import { AdminImportCard } from "@/components/admin-import-card";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/auth";
import { getAllEventsForAdmin, getEventImportsForAdmin } from "@/lib/events";
import type { EventImportStatus } from "@/lib/types";

export default async function AdminImportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdminUser();
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <AdminAuthCard />
      </div>
    );
  }

  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const [imports, events] = await Promise.all([
    getEventImportsForAdmin(status as EventImportStatus | undefined),
    getAllEventsForAdmin(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950">Import review queue</h1>
        <p className="text-base text-slate-600">Review staged imports before they become public listings.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {["new", "needs_review", "possible_duplicate", "rejected"].map((item) => (
          <a
            key={item}
            href={`/admin/imports?status=${item}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
          >
            {item}
          </a>
        ))}
      </div>
      {imports.length ? (
        <div className="space-y-6">
          {imports.map((item) => (
            <AdminImportCard
              key={item.id}
              item={item}
              possibleMatch={events.find((event) => event.id === item.possible_duplicate_event_id) ?? null}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">No staged imports for this filter yet.</CardContent>
        </Card>
      )}
    </div>
  );
}
