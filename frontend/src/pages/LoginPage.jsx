import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form);
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Could not log in');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth-layout">
      <div className="auth-visual">
        <div>
          <div className="eyebrow" style={{ color: '#3ddc97' }}>
            Welcome back
          </div>
          <h1>Your local stack, remembered.</h1>
          <p>Sign in to access bookmarks and keep exploring tools and models.</p>
        </div>
      </div>
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>Log in</h2>
        <p>Use your email or username.</p>
        {error && <div className="form-error">{error}</div>}
        <div className="field">
          <label htmlFor="login">Email or username</label>
          <input
            id="login"
            required
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="form-actions">
          <button className="btn btn-accent" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Log in'}
          </button>
          <span className="muted-link">
            New here? <Link to="/register">Create an account</Link>
          </span>
        </div>
      </form>
    </div>
  );
}
