import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Spinner, ErrorState } from '../components/Common.jsx';
import BookmarkButton from '../components/BookmarkButton.jsx';

export default function ModelDetailPage() {
  const { slug } = useParams();
  const [model, setModel] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    api(`/models/${slug}`)
      .then((r) => {
        if (!active) return;
        setModel(r.data);
        setStatus('done');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [slug]);

  if (status === 'loading') return <Spinner />;
  if (status === 'error' || !model) return <ErrorState message="Model not found." />;

  const ctx = model.contextLength ? `${model.contextLength.toLocaleString()} tokens` : '—';

  return (
    <div className="detail">
      <Link to="/models" className="back-link">← All models</Link>
      <div className="detail-header">
        <div>
          <div className="detail-title-row">
            <h1>{model.name}</h1>
            <BookmarkButton type="model" id={model.id} className="inline" />
          </div>
          <p className="detail-tagline">{model.description}</p>
          <div className="card-tags">
            <span className={`chip chip-modality modality-${model.modality}`}>{model.modality}</span>
            {model.tags.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <h2>Run it locally</h2>
          <p className="detail-desc">
            Most local runtimes can pull this model directly. With Ollama, for example:
          </p>
          <pre className="code-block">
            <code>ollama run {model.slug.split('-')[0]}</code>
          </pre>
          <p className="muted small">
            Exact model names vary by runtime and quantization — check the publisher’s page for the
            precise tag.
          </p>
          <div className="quant-block">
            <h3>Available quantizations</h3>
            <div className="card-tags">
              {model.quantizations.length
                ? model.quantizations.map((qz) => <span key={qz} className="chip">{qz}</span>)
                : <span className="muted">—</span>}
            </div>
          </div>
        </div>
        <aside className="detail-side">
          <h3>Specs</h3>
          <dl className="spec-list">
            <div><dt>Family</dt><dd>{model.family || '—'}</dd></div>
            <div><dt>Publisher</dt><dd>{model.publisher || '—'}</dd></div>
            <div><dt>Parameters</dt><dd>{model.parameters || '—'}</dd></div>
            <div><dt>Context length</dt><dd>{ctx}</dd></div>
            <div><dt>Modality</dt><dd>{model.modality}</dd></div>
            <div><dt>Min RAM</dt><dd>{model.minRamGb ? `${model.minRamGb} GB` : '—'}</dd></div>
            <div><dt>License</dt><dd>{model.license || '—'}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
