"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { categories, dateFilters, priceTypes } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Select } from "@/components/ui/select";
import { EventSearch } from "@/components/event-search";
import { CityFilter } from "@/components/city-filter";

export function EventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const currentValues = useMemo(
    () => ({
      city: searchParams.get("city") || "all",
      category: searchParams.get("category") || "all",
      date: searchParams.get("date") || "all",
      price: searchParams.get("price") || "all",
      sort: searchParams.get("sort") || "asc",
    }),
    [searchParams],
  );

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(name);
    } else {
      params.set(name, value);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function applySearch() {
    updateParam("q", query);
  }

  function resetFilters() {
    setQuery("");
    router.push(pathname, { scroll: false });
  }

  return (
    <div className="sticky top-16 z-30 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-wrap gap-2">
        {dateFilters.slice(1).map((filter) => (
          <Chip
            key={filter.value}
            active={currentValues.date === filter.value}
            onClick={() => updateParam("date", currentValues.date === filter.value ? "all" : filter.value)}
          >
            {filter.label}
          </Chip>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {["Vancouver", "Surrey", "Burnaby", "Richmond", "Delta", "Coquitlam"].map((city) => (
          <Chip
            key={city}
            active={currentValues.city === city}
            onClick={() => updateParam("city", currentValues.city === city ? "all" : city)}
          >
            {city}
          </Chip>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {["Festival", "Community", "Food", "Dance", "Kids / Family", "Religious / Spiritual"].map((category) => (
          <Chip
            key={category}
            active={currentValues.category === category}
            onClick={() => updateParam("category", currentValues.category === category ? "all" : category)}
          >
            {category}
          </Chip>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-[2fr_repeat(5,1fr)_auto]">
        <EventSearch value={query} onChange={setQuery} />
        <CityFilter value={currentValues.city} onChange={(value) => updateParam("city", value)} />
        <Select value={currentValues.category} onChange={(event) => updateParam("category", event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <Select value={currentValues.date} onChange={(event) => updateParam("date", event.target.value)}>
          {dateFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>
        <Select value={currentValues.price} onChange={(event) => updateParam("price", event.target.value)}>
          {priceTypes.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </Select>
        <Select value={currentValues.sort} onChange={(event) => updateParam("sort", event.target.value)}>
          <option value="asc">Soonest first</option>
          <option value="desc">Latest first</option>
          <option value="recently-added">Recently added</option>
        </Select>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={applySearch}>
            Apply
          </Button>
          <Button variant="secondary" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
