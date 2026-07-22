import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { ToolCard } from '../components/Cards.jsx';
import { Spinner, EmptyState, ErrorState, Pagination } from '../components/Common.jsx';
import { useDebounced } from '../lib/useDebounced.js';

const PLATFORMS = ['macos', 'linux', 'windows'];
const SORTS = [
  { value: 'stars', label: 'Most popular' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'newest', label: 'Newest' },
];

export default function ToolsPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState('');
  const [sort, setSort] = useState('stars');
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ data: [], pagination: { pages: 1 } });
  const [status, setStatus] = useState('loading');

  const debouncedQ = useDebounced(q, 350);

  useEffect(() => {
    api('/tools/categories')
      .then((r) => setCategories(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, category, platform, sort]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    api('/tools', { params: { q: debouncedQ, category, platform, sort, page, limit: 12 } })
      .then((r) => {
        if (!active) return;
        setResult(r);
        setStatus('done');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [debouncedQ, category, platform, sort, page]);

  const total = result.pagination?.total ?? 0;
  const activeFilters = useMemo(
    () => Boolean(q || category || platform),
    [q, category, platform],
  );

  return (
    <div className="listing">
      <header className="listing-header">
        <h1>Tools</h1>
        <p>Runtimes, desktop apps, UIs and dev tools for running AI locally.</p>
      </header>

      <div className="filters">
        <input
          className="filter-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tools…"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category} ({c.count})
            </option>
          ))}
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {status === 'done' && (
        <div className="result-meta">
          {total} {total === 1 ? 'tool' : 'tools'}
          {activeFilters && (
            <button
              className="clear-filters"
              onClick={() => {
                setQ('');
                setCategory('');
                setPlatform('');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {status === 'loading' && <Spinner />}
      {status === 'error' && <ErrorState message="Couldn’t load tools." />}
      {status === 'done' && result.data.length === 0 && (
        <EmptyState title="No tools found" message="Try a different search or clear the filters." />
      )}
      {status === 'done' && result.data.length > 0 && (
        <>
          <div className="card-grid">
            {result.data.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
          <Pagination page={page} pages={result.pagination.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
