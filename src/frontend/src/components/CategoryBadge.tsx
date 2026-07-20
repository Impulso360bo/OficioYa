import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types";
import type { Category } from "@/types";

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md";
  className?: string;
}

export function CategoryBadge({
  category,
  size = "md",
  className,
}: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-body font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        CATEGORY_COLORS[category],
        className,
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
