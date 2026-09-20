import { Link } from "@tanstack/react-router";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3" aria-label="Corevexal home">
      <span className="relative grid size-9 place-items-center" aria-hidden="true">
        <span className="absolute inset-0 rotate-45 border-2 border-primary transition-transform group-hover:rotate-90" />
        <span className="size-3 bg-primary" />
      </span>
      <span className={`font-display text-lg font-bold tracking-normal ${inverse ? "text-inverse" : "text-foreground"}`}>COREVEXAL</span>
    </Link>
  );
}