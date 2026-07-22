import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { BookmarkButton } from '../components/BookmarkButton';
import { Markdown } from '../components/Markdown';

export function ToolDetailPage() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/tools/${slug}`)
      .then((data) => setItem(data.item))
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) return <div className="container page-hero form-error">{error}</div>;
  if (!item) return <div className="container loading-state">Loading tool…</div>;

  return (
    <div className="container detail-layout">
      <div className="detail-main">
        <Link to="/tools" className="eyebrow">
          ← Tools
        </Link>
        <div className="item-meta">
          <span className="chip">{item.category}</span>
          <span className="chip chip-muted">{item.difficulty}</span>
        </div>
        <h1>{item.name}</h1>
        <p className="lede">{item.description}</p>
        <Markdown source={item.longDescription} />
        {item.installHint && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Install hint</h3>
            <code className="install-hint">{item.installHint}</code>
          </div>
        )}
      </div>
      <aside className="side-panel">
        <h3>Details</h3>
        <dl className="side-list">
          <div>
            <dt>Platforms</dt>
            <dd>{item.platforms.join(', ') || '—'}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{item.difficulty}</dd>
          </div>
        </dl>
        <div className="tag-row">
          {item.tags.map((tag) => (
            <span key={tag} className="chip chip-muted">
              {tag}
            </span>
          ))}
        </div>
        <div className="form-actions">
          <BookmarkButton itemType="tool" itemId={item.id} />
          {item.websiteUrl && (
            <a className="btn btn-accent" href={item.websiteUrl} target="_blank" rel="noreferrer">
              Website
            </a>
          )}
          {item.githubUrl && (
            <a className="btn btn-ghost" href={item.githubUrl} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
