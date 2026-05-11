"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function EventSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Search events</span>
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search concerts, festivals, food nights, temples, workshops..."
        className="pl-11"
      />
    </label>
  );
}
