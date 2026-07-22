"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form className="search-box" onSubmit={onSubmit}>
      <span className="search-icon">⌕</span>
      <input
        type="search"
        placeholder="Search tools, models, frameworks, guides…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search catalog"
      />
    </form>
  );
}
