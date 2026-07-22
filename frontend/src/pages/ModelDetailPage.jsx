import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { BookmarkButton } from '../components/BookmarkButton';
import { Markdown } from '../components/Markdown';

export function ModelDetailPage() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/models/${slug}`)
      .then((data) => setItem(data.item))
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) return <div className="container page-hero form-error">{error}</div>;
  if (!item) return <div className="container loading-state">Loading model…</div>;

  return (
    <div className="container detail-layout">
      <div className="detail-main">
        <Link to="/models" className="eyebrow">
          ← Models
        </Link>
        <div className="item-meta">
          <span className="chip">{item.family}</span>
          {item.parameterSize && <span className="chip chip-muted">{item.parameterSize}</span>}
        </div>
        <h1>{item.name}</h1>
        <p className="lede">{item.description}</p>
        <Markdown source={item.longDescription} />
        {item.ollamaPull && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Ollama</h3>
            <code className="install-hint">{item.ollamaPull}</code>
          </div>
        )}
      </div>
      <aside className="side-panel">
        <h3>Specs</h3>
        <dl className="side-list">
          <div>
            <dt>Quant</dt>
            <dd>{item.quantization || '—'}</dd>
          </div>
          <div>
            <dt>Context</dt>
            <dd>{item.contextLength ? item.contextLength.toLocaleString() : '—'}</dd>
          </div>
          <div>
            <dt>Min VRAM</dt>
            <dd>{item.minVramGb ? `${item.minVramGb} GB` : '—'}</dd>
          </div>
          <div>
            <dt>License</dt>
            <dd>{item.license || '—'}</dd>
          </div>
        </dl>
        <div className="tag-row">
          {item.useCases.map((u) => (
            <span key={u} className="chip">
              {u}
            </span>
          ))}
          {item.tags.map((tag) => (
            <span key={tag} className="chip chip-muted">
              {tag}
            </span>
          ))}
        </div>
        <div className="form-actions">
          <BookmarkButton itemType="model" itemId={item.id} />
          {item.huggingfaceUrl && (
            <a className="btn btn-accent" href={item.huggingfaceUrl} target="_blank" rel="noreferrer">
              Hugging Face
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
