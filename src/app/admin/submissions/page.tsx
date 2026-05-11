import { AdminAuthCard } from "@/components/admin-auth-card";
import { AdminSubmissionCard } from "@/components/admin-submission-card";
import { requireAdminUser } from "@/lib/auth";
import { findPossibleDuplicates, getSubmissionsForAdmin } from "@/lib/events";

export default async function AdminSubmissionsPage() {
  const user = await requireAdminUser();

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <AdminAuthCard />
      </div>
    );
  }

  const submissions = await getSubmissionsForAdmin("pending");
  const submissionsWithMatches = await Promise.all(
    submissions.map(async (submission) => ({
      submission,
      matches: await findPossibleDuplicates(submission),
    })),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950">Pending submissions</h1>
        <p className="text-base text-slate-600">Open a submission, review duplicates, make edits, and approve when ready.</p>
      </div>
      <div className="space-y-6">
        {submissionsWithMatches.map((item) => (
          <AdminSubmissionCard key={item.submission.id} submission={item.submission} duplicateMatches={item.matches} />
        ))}
      </div>
    </div>
  );
}
