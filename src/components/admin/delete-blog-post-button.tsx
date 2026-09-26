"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBlogPost } from "@/app/actions/blog-posts";

export function DeleteBlogPostButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (
      !confirm("Are you sure you want to permanently delete this blog post? This cannot be undone.")
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBlogPost(id);
      if (result.error) {
        alert(result.error);
      } else {
        router.push("/admin/blog-posts");
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
      {isPending ? "Deleting…" : "Delete Post"}
    </button>
  );
}
