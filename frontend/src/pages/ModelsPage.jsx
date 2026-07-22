import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ItemList } from '../components/ItemList';

export function ModelsPage() {
  const [data, setData] = useState(null);
  const [family, setFamily] = useState('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (family !== 'all') params.set('family', family);
    if (q.trim()) params.set('q', q.trim());
    api(`/api/models?${params.toString()}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [family, q]);

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Models API</span>
        <h1>Local models</h1>
        <p>Small-to-mid instruct, coding, and embedding models that fit developer machines.</p>
      </div>

      <div className="search-panel">
        <input
          className="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter models…"
          aria-label="Filter models"
        />
        <div className="filters">
          <button
            type="button"
            className={`filter-btn ${family === 'all' ? 'active' : ''}`}
            onClick={() => setFamily('all')}
          >
            All
          </button>
          {(data?.facets?.families || []).map((f) => (
            <button
              key={f.family}
              type="button"
              className={`filter-btn ${family === f.family ? 'active' : ''}`}
              onClick={() => setFamily(f.family)}
            >
              {f.family} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading models…</div>
      ) : (
        <ItemList items={data?.items} type="model" />
      )}
    </div>
  );
}
