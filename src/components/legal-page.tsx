import { PageHero } from "./page-hero";
export function LegalPage({
 title,
 intro,
 sections,
}: {
 title: string;
 intro: string;
 sections: { title: string; body: string }[];
}) {
 return (
 <main>
 <PageHero eyebrow="Legal" title={title} description={intro} />
 <section className="section">
 <div className="site-container max-w-3xl space-y-10">
 {sections.map((s) => (
 <article key={s.title}>
 <h2 className="font-display text-2xl font-bold">{s.title}</h2>
 <p className="mt-4 leading-7 text-muted-foreground">{s.body}</p>
 </article>
 ))}
 </div>
 </section>
 </main>
 );
}
