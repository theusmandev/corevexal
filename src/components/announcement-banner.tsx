"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { AnnouncementBanner as BannerType } from "@/lib/schemas/settings";

export function AnnouncementBanner({ banner }: { banner?: BannerType }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!banner?.enabled || !banner?.text) {
      return;
    }
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("announcement-dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [banner]);

  if (!isVisible || !banner?.enabled || !banner?.text) {
    return null;
  }

  const handleDismiss = () => {
    sessionStorage.setItem("announcement-dismissed", "true");
    setIsVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="bg-primary px-4 py-2 text-primary-foreground sm:px-6 lg:px-8"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pr-8 text-center text-sm sm:pr-0">
        <p className="font-medium leading-6">
          {banner.text}
          {banner.link_text && banner.link_url && (
            <Link
              href={banner.link_url}
              className="group ml-2 inline-flex items-center font-bold hover:underline"
            >
              {banner.link_text}{" "}
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="-m-3 p-3 focus-visible:outline-offset-[-4px] sm:absolute sm:right-6 sm:top-1"
          aria-label="Dismiss announcement"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
