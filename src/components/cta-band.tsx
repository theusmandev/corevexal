import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export function CtaBand() {
  return (
    <section className="bg-deep text-inverse">
      <div className="site-container grid gap-8 py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:py-20">
        <div>
          <p className="eyebrow">Start at the core</p>
          <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Build the right foundation for what comes next.
          </h2>
          <p className="mt-5 max-w-2xl text-inverse-muted">
            Tell us what you are building. We’ll help you identify the right formation, financial,
            payment, or digital pathway.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/contact">
            Start a Request <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
