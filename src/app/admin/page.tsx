import Link from "next/link";
import { AdminAuthCard } from "@/components/admin-auth-card";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardSummary } from "@/lib/events";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await requireAdminUser();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <AdminAuthCard />
      </div>
    );
  }

  const summary = await getDashboardSummary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950">Admin dashboard</h1>
        <p className="text-base text-slate-600">Review submissions, manage approved listings, and catch duplicates early.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Pending submissions", summary.pendingCount],
          ["Approved events", summary.approvedCount],
          ["Possible duplicates", summary.duplicateCount],
          ["Rejected submissions", summary.rejectedCount],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/submissions" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-lg font-semibold text-slate-900">Review submissions</h2>
          <p className="mt-2 text-sm text-slate-600">Approve, reject, edit, and check duplicate suggestions.</p>
        </Link>
        <Link href="/admin/events" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-lg font-semibold text-slate-900">Manage approved events</h2>
          <p className="mt-2 text-sm text-slate-600">Audit published events and source quality.</p>
        </Link>
      </div>
    </div>
  );
}
