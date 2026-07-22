import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { ToolCard, ModelCard, GuideCard } from '../components/Cards.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const STEPS = [
  {
    n: '01',
    title: 'Pick a runtime',
    text: 'Install a local runtime like Ollama or LM Studio — it downloads and serves models for you.',
  },
  {
    n: '02',
    title: 'Choose a model',
    text: 'Match a model to your hardware. A 7–8B model runs on most laptops; go bigger with a GPU.',
  },
  {
    n: '03',
    title: 'Call the API',
    text: 'Most runtimes expose an OpenAI-compatible endpoint — change the base URL and your code just works.',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState({ tools: [], models: [], guides: [] });
  const [query, setQuery] = useState('');

  useEffect(() => {
    Promise.all([
      api('/tools', { params: { limit: 3, sort: 'stars' } }),
      api('/models', { params: { limit: 3, sort: 'downloads' } }),
      api('/guides'),
    ])
      .then(([tools, models, guides]) => {
        setFeatured({
          tools: tools.data,
          models: models.data,
          guides: guides.data.slice(0, 3),
        });
      })
      .catch(() => {});
  }, []);

  function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <span className="eyebrow">The developer’s guide to local AI</span>
          <h1>
            Run AI on <span className="grad-text">your own machine</span>.
          </h1>
          <p className="hero-sub">
            LocalAI Hub helps developers get started with private, offline AI — discover the right
            tools, find models that fit your hardware, and learn the whole stack with hands-on guides.
          </p>

          <form className="hero-search" onSubmit={onSearch} role="search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Ollama, Llama 3.1, RAG, quantization…"
              aria-label="Search the hub"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="hero-cta">
            <Link to="/learn/what-is-local-ai" className="btn btn-primary btn-lg">
              Start learning
            </Link>
            <Link to="/tools" className="btn btn-ghost btn-lg">
              Browse tools
            </Link>
          </div>
        </div>
      </section>

      <section className="section steps-section">
        <h2 className="section-title">Get running in three steps</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Popular tools</h2>
          <Link to="/tools" className="see-all">See all →</Link>
        </div>
        <div className="card-grid">
          {featured.tools.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Trending models</h2>
          <Link to="/models" className="see-all">See all →</Link>
        </div>
        <div className="card-grid">
          {featured.models.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Start here</h2>
          <Link to="/learn" className="see-all">All guides →</Link>
        </div>
        <div className="card-grid">
          {featured.guides.map((g) => (
            <GuideCard key={g.id} guide={g} />
          ))}
        </div>
      </section>

      {!user && (
        <section className="section cta-band">
          <div className="cta-inner">
            <h2>Create a free developer account</h2>
            <p>Bookmark tools, models and guides, and build your own local-AI toolkit.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Sign up — it’s free</Link>
          </div>
        </section>
      )}
    </div>
  );
}
