"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollVisible } from "@/hooks/use-scroll-visible";

/**
 * Floating WhatsApp contact button — bottom-left, mirrors the back-to-top
 * button's size and scroll-triggered show/hide behaviour.
 *
 * Renders nothing when `phone` is empty/undefined (graceful degradation).
 *
 * Uses a generic MessageCircle icon (lucide-react) in WhatsApp-green to
 * avoid reproducing the trademarked WhatsApp glyph.
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
        "fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 flex items-end gap-2 transition-all duration-200",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none",
      )}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="inline-flex items-center justify-center size-11 rounded-md shadow-none bg-[#25D366] text-white transition-colors duration-200 hover:bg-[#1DA851] active:scale-95"
      >
        <MessageCircle className="size-4" />
      </a>
      <span className="hidden min-[400px]:inline-block rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
        Need help?
      </span>
    </div>
  );
}
