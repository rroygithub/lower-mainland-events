import { SubmitEventForm } from "@/components/submit-event-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const isSuccess = params.success === "1";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950 sm:text-5xl">Submit an event</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Share community events, performances, food pop-ups, festivals, and family programs happening across the Lower Mainland.
        </p>
      </div>

      {isSuccess ? (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-slate-900">Your event has been submitted for review.</h2>
            <p className="mt-2 text-sm text-slate-600">
              Approved events usually appear after moderation.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-6 sm:p-8">
          <SubmitEventForm />
        </CardContent>
      </Card>
    </div>
  );
}
