"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import { api, SearchResult } from "@/lib/api";

const FILTERS = ["tool", "model", "framework", "guide"] as const;

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    api
      .search(q, activeFilters.length ? activeFilters : undefined)
      .then((data) => setResults(data.results))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q, activeFilters]);

  function toggleFilter(f: string) {
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  function resultHref(r: SearchResult) {
    if (r.type === "guide") return `/guides/${r.slug}`;
    return `/${r.type}s`;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Search catalog</h1>
        <p>Find tools, models, frameworks, and learning guides for local AI.</p>
      </div>
      <SearchBar initialQuery={q} />
      <div className="search-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`filter-chip ${activeFilters.includes(f) ? "active" : ""}`}
            onClick={() => toggleFilter(f)}
          >
            {f}s
          </button>
        ))}
      </div>

      {loading && <p className="empty">Searching…</p>}
      {!loading && q && results.length === 0 && (
        <p className="empty">No results for &ldquo;{q}&rdquo;</p>
      )}
      {!loading && results.length > 0 && (
        <div className="card-grid">
          {results.map((r) => (
            <Link key={`${r.type}-${r.id}`} href={resultHref(r)} className="card">
              <span className={`card-type type-${r.type}`}>{r.type}</span>
              <h3>{r.title}</h3>
              <p>{r.summary}</p>
              <div className="card-tags">
                {r.tags.split(",").slice(0, 4).map((t) => (
                  <span key={t} className="tag">
                    {t.trim()}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container empty">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
