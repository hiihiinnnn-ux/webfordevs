import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { BookmarkButton } from '../components/BookmarkButton';
import { Markdown } from '../components/Markdown';

export function GuideDetailPage() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/guides/${slug}`)
      .then((data) => setItem(data.item))
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) return <div className="container page-hero form-error">{error}</div>;
  if (!item) return <div className="container loading-state">Loading guide…</div>;

  return (
    <div className="container detail-layout">
      <div className="detail-main">
        <Link to="/learn" className="eyebrow">
          ← Learn
        </Link>
        <div className="item-meta">
          <span className="chip">{item.level}</span>
          <span className="chip chip-muted">{item.readingMinutes} min read</span>
        </div>
        <h1>{item.title}</h1>
        <p className="lede">{item.summary}</p>
        <Markdown source={item.body} />
      </div>
      <aside className="side-panel">
        <h3>Tags</h3>
        <div className="tag-row">
          {item.tags.map((tag) => (
            <span key={tag} className="chip chip-muted">
              {tag}
            </span>
          ))}
        </div>
        <BookmarkButton itemType="guide" itemId={item.id} />
      </aside>
    </div>
  );
}
