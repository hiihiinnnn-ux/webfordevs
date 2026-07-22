import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export function BookmarkButton({ itemType, itemId }) {
  const { user, token } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      setBookmarked(false);
      setBookmarkId(null);
      return;
    }

    let cancelled = false;
    api('/api/bookmarks', { token })
      .then((data) => {
        if (cancelled) return;
        const found = data.items.find((b) => b.itemType === itemType && b.itemId === itemId);
        setBookmarked(Boolean(found));
        setBookmarkId(found?.id ?? null);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user, token, itemType, itemId]);

  if (!user) {
    return (
      <Link className="btn btn-ghost" to="/login">
        Log in to bookmark
      </Link>
    );
  }

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      if (bookmarked && bookmarkId) {
        await api(`/api/bookmarks/${bookmarkId}`, { method: 'DELETE', token });
        setBookmarked(false);
        setBookmarkId(null);
      } else {
        const data = await api('/api/bookmarks', {
          method: 'POST',
          token,
          body: { itemType, itemId },
        });
        setBookmarked(true);
        setBookmarkId(data.bookmark.id);
      }
    } catch {
      // ignore conflicts
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={toggle} disabled={busy}>
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  );
}
