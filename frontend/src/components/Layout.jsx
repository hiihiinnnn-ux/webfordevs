import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container nav">
          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            Loc<span>i</span>
          </Link>

          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <NavLink to="/learn" onClick={() => setMenuOpen(false)}>
              Learn
            </NavLink>
            <NavLink to="/tools" onClick={() => setMenuOpen(false)}>
              Tools
            </NavLink>
            <NavLink to="/models" onClick={() => setMenuOpen(false)}>
              Models
            </NavLink>
            <NavLink to="/search" onClick={() => setMenuOpen(false)}>
              Search
            </NavLink>
            {user && (
              <NavLink to="/account" onClick={() => setMenuOpen(false)}>
                Account
              </NavLink>
            )}
          </nav>

          <div className="nav-actions">
            {user ? (
              <>
                <span className="chip chip-muted">@{user.username}</span>
                <button type="button" className="btn btn-ghost btn-small" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-small">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-accent btn-small">
                  Create account
                </Link>
              </>
            )}
            <button
              type="button"
              className="menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="site-footer">
        <div className="container">
          <div>
            <strong>Loci</strong> — local AI, for builders.
          </div>
          <div>REST API at <code className="inline-code">/api</code> · SQLite · JWT auth</div>
        </div>
      </footer>
    </div>
  );
}
