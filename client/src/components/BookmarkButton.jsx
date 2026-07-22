import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useBookmarks } from '../context/BookmarksContext.jsx';

export default function BookmarkButton({ type, id, className = '' }) {
  const { user } = useAuth();
  const { isBookmarked, toggle } = useBookmarks();
  const navigate = useNavigate();
  const active = user && isBookmarked(type, id);

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggle(type, id);
  }

  return (
    <button
      className={`bookmark-btn ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      aria-pressed={!!active}
      title={user ? (active ? 'Remove bookmark' : 'Save bookmark') : 'Log in to save'}
    >
      {active ? '★' : '☆'}
    </button>
  );
}
