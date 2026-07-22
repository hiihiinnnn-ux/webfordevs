import { Link } from 'react-router-dom';
import BookmarkButton from './BookmarkButton.jsx';

function formatCount(n) {
  if (!n) return null;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function ToolCard({ tool }) {
  return (
    <article className="card">
      <div className="card-head">
        <span className="chip chip-cat">{tool.category}</span>
        <BookmarkButton type="tool" id={tool.id} />
      </div>
      <Link to={`/tools/${tool.slug}`} className="card-title">
        {tool.name}
      </Link>
      <p className="card-tagline">{tool.tagline}</p>
      <div className="card-tags">
        {tool.tags.slice(0, 3).map((t) => (
          <span key={t} className="chip">{t}</span>
        ))}
      </div>
      <div className="card-foot">
        <span className="platforms">{tool.platforms.join(' · ') || '—'}</span>
        {formatCount(tool.stars) && <span className="stars">★ {formatCount(tool.stars)}</span>}
      </div>
    </article>
  );
}

export function ModelCard({ model }) {
  return (
    <article className="card">
      <div className="card-head">
        <span className={`chip chip-modality modality-${model.modality}`}>{model.modality}</span>
        <BookmarkButton type="model" id={model.id} />
      </div>
      <Link to={`/models/${model.slug}`} className="card-title">
        {model.name}
      </Link>
      <p className="card-tagline">{model.description}</p>
      <div className="card-meta-grid">
        <div><span>Params</span>{model.parameters || '—'}</div>
        <div><span>Context</span>{model.contextLength ? `${(model.contextLength / 1024).toFixed(0)}K` : '—'}</div>
        <div><span>Min RAM</span>{model.minRamGb ? `${model.minRamGb} GB` : '—'}</div>
      </div>
      <div className="card-foot">
        <span className="platforms">{model.publisher}</span>
        {formatCount(model.downloads) && <span className="stars">↓ {formatCount(model.downloads)}</span>}
      </div>
    </article>
  );
}

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export function GuideCard({ guide }) {
  return (
    <article className="card guide-card">
      <div className="card-head">
        <span className={`chip level-${guide.level}`}>{LEVEL_LABEL[guide.level]}</span>
        <BookmarkButton type="guide" id={guide.id} />
      </div>
      <Link to={`/learn/${guide.slug}`} className="card-title">
        {guide.title}
      </Link>
      <p className="card-tagline">{guide.summary}</p>
      <div className="card-foot">
        <span className="platforms">{guide.minutes} min read</span>
        <Link to={`/learn/${guide.slug}`} className="read-link">Read →</Link>
      </div>
    </article>
  );
}
