"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

import { services, paymentPlatforms, platformContent } from "@/lib/services";

// Helper to format names
const formatPlatformName = (platform: string) =>
  platformContent[platform as keyof typeof platformContent].name.replace(" Business", "");

const columns = [
  {
    title: "Business Formation",
    links: [
      ...services
        .filter((s) => s.category === "formation")
        .map((s) => [s.title, `/services/${s.slug}`]),
      ["Company Setup", "/services/business-formation"],
    ] as [string, string][],
  },
  {
    title: "Business Banking",
    links: [
      ["Business Bank Accounts", "/services/business-banking"],
      ["Multi-Currency Accounts", "/services/business-banking"],
      ["Account Setup Guidance", "/services/business-banking"],
    ] as [string, string][],
  },
  {
    title: "Payment Platforms",
    links: paymentPlatforms.map((p) => [
      formatPlatformName(p),
      `/services/payment-platforms/${p}`,
    ]) as [string, string][],
  },
  {
    title: "Digital & Technology",
    links: [
      ["Web Development", "/services/digital-technology"],
      ["Software", "/services/digital-technology"],
      ["SaaS", "/services/digital-technology"],
      ["Automation", "/services/digital-technology"],
    ] as [string, string][],
  },
] as const;

const navLinks = [
  ["Solutions", "/solutions"],
  ["Resources", "/resources"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-sm">
      <div className="site-container flex h-20 items-center justify-between gap-8">
        <Brand />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          <div className="group relative">
            <button
              className="flex h-20 items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary-text"
              type="button"
            >
              Services{" "}
              <ChevronDown className="size-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-[calc(100%-1px)] w-[760px] -translate-x-1/2 border border-border bg-background p-7 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="grid grid-cols-4 gap-6">
                {columns.map((column) => (
                  <div key={column.title}>
                    <p className="mb-3 text-xs font-bold uppercase text-primary-text">
                      {column.title}
                    </p>
                    <div className="space-y-2.5">
                      {column.links.map(([label, href]) => (
                        <Link
                          key={label}
                          href={href}
                          className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {navLinks.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className={`text-sm font-semibold transition-colors hover:text-primary-text ${pathname.startsWith(href) ? "text-primary-text" : "text-foreground"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button asChild>
            <Link href="/contact">Get Started</Link>
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Brand />
            <nav className="mt-10" aria-label="Mobile navigation">
              <Accordion type="single" collapsible>
                <AccordionItem value="services">
                  <AccordionTrigger className="text-base">Services</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-2">
                      {columns.map((column) => (
                        <div key={column.title}>
                          <p className="mb-2 text-xs font-bold uppercase text-primary-text">
                            {column.title}
                          </p>
                          {column.links.map(([label, href]) => (
                            <SheetClose asChild key={label}>
                              <Link href={href} className="block py-2 text-muted-foreground">
                                {label}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="flex flex-col">
                {navLinks.map(([label, href]) => (
                  <SheetClose asChild key={label}>
                    <Link
                      href={href}
                      className={`border-b border-border py-4 font-semibold ${pathname.startsWith(href) ? "text-primary-text" : "text-foreground"}`}
                    >
                      {label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <Button asChild className="mt-8 w-full">
                <SheetClose asChild>
                  <Link href="/contact">Get Started</Link>
                </SheetClose>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
