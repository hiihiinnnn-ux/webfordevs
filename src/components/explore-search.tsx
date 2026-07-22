"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { FavoriteButton } from "./favorite-button";

type CatalogItem =
  | {
      type: "model";
      id: string;
      slug: string;
      name: string;
      vendor: string;
      description: string;
      sizeParams: string | null;
      tags: string[];
      hardwareMin: string | null;
    }
  | {
      type: "tool";
      id: string;
      slug: string;
      name: string;
      category: string;
      description: string;
      tags: string[];
      difficulty: string;
    };

type SearchResponse = {
  total: number;
  items: CatalogItem[];
  facets: {
    modelTags: string[];
    toolCategories: string[];
    difficulties: string[];
  };
};

const typeOptions = [
  { value: "all", label: "All" },
  { value: "models", label: "Models" },
  { value: "tools", label: "Tools" },
];

export function ExploreSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      startTransition(async () => {
        setError(null);
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        params.set("type", type);
        if (category) params.set("category", category);
        if (tag) params.set("tag", tag);
        if (difficulty) params.set("difficulty", difficulty);
        params.set("limit", "30");
        try {
          const res = await fetch(`/api/catalog/search?${params.toString()}`, {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error("Search failed");
          const json = (await res.json()) as SearchResponse;
          setData(json);
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            setError("Could not search the catalog.");
          }
        }
      });
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, type, category, tag, difficulty]);

  return (
    <div className="explore">
      <div className="search-panel">
        <label className="search-label" htmlFor="catalog-search">
          Search models, tools, tags
        </label>
        <input
          id="catalog-search"
          className="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. ollama, coding, embeddings, rag…"
          autoComplete="off"
        />
        <div className="filter-row">
          <div className="seg">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={type === opt.value ? "seg-btn active" : "seg-btn"}
                onClick={() => setType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <select
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Tool category"
          >
            <option value="">Any category</option>
            {(data?.facets.toolCategories ?? ["runtime", "ui", "framework", "ide"]).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            aria-label="Difficulty"
          >
            <option value="">Any difficulty</option>
            {(data?.facets.difficulties ?? ["beginner", "intermediate", "advanced"]).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            aria-label="Tag"
          >
            <option value="">Any tag</option>
            {(data?.facets.modelTags ?? []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-meta">
        <p className="muted">
          {pending ? "Searching…" : data ? `${data.total} result${data.total === 1 ? "" : "s"}` : "Loading catalog…"}
        </p>
        {error ? <p className="error-text">{error}</p> : null}
      </div>

      <div className="result-list">
        {(data?.items ?? []).map((item) => (
          <article key={`${item.type}-${item.id}`} className="result-row">
            <div className="result-main">
              <div className="result-kicker">
                <span className="pill">{item.type}</span>
                {item.type === "model" ? (
                  <span className="muted tiny">
                    {item.vendor}
                    {item.sizeParams ? ` · ${item.sizeParams}` : ""}
                  </span>
                ) : (
                  <span className="muted tiny">
                    {item.category} · {item.difficulty}
                  </span>
                )}
              </div>
              <h3>
                <Link href={item.type === "model" ? `/explore/models/${item.slug}` : `/explore/tools/${item.slug}`}>
                  {item.name}
                </Link>
              </h3>
              <p>{item.description}</p>
              <div className="tag-row">
                {item.tags.slice(0, 5).map((t) => (
                  <button key={t} type="button" className="tag" onClick={() => setTag(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <FavoriteButton itemType={item.type} itemId={item.id} />
          </article>
        ))}
      </div>
    </div>
  );
}
