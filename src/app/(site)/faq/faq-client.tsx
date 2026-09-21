"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  [
    "Company Formation",
    "What formation services do you support?",
    "Corevexal currently provides guidance for UK LTD and US LLC formation, alongside broader company setup and documentation support.",
  ],
  [
    "UK LTD",
    "Does a UK LTD include a bank account?",
    "No. Formation and banking are separate. Financial institutions independently determine eligibility and approval.",
  ],
  [
    "US LLC",
    "Do you provide tax advice?",
    "No. We provide general setup guidance. Tax outcomes depend on individual circumstances and should be reviewed with a qualified professional.",
  ],
  [
    "Business Banking",
    "Can you guarantee an account?",
    "No. We help with preparation and application guidance, while each institution makes its own decision.",
  ],
  [
    "Payment Platforms",
    "Are you an official platform partner?",
    "No official affiliation is implied. Corevexal provides independent setup, documentation, and operational guidance.",
  ],
  [
    "Digital Services",
    "Can you build the digital layer after formation?",
    "Yes. Digital work can follow formation and financial setup, or support an existing business.",
  ],
  [
    "General",
    "Where should I start?",
    "Submit a request with your current company status and intended outcome. We’ll identify the most relevant pathway.",
  ],
] as const;

export function FaqClient() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => faqs.filter((x) => x.join(" ").toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="site-container max-w-4xl">
      <label className="relative block">
        <span className="sr-only">Search questions</span>
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions"
          className="h-14 w-full border border-input bg-background pl-12 pr-4 focus:border-primary"
        />
      </label>
      <Accordion type="single" collapsible className="mt-8">
        {filtered.map(([cat, q, a], i) => (
          <AccordionItem key={q} value={`${i}`}>
            <AccordionTrigger className="text-left hover:text-primary-text">
              <span>
                <span className="mb-1 block text-xs uppercase text-primary-text">{cat}</span>
                {q}
              </span>
            </AccordionTrigger>
            <AccordionContent className="leading-7 text-muted-foreground">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No matching questions found.</p>
      )}
    </div>
  );
}
