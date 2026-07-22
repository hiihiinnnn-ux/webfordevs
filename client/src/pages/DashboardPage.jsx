import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useBookmarks } from '../context/BookmarksContext.jsx';
import { ToolCard, ModelCard, GuideCard } from '../components/Cards.jsx';
import { Spinner, EmptyState } from '../components/Common.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const { bookmarks, loading } = useBookmarks();

  const grouped = useMemo(() => {
    const g = { tool: [], model: [], guide: [] };
    for (const b of bookmarks) {
      if (b.item) g[b.itemType]?.push(b.item);
    }
    return g;
  }, [bookmarks]);

  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '';

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h1>Hi, {user?.username} 👋</h1>
          <p className="muted">Your saved local-AI toolkit{joined && ` · member since ${joined}`}.</p>
        </div>
        <div className="dash-stats">
          <div className="stat"><span>{grouped.tool.length}</span>Tools</div>
          <div className="stat"><span>{grouped.model.length}</span>Models</div>
          <div className="stat"><span>{grouped.guide.length}</span>Guides</div>
        </div>
      </header>

      {loading && <Spinner />}

      {!loading && bookmarks.length === 0 && (
        <EmptyState
          title="No bookmarks yet"
          message="Browse the hub and tap the ☆ on anything you want to save."
        />
      )}

      {!loading && grouped.tool.length > 0 && (
        <section className="section">
          <h2 className="section-title">Saved tools</h2>
          <div className="card-grid">
            {grouped.tool.map((t) => <ToolCard key={t.id} tool={t} />)}
          </div>
        </section>
      )}

      {!loading && grouped.model.length > 0 && (
        <section className="section">
          <h2 className="section-title">Saved models</h2>
          <div className="card-grid">
            {grouped.model.map((m) => <ModelCard key={m.id} model={m} />)}
          </div>
        </section>
      )}

      {!loading && grouped.guide.length > 0 && (
        <section className="section">
          <h2 className="section-title">Saved guides</h2>
          <div className="card-grid">
            {grouped.guide.map((g) => <GuideCard key={g.id} guide={g} />)}
          </div>
        </section>
      )}

      {!loading && bookmarks.length === 0 && (
        <div className="dash-links">
          <Link to="/tools" className="btn btn-ghost">Browse tools</Link>
          <Link to="/models" className="btn btn-ghost">Browse models</Link>
          <Link to="/learn" className="btn btn-ghost">Read guides</Link>
        </div>
      )}
    </div>
  );
}
