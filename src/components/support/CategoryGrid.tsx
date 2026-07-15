"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/lib/admin/categoryTypes";
import { getEmployeeCategories } from "@/lib/admin/categorySelectors";
import { getCategoryIcon } from "@/lib/admin/categoryIcons";

export function CategoryGrid() {
  // Reads the centralized category config — only Active + Visible, in order.
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    setCategories(getEmployeeCategories());
  }, []);

  if (categories.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[#DDE1E4] bg-white px-4 py-6 text-center text-sm text-slate-500">
        No request categories are available right now.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        return (
          <li key={category.id}>
            <Link
              href={`/support/new?category=${category.id}`}
              className="group flex h-full items-start gap-3 rounded-lg border border-[#EAECEE] bg-white p-3.5 outline-none transition-colors hover:border-heizen-200 hover:bg-heizen-50/40 focus-visible:ring-2 focus-visible:ring-heizen-400 focus-visible:ring-offset-1"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#EAECEE] bg-surface-muted text-slate-500 transition-colors group-hover:border-heizen-200 group-hover:bg-white group-hover:text-heizen-600">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-800">{category.name}</span>
                <span className="mt-0.5 block text-xs leading-snug text-slate-500">{category.description}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
