import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { ModelCard } from '../components/Cards.jsx';
import { Spinner, EmptyState, ErrorState, Pagination } from '../components/Common.jsx';
import { useDebounced } from '../lib/useDebounced.js';

const RAM_OPTIONS = [
  { value: '', label: 'Any RAM' },
  { value: '4', label: '≤ 4 GB' },
  { value: '8', label: '≤ 8 GB' },
  { value: '16', label: '≤ 16 GB' },
  { value: '32', label: '≤ 32 GB' },
];
const SORTS = [
  { value: 'downloads', label: 'Most downloaded' },
  { value: 'ram', label: 'Lowest RAM' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'newest', label: 'Newest' },
];

export default function ModelsPage() {
  const [q, setQ] = useState('');
  const [modality, setModality] = useState('');
  const [family, setFamily] = useState('');
  const [maxRam, setMaxRam] = useState('');
  const [sort, setSort] = useState('downloads');
  const [page, setPage] = useState(1);

  const [facets, setFacets] = useState({ modalities: [], families: [] });
  const [result, setResult] = useState({ data: [], pagination: { pages: 1 } });
  const [status, setStatus] = useState('loading');

  const debouncedQ = useDebounced(q, 350);

  useEffect(() => {
    api('/models/facets')
      .then((r) => setFacets(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, modality, family, maxRam, sort]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    api('/models', {
      params: { q: debouncedQ, modality, family, maxRam, sort, page, limit: 12 },
    })
      .then((r) => {
        if (!active) return;
        setResult(r);
        setStatus('done');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [debouncedQ, modality, family, maxRam, sort, page]);

  const total = result.pagination?.total ?? 0;
  const activeFilters = useMemo(
    () => Boolean(q || modality || family || maxRam),
    [q, modality, family, maxRam],
  );

  return (
    <div className="listing">
      <header className="listing-header">
        <h1>Models</h1>
        <p>Open models you can download and run locally — filter by modality and hardware.</p>
      </header>

      <div className="filters">
        <input
          className="filter-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search models…"
        />
        <select value={modality} onChange={(e) => setModality(e.target.value)}>
          <option value="">All modalities</option>
          {facets.modalities.map((m) => (
            <option key={m.value} value={m.value}>
              {m.value} ({m.count})
            </option>
          ))}
        </select>
        <select value={family} onChange={(e) => setFamily(e.target.value)}>
          <option value="">All families</option>
          {facets.families.map((f) => (
            <option key={f.value} value={f.value}>
              {f.value} ({f.count})
            </option>
          ))}
        </select>
        <select value={maxRam} onChange={(e) => setMaxRam(e.target.value)}>
          {RAM_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
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
          {total} {total === 1 ? 'model' : 'models'}
          {activeFilters && (
            <button
              className="clear-filters"
              onClick={() => {
                setQ('');
                setModality('');
                setFamily('');
                setMaxRam('');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {status === 'loading' && <Spinner />}
      {status === 'error' && <ErrorState message="Couldn’t load models." />}
      {status === 'done' && result.data.length === 0 && (
        <EmptyState title="No models found" message="Try a different search or clear the filters." />
      )}
      {status === 'done' && result.data.length > 0 && (
        <>
          <div className="card-grid">
            {result.data.map((m) => (
              <ModelCard key={m.id} model={m} />
            ))}
          </div>
          <Pagination page={page} pages={result.pagination.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
