import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getPublishedCategories } from "@/lib/data/services";
import { getIcon, getCategoryIcon } from "@/lib/icon-registry";
import { HeroVisual } from "@/components/hero-visual";

export const revalidate = 60;

export const metadata = {
  title: "Corevexal | Business Formation & Financial Solutions",
  description:
    "Corevexal helps entrepreneurs and businesses with company formation, business banking guidance, payment platform setup, and digital solutions.",
};

export default async function Home() {
  const categories = await getPublishedCategories();
  const businessFormation = categories.find((c) => c.slug === "business-formation");
  const formationServices = businessFormation?.services || [];
  const paymentPlatformsCat = categories.find((c) => c.slug === "payment-platforms");
  const paymentPlatforms = paymentPlatformsCat?.services || [];

  const journey = [
    "Idea",
    "Business Formation",
    "Business Documentation",
    "Banking / Financial Infrastructure",
    "Payment Platforms",
    "Digital Presence",
    "Growth",
  ];

  return (
    <main>
      <section className="overflow-hidden bg-background">
        <div className="site-container grid min-h-[calc(100vh-5rem)] items-center gap-10 pt-6 pb-16 lg:grid-cols-[1.05fr_.75fr] lg:pt-10 lg:pb-20">
          <div>
            <p className="eyebrow">
              Business formation • Financial infrastructure • Digital solutions
            </p>
            <h1 className="mt-5 max-w-4xl text-balance font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl xl:text-7xl">
              Build Your Business <span className="text-primary-text">From the Core.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              From company formation to business banking, payment infrastructure, and digital
              solutions — Corevexal helps you establish the foundations for your next stage of
              growth.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contact">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="border-y border-border">
        <div className="site-container grid sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const Icon = getCategoryIcon(c.slug);
            return (
              <div
                key={c.slug || c.name}
                className="flex items-center gap-4 border-b border-border py-6 sm:px-5 lg:border-b-0 lg:border-r first:pl-0 last:border-r-0"
              >
                <Icon className="size-5 text-primary-text" />
                <span className="text-sm font-bold">{c.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section bg-deep text-inverse">
        <div className="site-container">
          <p className="eyebrow">Business formation</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <h2 className="section-title">Form Your Business With Confidence.</h2>
            <p className="max-w-xl leading-7 text-inverse-muted">
              Choose the right business structure, establish the company, organize the required
              documentation, and prepare the foundation for your next step.
            </p>
          </div>
          <div className="mt-12 grid gap-px bg-inverse/15 sm:grid-cols-2 lg:grid-cols-3">
            {formationServices.map((service) => {
              const Icon = getIcon(service.icon || "");
              return (
                <div className="bg-deep p-6" key={service.slug}>
                  <Icon className="text-primary-text" />
                  <h3 className="mt-8 font-display text-lg font-bold">{service.title}</h3>
                </div>
              );
            })}
          </div>
          <Button asChild className="mt-10">
            <Link href="/services/business-formation">
              Explore Business Formation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="section">
        <div className="site-container grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Financial infrastructure</p>
            <h2 className="section-title mt-5">Build the systems behind the business.</h2>
            <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
              Prepare documentation, compare account structures, and plan multi-currency operations
              without promises that belong to providers.
            </p>
            <Button asChild variant="outline" className="mt-8">
              <Link href="/services/business-banking">
                Explore Banking <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-px bg-border">
            {[
              "Business bank accounts",
              "Multi-currency accounts",
              "Application preparation",
              "Account workflow planning",
            ].map((x, i) => (
              <div className="flex items-center justify-between bg-surface p-6" key={x}>
                <span className="font-semibold">{x}</span>
                <span className="font-mono text-xs text-primary-text">0{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="site-container">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Payment platforms</p>
              <h2 className="section-title mt-5">Connect to modern payment infrastructure.</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/services/payment-platforms">Explore Payment Solutions</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
            {paymentPlatforms.map((p) => (
              <Link href={`/services/${p.slug}`} className="group bg-background p-6" key={p.slug}>
                <p className="font-display text-xl font-bold">{p.title.replace(" Business", "")}</p>
                <p className="mt-8 text-xs font-bold uppercase text-muted-foreground group-hover:text-primary-text">
                  Setup guidance <ArrowRight className="ml-1 inline size-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-deep text-inverse">
        <div className="site-container">
          <p className="eyebrow">From formation to growth</p>
          <h2 className="section-title mt-5">A business journey with a stronger core.</h2>
          <div className="mt-12 grid lg:grid-cols-7">
            {journey.map((x, i) => (
              <div
                className="relative border-l border-inverse/20 px-5 py-6 lg:min-h-48 lg:border-l-0 lg:border-t"
                key={x}
              >
                <span className="font-mono text-xs text-primary-text">0{i + 1}</span>
                <h3 className="mt-10 text-sm font-bold uppercase">{x}</h3>
                {i < journey.length - 1 && (
                  <ArrowRight className="absolute -right-3 -top-3 hidden size-5 bg-deep text-primary-text lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <p className="eyebrow">Why Corevexal</p>
          <h2 className="section-title mt-5">One Core. Multiple Solutions.</h2>
          <div className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Structured Guidance",
              "Clear Process",
              "Business-Focused Approach",
              "Technology-Enabled",
              "Scalable Services",
              "Transparent Communication",
            ].map((x) => (
              <div className="flex min-h-32 items-center gap-4 bg-background p-6" key={x}>
                <Check className="text-primary-text" />
                <h3 className="font-display font-bold">{x}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="site-container grid gap-12 lg:grid-cols-[.7fr_1fr]">
          <div>
            <p className="eyebrow">Digital & technology</p>
            <h2 className="section-title mt-5">Build the Digital Layer Around Your Business.</h2>
            <p className="mt-6 leading-7 text-muted-foreground">
              Once the core is ready, build the web, software, commerce, automation, and
              integrations that support growth.
            </p>
            <Button asChild variant="outline" className="mt-8">
              <Link href="/services/digital-technology">
                Explore Technology <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border">
            {[
              "Web Development",
              "Next.js",
              "SaaS",
              "UI/UX",
              "E-commerce",
              "Automation",
              "API Integration",
              "Software",
            ].map((x) => (
              <div className="bg-background p-5 text-sm font-semibold" key={x}>
                {x}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title mt-5">A clear route from need to setup.</h2>
          <ol className="mt-10 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
            {[
              "Tell Us What You Need",
              "Choose Your Service",
              "Prepare Your Information",
              "We Guide You Through the Setup",
              "Complete Required Verification",
              "Move Forward With Your Business",
            ].map((x, i) => (
              <li className="min-h-44 bg-background p-6" key={x}>
                <span className="font-mono text-sm text-primary-text">0{i + 1}</span>
                <h3 className="mt-12 font-display text-lg font-bold">{x}</h3>
              </li>
            ))}
          </ol>
          <p className="mt-7 text-sm text-muted-foreground">
            Third-party providers independently make their own eligibility, verification, and
            approval decisions.
          </p>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="site-container grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Resources</p>
            <h2 className="section-title mt-5">Make the next decision with context.</h2>
            <p className="mt-5 text-muted-foreground">
              Practical guides for formation, banking readiness, payment setup, and digital
              operations.
            </p>
            <Button asChild variant="outline" className="mt-8">
              <Link href="/resources">Explore Resources</Link>
            </Button>
          </div>
          <div>
            <Accordion type="single" collapsible>
              <AccordionItem value="q1">
                <AccordionTrigger>
                  Can Corevexal guarantee banking or payment approval?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. Corevexal provides independent guidance. Each provider controls its own
                  eligibility and approval decisions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>Can I start if I have not formed a company?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Formation is a primary Corevexal service and can become the first stage of
                  your broader setup journey.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button asChild variant="link" className="mt-5 px-0">
              <Link href="/faq">
                View all questions <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="site-container flex flex-col gap-8 py-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase">Where everything starts at the core</p>
            <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
              Ready to build your business foundation?
            </h2>
          </div>
          <Button
            asChild
            className="border border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary-text"
            size="lg"
          >
            <Link href="/contact">
              Start a Request <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
