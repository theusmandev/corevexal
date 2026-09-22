import Link from "next/link";
import { ArrowRight, Check, FileText, Route as RouteIcon, Users } from "lucide-react";
import type { PublishedService } from "@/lib/data/services";
import { getIcon } from "@/lib/icon-registry";
import { Button } from "./ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { CtaBand } from "./cta-band";

// Fallback disclaimer in case the user doesn't have it elsewhere
const sharedDisclaimer =
  "Third-party providers independently make their own eligibility, verification, and approval decisions. Corevexal does not guarantee account opening or platform approval.";

export function ServiceDetail({ service }: { service: PublishedService }) {
  const Icon = getIcon(service.icon || "");
  const features = (service.features as string[]) || [];
  const requirements = (service.requirements as string[]) || [];
  const processSteps = (service.process as string[]) || [];
  const faqs = (service.faqs as { question: string; answer: string }[]) || [];

  return (
    <main>
      <section className="bg-deep text-inverse">
        <div className="site-container grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1fr_.8fr]">
          <div>
            <p className="eyebrow">Corevexal services</p>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.03] sm:text-6xl">
              {service.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-inverse-muted">
              {service.description}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contact">
                  Get Started <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="inverse" size="lg">
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
          <div className="core-diagram">
            <Icon className="size-16 text-primary-text" />
            <span />
            <p>{service.category_id}</p>
            <span />
            <p>Structured setup</p>
            <span />
            <p>Business ready</p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="site-container grid gap-12 lg:grid-cols-[.65fr_1fr]">
          <div>
            <p className="eyebrow">Overview</p>
            <h2 className="section-title mt-4">A clear path, built around your business.</h2>
            <p className="mt-5 leading-7 text-muted-foreground">{service.short_description}</p>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="flex min-h-28 items-start gap-4 bg-background p-6">
                <Check className="mt-0.5 size-5 text-primary-text" />
                <span className="font-semibold">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-surface">
        <div className="site-container grid gap-12 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <FileText className="text-primary-text" />
              <h2 className="font-display text-3xl font-bold">What to prepare</h2>
            </div>
            <ul className="mt-7 divide-y divide-border border-y border-border">
              {requirements.map((item) => (
                <li className="py-4 text-muted-foreground" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <RouteIcon className="text-primary-text" />
              <h2 className="font-display text-3xl font-bold">The process</h2>
            </div>
            <ol className="mt-7 space-y-3">
              {processSteps.map((item, index) => (
                <li key={item} className="flex gap-5 border border-border bg-background p-5">
                  <span className="font-mono text-sm font-bold text-primary-text">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="site-container max-w-4xl">
          <div className="flex items-center gap-3">
            <Users className="text-primary-text" />
            <h2 className="font-display text-3xl font-bold">Frequently asked questions</h2>
          </div>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((item, index) => (
              <AccordionItem value={`q-${index}`} key={item.question}>
                <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
                <AccordionContent className="max-w-3xl leading-7 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-10 border-l-2 border-primary pl-5 text-sm leading-6 text-muted-foreground">
            Company formation and tax requirements can depend on individual circumstances. Consider
            professional legal or tax advice where appropriate. {sharedDisclaimer}
          </p>
        </div>
      </section>
      <CtaBand />
    </main>
  );
}
