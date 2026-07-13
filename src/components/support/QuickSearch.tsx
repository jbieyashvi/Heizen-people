"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export function QuickSearch() {
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="relative"
    >
      <label htmlFor="quick-search" className="sr-only">
        Search tickets, requests or support topics
      </label>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        id="quick-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tickets, requests or support topics…"
        className="h-12 w-full rounded-lg border border-[#EAECEE] bg-white pl-12 pr-4 text-sm text-slate-700 shadow-subtle outline-none placeholder:text-slate-400 focus:border-heizen-300 focus:ring-2 focus:ring-heizen-100"
      />
    </form>
  );
}
