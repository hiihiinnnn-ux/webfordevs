import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ItemList } from '../components/ItemList';

export function ToolsPage() {
  const [data, setData] = useState(null);
  const [category, setCategory] = useState('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (q.trim()) params.set('q', q.trim());
    api(`/api/tools?${params.toString()}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, q]);

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Tools API</span>
        <h1>Local AI tools</h1>
        <p>Runtimes, UIs, IDE plugins, and libraries that help you run and ship with on-device models.</p>
      </div>

      <div className="search-panel">
        <input
          className="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter tools…"
          aria-label="Filter tools"
        />
        <div className="filters">
          <button
            type="button"
            className={`filter-btn ${category === 'all' ? 'active' : ''}`}
            onClick={() => setCategory('all')}
          >
            All
          </button>
          {(data?.facets?.categories || []).map((c) => (
            <button
              key={c.category}
              type="button"
              className={`filter-btn ${category === c.category ? 'active' : ''}`}
              onClick={() => setCategory(c.category)}
            >
              {c.category} ({c.count})
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="loading-state">Loading tools…</div> : <ItemList items={data?.items} type="tool" />}
    </div>
  );
}
