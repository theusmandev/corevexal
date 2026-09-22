"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteService } from "@/app/actions/services";

export function DeleteServiceButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [warning, setWarning] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    if (
      !confirm("Are you sure you want to permanently delete this service? This cannot be undone.")
    )
      return;
    startTransition(async () => {
      const result = await deleteService(id);
      if (result.error) {
        alert(result.error);
      } else {
        if (result.warning) {
          // Show warning inline then redirect
          setWarning(result.warning);
          setTimeout(() => {
            router.push("/admin/services");
            router.refresh();
          }, 4000);
        } else {
          router.push("/admin/services");
          router.refresh();
        }
      }
    });
  }

  return (
    <div className="space-y-2">
      {warning && (
        <div
          role="alert"
          className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400"
        >
          ⚠ {warning}
        </div>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center rounded-md border border-destructive px-4 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
      >
        {isPending ? "Deleting…" : "Delete Service"}
      </button>
    </div>
  );
}
