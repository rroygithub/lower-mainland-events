"use client";

import { useState } from "react";
import { CalendarPlus, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareActions({
  url,
  title,
  calendarUrl,
}: {
  url: string;
  title: string;
  calendarUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a href={whatsappUrl} target="_blank" rel="noreferrer">
        <Button variant="secondary">
          <MessageCircle className="mr-2 h-4 w-4" />
          Share on WhatsApp
        </Button>
      </a>
      <Button variant="secondary" onClick={copyLink}>
        <Copy className="mr-2 h-4 w-4" />
        {copied ? "Copied" : "Copy link"}
      </Button>
      <a href={calendarUrl} target="_blank" rel="noreferrer">
        <Button>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Add to calendar
        </Button>
      </a>
    </div>
  );
}
