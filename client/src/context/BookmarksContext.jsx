import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from './AuthContext.jsx';

const BookmarksContext = createContext(null);

const keyOf = (type, id) => `${type}:${id}`;

export function BookmarksProvider({ children }) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api('/bookmarks', { auth: true });
      setBookmarks(data);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const lookup = useMemo(() => {
    const map = new Map();
    for (const b of bookmarks) map.set(keyOf(b.itemType, b.itemId), b);
    return map;
  }, [bookmarks]);

  const isBookmarked = useCallback(
    (type, id) => lookup.has(keyOf(type, id)),
    [lookup],
  );

  const toggle = useCallback(
    async (type, id) => {
      const existing = lookup.get(keyOf(type, id));
      if (existing) {
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
        try {
          await api(`/bookmarks/${existing.id}`, { method: 'DELETE', auth: true });
        } catch {
          refresh();
        }
      } else {
        try {
          const { data } = await api('/bookmarks', {
            method: 'POST',
            auth: true,
            body: { itemType: type, itemId: id },
          });
          setBookmarks((prev) => [data, ...prev]);
        } catch {
          refresh();
        }
      }
    },
    [lookup, refresh],
  );

  const value = useMemo(
    () => ({ bookmarks, loading, isBookmarked, toggle, refresh }),
    [bookmarks, loading, isBookmarked, toggle, refresh],
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarksProvider');
  return ctx;
}
