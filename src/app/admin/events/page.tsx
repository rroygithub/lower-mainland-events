import { AdminAuthCard } from "@/components/admin-auth-card";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/auth";
import { formatEventDateTimeRange } from "@/lib/date";
import { getAllEventsForAdmin, getSubmissionsForAdmin } from "@/lib/events";

export default async function AdminEventsPage() {
  const user = await requireAdminUser();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <AdminAuthCard />
      </div>
    );
  }

  const [events, rejectedSubmissions] = await Promise.all([getAllEventsForAdmin(), getSubmissionsForAdmin("rejected")]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950">Published and rejected</h1>
        <p className="text-base text-slate-600">A lightweight overview of approved listings and the moderation backlog.</p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Approved events</h2>
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{event.title}</p>
                  <p className="text-sm text-slate-500">
                    {event.city} · {formatEventDateTimeRange(event.start_time, event.end_time)}
                  </p>
                </div>
                <p className="text-sm text-slate-500">{event.source_name || "Submitted by organizer"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Rejected submissions</h2>
        <div className="grid gap-4">
          {rejectedSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardContent className="p-5">
                <p className="font-medium text-slate-900">{submission.title}</p>
                <p className="text-sm text-slate-500">
                  {submission.city} · {formatEventDateTimeRange(submission.start_time, submission.end_time)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
