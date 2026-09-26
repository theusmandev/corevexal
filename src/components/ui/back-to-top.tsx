"use client";

import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollVisible } from "@/hooks/use-scroll-visible";

export function BackToTop() {
  const isVisible = useScrollVisible();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 inline-flex items-center justify-center size-11 rounded-md shadow-none bg-orange-500 text-white transition-all duration-200 hover:bg-orange-600 active:scale-95",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none",
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
