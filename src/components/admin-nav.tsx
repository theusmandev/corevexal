"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin Navigation" className="flex items-center gap-6 text-sm font-medium">
      <Link
        href="/admin"
        className={
          pathname === "/admin"
            ? "text-foreground font-bold"
            : "text-muted-foreground hover:text-foreground transition-colors"
        }
        aria-current={pathname === "/admin" ? "page" : undefined}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/leads"
        className={
          pathname.startsWith("/admin/leads")
            ? "text-foreground font-bold"
            : "text-muted-foreground hover:text-foreground transition-colors"
        }
        aria-current={pathname.startsWith("/admin/leads") ? "page" : undefined}
      >
        Leads
      </Link>
      <Link
        href="/admin/categories"
        className={
          pathname.startsWith("/admin/categories")
            ? "text-foreground font-bold"
            : "text-muted-foreground hover:text-foreground transition-colors"
        }
        aria-current={pathname.startsWith("/admin/categories") ? "page" : undefined}
      >
        Categories
      </Link>
      <Link
        href="/admin/services"
        className={
          pathname.startsWith("/admin/services")
            ? "text-foreground font-bold"
            : "text-muted-foreground hover:text-foreground transition-colors"
        }
        aria-current={pathname.startsWith("/admin/services") ? "page" : undefined}
      >
        Services
      </Link>
      <Link
        href="/admin/settings"
        className={
          pathname.startsWith("/admin/settings")
            ? "text-foreground font-bold"
            : "text-muted-foreground hover:text-foreground transition-colors"
        }
        aria-current={pathname.startsWith("/admin/settings") ? "page" : undefined}
      >
        Settings
      </Link>
    </nav>
  );
}
