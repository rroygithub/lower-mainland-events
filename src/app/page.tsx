import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { FeaturedEvents } from "@/components/featured-events";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFeaturedEvents, getRecentlyAddedEvents, getUpcomingEventsByCity, getWeekendEvents } from "@/lib/events";

export default async function HomePage() {
  const [featuredEvents, weekendEvents, recentlyAddedEvents, upcomingByCity] = await Promise.all([
    getFeaturedEvents(),
    getWeekendEvents(),
    getRecentlyAddedEvents(),
    getUpcomingEventsByCity(),
  ]);

  return (
    <div className="space-y-16 pb-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-800">
              <Sparkles className="h-4 w-4" />
              Local discovery for Metro Vancouver’s South Asian community
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-tight text-slate-950 sm:text-6xl">
                Discover Indian and South Asian events across Metro Vancouver.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Find concerts, classical music, dance, festivals, food events, religious gatherings, and community
                programs before they happen.
              </p>
              <p className="max-w-2xl text-sm leading-6 text-slate-500">
                Listings are curated from organizer submissions, community sources, and public event pages.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/events">
                <Button size="lg">Browse Events</Button>
              </Link>
              <Link href="/submit">
                <Button variant="secondary" size="lg">
                  Submit an Event
                </Button>
              </Link>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Quick discovery</p>
                <CalendarDays className="h-5 w-5 text-slate-400" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "This weekend", href: "/events?date=this-weekend" },
                  { label: "Free events", href: "/events?price=free" },
                  { label: "Family-friendly", href: "/events?category=Kids%20%2F%20Family" },
                  { label: "In Surrey", href: "/events?city=Surrey" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-slate-950 hover:bg-slate-50"
                  >
                    <p className="text-base font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">Open curated listings</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedEvents
          title="Featured events"
          description="Handpicked highlights with strong local interest, polished presentation, and clear logistics."
          events={featuredEvents}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedEvents
          title="Recently added"
          description="Freshly reviewed listings that just landed in the guide."
          events={recentlyAddedEvents}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedEvents
          title="This weekend"
          description="A fast view of what is happening next, optimized for last-minute plans and easy sharing."
          events={weekendEvents}
        />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Upcoming by city</h2>
          <p className="text-sm leading-6 text-slate-600">Browse upcoming events grouped around the communities they serve.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {upcomingByCity.map(([city, events]) => (
            <Card key={city}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-900">{city}</h3>
                </div>
                <div className="space-y-3">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{event.title}</p>
                        <p className="text-sm text-slate-500">{event.venue_name || "Venue TBD"}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-slate-950 text-white">
          <CardContent className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Hosting something the community should know about?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Submit your event for review and help people discover it before the date arrives.
              </p>
            </div>
            <Link href="/submit">
              <Button variant="secondary">Submit event</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
