import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { ToolCard, ModelCard, GuideCard } from '../components/Cards.jsx';
import { Spinner, EmptyState, ErrorState } from '../components/Common.jsx';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [input, setInput] = useState(q);
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    setInput(q);
    if (!q) {
      setStatus('idle');
      setResults(null);
      return;
    }
    let active = true;
    setStatus('loading');
    api('/search', { params: { q, limit: 12 } })
      .then((r) => {
        if (!active) return;
        setResults(r);
        setStatus('done');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [q]);

  function onSubmit(e) {
    e.preventDefault();
    const next = input.trim();
    if (next) setSearchParams({ q: next });
  }

  const tools = results?.results?.tools ?? [];
  const models = results?.results?.models ?? [];
  const guides = results?.results?.guides ?? [];

  return (
    <div className="listing">
      <header className="listing-header">
        <h1>Search</h1>
        <p>Search across every tool, model and guide in the hub.</p>
      </header>

      <form className="filters" onSubmit={onSubmit} role="search">
        <input
          className="filter-search"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search everything…"
          autoFocus
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {status === 'idle' && <EmptyState title="Search the hub" message="Try “ollama”, “7B”, “RAG” or “quantization”." />}
      {status === 'loading' && <Spinner />}
      {status === 'error' && <ErrorState message="Search failed." />}

      {status === 'done' && (
        <div className="search-results">
          <p className="result-meta">
            {results.total} result{results.total === 1 ? '' : 's'} for “{q}”
          </p>

          {results.total === 0 && (
            <EmptyState title="No matches" message="Try a broader or different search term." />
          )}

          {tools.length > 0 && (
            <section className="search-group">
              <h2 className="section-title">Tools</h2>
              <div className="card-grid">
                {tools.map((t) => <ToolCard key={t.id} tool={t} />)}
              </div>
            </section>
          )}
          {models.length > 0 && (
            <section className="search-group">
              <h2 className="section-title">Models</h2>
              <div className="card-grid">
                {models.map((m) => <ModelCard key={m.id} model={m} />)}
              </div>
            </section>
          )}
          {guides.length > 0 && (
            <section className="search-group">
              <h2 className="section-title">Guides</h2>
              <div className="card-grid">
                {guides.map((g) => <GuideCard key={g.id} guide={g} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
