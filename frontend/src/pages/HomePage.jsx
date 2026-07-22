import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ItemList } from '../components/ItemList';

export function HomePage() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api('/api/stats/overview').then(setOverview).catch(() => setOverview(null));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-stage" aria-hidden="true" />
        <div className="container hero-content">
          <div className="hero-brand">
            Loc<em>i</em>
          </div>
          <h1>Local AI, introduced for developers.</h1>
          <p>
            Run models on your machine. Search runtimes, GGUF models, and practical guides — then
            wire them into real apps with local APIs.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary">
              Create a free account
            </Link>
            <Link to="/search" className="btn btn-ghost">
              Search the catalog
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Start here</span>
              <h2>Three steps to your first local stack</h2>
            </div>
            <p>Skip the cloud bill. Learn the runtime → model → API loop on hardware you control.</p>
          </div>
          <div className="path-steps">
            <div className="path-step">
              <div>
                <h3>Install a runtime</h3>
                <p>Ollama or LM Studio get you chatting and serving in minutes.</p>
              </div>
            </div>
            <div className="path-step">
              <div>
                <h3>Pull a small model</h3>
                <p>Begin with 3B–8B Q4 models so your laptop stays responsive.</p>
              </div>
            </div>
            <div className="path-step">
              <div>
                <h3>Call the local API</h3>
                <p>Point OpenAI-compatible clients at localhost and ship features privately.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Guides</span>
              <h2>Learn the fundamentals</h2>
            </div>
            <Link to="/learn" className="btn btn-ghost btn-small">
              All guides
            </Link>
          </div>
          <ItemList items={overview?.starterGuides || []} type="guide" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Catalog</span>
              <h2>Featured tools</h2>
            </div>
            <Link to="/tools" className="btn btn-ghost btn-small">
              Browse tools
            </Link>
          </div>
          <ItemList items={overview?.featuredTools || []} type="tool" />
        </div>
      </section>

      <section className="section" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Models</span>
              <h2>Featured local models</h2>
            </div>
            <Link to="/models" className="btn btn-ghost btn-small">
              Browse models
            </Link>
          </div>
          <ItemList items={overview?.featuredModels || []} type="model" />
          {overview && (
            <p className="results-meta" style={{ marginTop: '1.5rem' }}>
              Catalog: {overview.counts.tools} tools · {overview.counts.models} models ·{' '}
              {overview.counts.guides} guides · {overview.counts.users} developers
            </p>
          )}
        </div>
      </section>
    </>
  );
}
