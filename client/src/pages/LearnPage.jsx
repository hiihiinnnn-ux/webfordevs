import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { GuideCard } from '../components/Cards.jsx';
import { Spinner, EmptyState, ErrorState } from '../components/Common.jsx';
import { useDebounced } from '../lib/useDebounced.js';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function LearnPage() {
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('');
  const [guides, setGuides] = useState([]);
  const [status, setStatus] = useState('loading');
  const debouncedQ = useDebounced(q, 300);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    api('/guides', { params: { q: debouncedQ, level } })
      .then((r) => {
        if (!active) return;
        setGuides(r.data);
        setStatus('done');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [debouncedQ, level]);

  return (
    <div className="listing">
      <header className="listing-header">
        <h1>Learn local AI</h1>
        <p>Hands-on guides that take you from “what is local AI?” to serving and fine-tuning models.</p>
      </header>

      <div className="filters">
        <input
          className="filter-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search guides…"
        />
        <div className="level-tabs">
          <button className={level === '' ? 'active' : ''} onClick={() => setLevel('')}>
            All
          </button>
          {LEVELS.map((l) => (
            <button key={l} className={level === l ? 'active' : ''} onClick={() => setLevel(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' && <Spinner />}
      {status === 'error' && <ErrorState message="Couldn’t load guides." />}
      {status === 'done' && guides.length === 0 && <EmptyState title="No guides found" />}
      {status === 'done' && guides.length > 0 && (
        <div className="card-grid">
          {guides.map((g) => (
            <GuideCard key={g.id} guide={g} />
          ))}
        </div>
      )}
    </div>
  );
}
