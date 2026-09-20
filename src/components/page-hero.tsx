import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <section className="border-b border-border bg-surface"><div className="site-container grid gap-10 py-20 lg:grid-cols-[1fr_.55fr] lg:py-28"><div><p className="eyebrow">{eyebrow}</p><h1 className="mt-6 max-w-4xl text-balance font-display text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">{title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p></div>{children && <div className="self-end">{children}</div>}</div></section>;
}