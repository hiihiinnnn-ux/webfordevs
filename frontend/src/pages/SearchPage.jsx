import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') || '';
  const initialType = params.get('type') || 'all';
  const [q, setQ] = useState(initialQ);
  const [type, setType] = useState(initialType);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const types = useMemo(
    () => [
      { id: 'all', label: 'All' },
      { id: 'tool', label: 'Tools' },
      { id: 'model', label: 'Models' },
      { id: 'guide', label: 'Guides' },
    ],
    []
  );

  useEffect(() => {
    setQ(params.get('q') || '');
    setType(params.get('type') || 'all');
  }, [params]);

  useEffect(() => {
    const query = params.get('q');
    if (!query) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    const typeParam = params.get('type') || 'all';
    api(`/api/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(typeParam)}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Search failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  function submit(event) {
    event.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set('q', q.trim());
    if (type && type !== 'all') next.set('type', type);
    setParams(next);
  }

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Search API</span>
        <h1>Find tools, models, and guides</h1>
        <p>
          Unified search across the Loci catalog — the same endpoint your apps can call at{' '}
          <code className="inline-code">GET /api/search?q=...</code>
        </p>
      </div>

      <form className="search-panel" onSubmit={submit}>
        <div className="search-row">
          <input
            className="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try ollama, GGUF, RAG, coding model…"
            aria-label="Search query"
          />
          <button className="btn btn-accent" type="submit">
            Search
          </button>
        </div>
        <div className="filters">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`filter-btn ${type === t.id ? 'active' : ''}`}
              onClick={() => setType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </form>

      {error && <div className="form-error">{error}</div>}
      {loading && <div className="loading-state">Searching…</div>}

      {!loading && data && (
        <>
          <div className="results-meta">
            {data.total} result{data.total === 1 ? '' : 's'} for “{data.query}”
          </div>
          {data.results.length === 0 ? (
            <div className="empty-state">No matches. Try a broader term like “runtime” or “llama”.</div>
          ) : (
            data.results.map((result) => {
              const item = result.item;
              const title = item.name || item.title;
              const href =
                result.type === 'tool'
                  ? `/tools/${item.slug}`
                  : result.type === 'model'
                    ? `/models/${item.slug}`
                    : `/learn/${item.slug}`;
              return (
                <Link key={`${result.type}-${item.id}`} to={href} className="result-row item-link">
                  <div className="result-type">{result.type}</div>
                  <div>
                    <h3>{title}</h3>
                    <p>{item.description || item.summary}</p>
                  </div>
                  <div className="chip chip-muted">score {result.score}</div>
                </Link>
              );
            })
          )}
        </>
      )}

      {!loading && !data && !error && (
        <div className="empty-state">Enter a query to explore the local AI catalog.</div>
      )}
    </div>
  );
}
