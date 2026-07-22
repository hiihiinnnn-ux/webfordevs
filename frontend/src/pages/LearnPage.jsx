import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ItemList } from '../components/ItemList';

export function LearnPage() {
  const [data, setData] = useState(null);
  const [level, setLevel] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (level !== 'all') params.set('level', level);
    api(`/api/guides?${params.toString()}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [level]);

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Learn</span>
        <h1>Introduction to local AI</h1>
        <p>
          Short developer-focused guides: what local AI is, how to pick a stack, quantization, APIs,
          RAG, and IDE workflows.
        </p>
      </div>

      <div className="filters" style={{ marginBottom: '1.5rem' }}>
        {['all', 'intro', 'intermediate'].map((l) => (
          <button
            key={l}
            type="button"
            className={`filter-btn ${level === l ? 'active' : ''}`}
            onClick={() => setLevel(l)}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Loading guides…</div>
      ) : (
        <ItemList items={data?.items} type="guide" />
      )}
    </div>
  );
}
