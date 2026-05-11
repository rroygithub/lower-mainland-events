import Link from "next/link";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Browse events" },
  { href: "/submit", label: "Submit" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Lower Mainland Events</p>
            <p className="text-xs text-slate-500">Indian & South Asian community guide</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-slate-600 transition hover:text-slate-950">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/submit" className="hidden sm:block">
            <Button variant="secondary">Submit an event</Button>
          </Link>
          <Link href="/events">
            <Button>Browse events</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
