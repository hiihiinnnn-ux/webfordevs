import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { api } from '../lib/api.js';
import { Spinner, ErrorState } from '../components/Common.jsx';
import BookmarkButton from '../components/BookmarkButton.jsx';

marked.setOptions({ gfm: true, breaks: false });

const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export default function GuideDetailPage() {
  const { slug } = useParams();
  const [guide, setGuide] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    api(`/guides/${slug}`)
      .then((r) => {
        if (!active) return;
        setGuide(r.data);
        setStatus('done');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [slug]);

  if (status === 'loading') return <Spinner />;
  if (status === 'error' || !guide) return <ErrorState message="Guide not found." />;

  return (
    <article className="detail article">
      <Link to="/learn" className="back-link">← All guides</Link>
      <div className="article-head">
        <span className={`chip level-${guide.level}`}>{LEVEL_LABEL[guide.level]}</span>
        <span className="dot">·</span>
        <span className="muted">{guide.minutes} min read</span>
        <BookmarkButton type="guide" id={guide.id} className="inline" />
      </div>
      <h1>{guide.title}</h1>
      <p className="article-summary">{guide.summary}</p>
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: marked.parse(guide.body || '') }}
      />
    </article>
  );
}
