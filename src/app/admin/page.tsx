import Link from "next/link";
import { AdminAuthCard } from "@/components/admin-auth-card";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950">Admin dashboard</h1>
        <p className="text-base text-slate-600">
          Sign in with an allowlisted admin email to review submissions, manage sources, and moderate staged imports.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AdminAuthCard />
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-slate-900">After you sign in</h2>
            <div className="grid gap-3">
              {[
                ["Review submissions", "/admin/submissions"],
                ["Manage approved events", "/admin/events"],
                ["Manage sources", "/admin/sources"],
                ["Review imports", "/admin/imports"],
                ["Resolve reports", "/admin/reports"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  {label}
                </Link>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Admin API routes remain protected. This page is intentionally lightweight so it can load even if session lookup is not ready yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
