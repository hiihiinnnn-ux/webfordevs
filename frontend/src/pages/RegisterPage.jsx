import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register({
        email: form.email,
        username: form.username,
        displayName: form.displayName || form.username,
        password: form.password,
      });
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Could not create account');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth-layout">
      <div className="auth-visual">
        <div>
          <div className="eyebrow" style={{ color: '#3ddc97' }}>
            Join Loci
          </div>
          <h1>Build your local AI bookshelf.</h1>
          <p>Save tools and models, track what you want to try, and learn the on-device stack.</p>
        </div>
      </div>
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>Create account</h2>
        <p>Free developer accounts with JWT-secured bookmarks.</p>
        {error && <div className="form-error">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            required
            minLength={3}
            pattern="[A-Za-z0-9_]+"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="form-actions">
          <button className="btn btn-accent" type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
          <span className="muted-link">
            Already have one? <Link to="/login">Log in</Link>
          </span>
        </div>
      </form>
    </div>
  );
}
