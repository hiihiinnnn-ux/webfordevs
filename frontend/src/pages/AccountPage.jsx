import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export function AccountPage() {
  const { user, token, loading, updateProfile } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;
    api('/api/bookmarks', { token })
      .then((data) => setBookmarks(data.items))
      .catch(() => setBookmarks([]));
  }, [token]);

  if (loading) return <div className="container loading-state">Loading account…</div>;
  if (!user) return <Navigate to="/login" replace />;

  async function saveProfile(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProfile({ displayName, bio });
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  }

  return (
    <div className="container">
      <div className="page-hero">
        <span className="eyebrow">Account</span>
        <h1>{user.displayName}</h1>
        <p>
          @{user.username} · {user.email}
        </p>
      </div>

      <div className="dashboard-grid">
        <form className="panel" onSubmit={saveProfile}>
          <h2>Profile</h2>
          {message && <p style={{ color: 'var(--accent-deep)', marginBottom: '0.8rem' }}>{message}</p>}
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label htmlFor="displayName">Display name</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What are you building with local AI?"
            />
          </div>
          <button className="btn btn-accent" type="submit">
            Save profile
          </button>
        </form>

        <div className="panel">
          <h2>Bookmarks</h2>
          {bookmarks.length === 0 ? (
            <div className="empty-state">
              No bookmarks yet. Explore <Link to="/tools">tools</Link> and{' '}
              <Link to="/models">models</Link>.
            </div>
          ) : (
            bookmarks.map((b) => {
              const title = b.item.name || b.item.title;
              const href =
                b.itemType === 'tool'
                  ? `/tools/${b.item.slug}`
                  : b.itemType === 'model'
                    ? `/models/${b.item.slug}`
                    : `/learn/${b.item.slug}`;
              return (
                <Link key={b.id} to={href} className="item-link">
                  <div className="item-meta">
                    <span className="chip">{b.itemType}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{b.item.description || b.item.summary}</p>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
