"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBlogCategory } from "@/app/actions/blog-categories";

export function DeleteBlogCategoryButton({ id, postCount }: { id: string; postCount: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (postCount > 0) {
      alert(
        `Cannot delete: this category has ${postCount} post${postCount === 1 ? "" : "s"}. Move or delete its posts first.`,
      );
      return;
    }
    if (
      !confirm(
        "Are you sure you want to permanently delete this blog category? This cannot be undone.",
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteBlogCategory(id);
      if (result.error) {
        alert(result.error);
      } else {
        router.push("/admin/blog-categories");
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex h-10 items-center justify-center rounded-md border border-destructive px-4 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
    >
      {isPending ? "Deleting…" : "Delete Category"}
    </button>
  );
}
