"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` once the user has scrolled past `threshold` pixels.
 * Shared by the back-to-top and WhatsApp floating buttons.
 */
export function useScrollVisible(threshold = 400) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggle = () => setIsVisible(window.scrollY > threshold);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, [threshold]);

  return isVisible;
}
