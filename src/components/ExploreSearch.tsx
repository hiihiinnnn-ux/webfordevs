"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type Tool = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  featured: boolean;
};

type Model = {
  id: string;
  slug: string;
  name: string;
  description: string;
  family: string;
  sizeParams: string;
  minRamGb: number;
  tags: string[];
  featured: boolean;
  ollamaPull: string | null;
};

type Guide = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  level: string;
};

type SearchResponse = {
  query: string;
  tools: Tool[];
  models: Model[];
  guides: Guide[];
  total: number;
};

type Stats = {
  categories: string[];
  families: string[];
};

export function ExploreSearch({
  initialQuery = "",
  initialType = "all",
}: {
  initialQuery?: string;
  initialType?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [category, setCategory] = useState("");
  const [family, setFamily] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((response) => response.json())
      .then((data) =>
        setStats({
          categories: data.categories ?? [],
          families: data.families ?? [],
        }),
      )
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    startTransition(async () => {
      try {
        setError(null);
        if (query.trim()) {
          const params = new URLSearchParams({
            q: query.trim(),
            type,
            limit: "24",
          });
          const response = await fetch(`/api/search?${params}`, {
            signal: controller.signal,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error ?? "Search failed");
          setResults(data);
          setTools([]);
          setModels([]);
          return;
        }

        const [toolsRes, modelsRes] = await Promise.all([
          fetch(
            `/api/tools?limit=24${category ? `&category=${encodeURIComponent(category)}` : ""}`,
            { signal: controller.signal },
          ),
          fetch(
            `/api/models?limit=24${family ? `&family=${encodeURIComponent(family)}` : ""}`,
            { signal: controller.signal },
          ),
        ]);
        const toolsData = await toolsRes.json();
        const modelsData = await modelsRes.json();
        if (!toolsRes.ok || !modelsRes.ok) {
          throw new Error("Failed to load catalog");
        }
        setResults(null);
        setTools(toolsData.items ?? []);
        setModels(modelsData.items ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message || "Search failed");
      }
    });

    return () => controller.abort();
  }, [query, type, category, family]);

  const showSearch = Boolean(query.trim());

  return (
    <div className="explore">
      <div className="search-panel">
        <label className="search-label" htmlFor="catalog-search">
          Search tools, models, and guides
        </label>
        <input
          id="catalog-search"
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try ollama, ggml, embeddings, coding…"
        />
        <div className="filter-row">
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label="Result type"
          >
            <option value="all">All types</option>
            <option value="tools">Tools</option>
            <option value="models">Models</option>
            <option value="guides">Guides</option>
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Tool category"
            disabled={showSearch}
          >
            <option value="">All tool categories</option>
            {stats?.categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={family}
            onChange={(event) => setFamily(event.target.value)}
            aria-label="Model family"
            disabled={showSearch}
          >
            <option value="">All model families</option>
            {stats?.families.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="muted small">
            {pending ? "Searching…" : showSearch ? `${results?.total ?? 0} matches` : "Browsing catalog"}
          </span>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {showSearch && results ? (
        <div className="result-stack">
          {(type === "all" || type === "tools") && (
            <ResultSection title="Tools" empty={results.tools.length === 0}>
              {results.tools.map((tool) => (
                <ToolResult key={tool.id} tool={tool} />
              ))}
            </ResultSection>
          )}
          {(type === "all" || type === "models") && (
            <ResultSection title="Models" empty={results.models.length === 0}>
              {results.models.map((model) => (
                <ModelResult key={model.id} model={model} />
              ))}
            </ResultSection>
          )}
          {(type === "all" || type === "guides") && (
            <ResultSection title="Guides" empty={results.guides.length === 0}>
              {results.guides.map((guide) => (
                <GuideResult key={guide.id} guide={guide} />
              ))}
            </ResultSection>
          )}
        </div>
      ) : (
        <div className="result-stack">
          <ResultSection title="Tools" empty={tools.length === 0}>
            {tools.map((tool) => (
              <ToolResult key={tool.id} tool={tool} />
            ))}
          </ResultSection>
          <ResultSection title="Models" empty={models.length === 0}>
            {models.map((model) => (
              <ModelResult key={model.id} model={model} />
            ))}
          </ResultSection>
        </div>
      )}
    </div>
  );
}

function ResultSection({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="result-section">
      <h2>{title}</h2>
      {empty ? (
        <p className="muted">No {title.toLowerCase()} matched.</p>
      ) : (
        <div className="result-grid">{children}</div>
      )}
    </section>
  );
}

function ToolResult({ tool }: { tool: Tool }) {
  return (
    <Link href={`/tools/${tool.slug}`} className="result-item">
      <div className="result-meta">
        <span>{tool.category}</span>
        <span>{tool.difficulty}</span>
      </div>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
    </Link>
  );
}

function ModelResult({ model }: { model: Model }) {
  return (
    <Link href={`/models/${model.slug}`} className="result-item">
      <div className="result-meta">
        <span>{model.family}</span>
        <span>{model.sizeParams}</span>
        <span>{model.minRamGb}GB RAM</span>
      </div>
      <h3>{model.name}</h3>
      <p>{model.description}</p>
      {model.ollamaPull ? (
        <code className="inline-code">ollama pull {model.ollamaPull}</code>
      ) : null}
    </Link>
  );
}

function GuideResult({ guide }: { guide: Guide }) {
  return (
    <Link href={`/guide/${guide.slug}`} className="result-item">
      <div className="result-meta">
        <span>{guide.level}</span>
      </div>
      <h3>{guide.title}</h3>
      <p>{guide.summary}</p>
    </Link>
  );
}
