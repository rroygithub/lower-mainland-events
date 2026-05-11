import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title = "No events found for this filter.",
  description = "Try changing the city, category, or date range.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
        </div>
        <Link href="/submit">
          <Button variant="secondary">Submit an event</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
