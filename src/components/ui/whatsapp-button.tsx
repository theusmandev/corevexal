"use client";

import { FaWhatsapp } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useScrollVisible } from "@/hooks/use-scroll-visible";

/**
 * Floating WhatsApp contact button — bottom-left, circular, with the
 * "Need help?" label positioned above the button to avoid overlapping
 * footer content.
 *
 * Renders nothing when `phone` is empty/undefined (graceful degradation).
 */
export function WhatsAppButton({ phone }: { phone?: string }) {
  const isVisible = useScrollVisible();

  // Strip everything except digits to build a wa.me link.
  const digits = phone?.replace(/\D/g, "") || "";

  // Graceful empty state — don't render if no phone number.
  if (!digits) return null;

  const href = `https://wa.me/${digits}`;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 flex flex-col items-center gap-2 transition-all duration-200",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none",
      )}
    >
      <span className="hidden min-[400px]:inline-block rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground shadow-sm">
        Need help?
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="inline-flex items-center justify-center size-11 rounded-full shadow-none bg-[#25D366] text-white transition-colors duration-200 hover:bg-[#1DA851] active:scale-95"
      >
        <FaWhatsapp className="size-6" />
      </a>
    </div>
  );
}
