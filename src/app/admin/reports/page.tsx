import { AdminAuthCard } from "@/components/admin-auth-card";
import { AdminReportCard } from "@/components/admin-report-card";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/auth";
import { getEventReportsForAdmin } from "@/lib/events";

export default async function AdminReportsPage() {
  const user = await requireAdminUser();
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <AdminAuthCard />
      </div>
    );
  }

  const reports = await getEventReportsForAdmin();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950">Event reports</h1>
        <p className="text-base text-slate-600">Review corrections, duplicate reports, and cancellation notices from visitors.</p>
      </div>
      {reports.length ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <AdminReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">No event reports yet.</CardContent>
        </Card>
      )}
    </div>
  );
}
