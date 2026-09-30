"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLead } from "@/app/admin/leads/actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function DeleteLeadButton({ id, iconOnly = false }: { id: string; iconOnly?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;

    startTransition(async () => {
      const result = await deleteLead(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Lead deleted");
        router.push("/admin/leads");
        router.refresh();
      }
    });
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50"
        title="Delete Lead"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex h-9 items-center justify-center rounded-md border border-destructive px-4 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
    >
      {isPending ? "Deleting…" : "Delete Lead"}
    </button>
  );
}
