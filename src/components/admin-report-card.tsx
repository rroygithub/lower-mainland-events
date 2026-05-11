"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EventReportRecord } from "@/lib/types";

export function AdminReportCard({ report }: { report: EventReportRecord }) {
  const [status, setStatus] = useState(report.status);

  async function update(nextStatus: EventReportRecord["status"]) {
    const response = await fetch("/api/admin/reports/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: report.id, status: nextStatus }),
    });

    if (response.ok) {
      setStatus(nextStatus);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900">{report.issue_type || "Issue report"}</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{status}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{report.message || "No message provided."}</p>
          <p className="mt-2 text-xs text-slate-500">{report.reporter_email || "Anonymous reporter"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => update("reviewed")}>
            Mark reviewed
          </Button>
          <Button onClick={() => update("resolved")}>Resolve</Button>
        </div>
      </CardContent>
    </Card>
  );
}
