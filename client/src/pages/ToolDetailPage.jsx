import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Spinner, ErrorState } from '../components/Common.jsx';
import BookmarkButton from '../components/BookmarkButton.jsx';

export default function ToolDetailPage() {
  const { slug } = useParams();
  const [tool, setTool] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    api(`/tools/${slug}`)
      .then((r) => {
        if (!active) return;
        setTool(r.data);
        setStatus('done');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [slug]);

  if (status === 'loading') return <Spinner />;
  if (status === 'error' || !tool) return <ErrorState message="Tool not found." />;

  return (
    <div className="detail">
      <Link to="/tools" className="back-link">← All tools</Link>
      <div className="detail-header">
        <div>
          <div className="detail-title-row">
            <h1>{tool.name}</h1>
            <BookmarkButton type="tool" id={tool.id} className="inline" />
          </div>
          <p className="detail-tagline">{tool.tagline}</p>
          <div className="card-tags">
            <span className="chip chip-cat">{tool.category}</span>
            {tool.tags.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <h2>About</h2>
          <p className="detail-desc">{tool.description}</p>
          <div className="detail-actions">
            {tool.homepage && (
              <a className="btn btn-primary" href={tool.homepage} target="_blank" rel="noreferrer">
                Visit website ↗
              </a>
            )}
            {tool.repoUrl && (
              <a className="btn btn-ghost" href={tool.repoUrl} target="_blank" rel="noreferrer">
                Source code ↗
              </a>
            )}
          </div>
        </div>
        <aside className="detail-side">
          <h3>Details</h3>
          <dl className="spec-list">
            <div><dt>Category</dt><dd>{tool.category}</dd></div>
            <div><dt>Platforms</dt><dd>{tool.platforms.join(', ') || '—'}</dd></div>
            <div><dt>License</dt><dd>{tool.license || '—'}</dd></div>
            {tool.stars > 0 && (
              <div><dt>GitHub stars</dt><dd>★ {tool.stars.toLocaleString()}</dd></div>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
