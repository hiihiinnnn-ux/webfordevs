import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [details, setDetails] = useState([]);
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setDetails([]);
    setBusy(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      if (err.details) setDetails(err.details);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-sub">Join to bookmark tools, models and guides for your local-AI stack.</p>
        {error && <div className="form-error">{error}</div>}
        {details.length > 0 && (
          <ul className="form-error-list">
            {details.map((d) => (
              <li key={d.field}>{d.message}</li>
            ))}
          </ul>
        )}
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Username
            <input
              type="text"
              value={form.username}
              onChange={update('username')}
              autoComplete="username"
              placeholder="e.g. ada_dev"
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p className="auth-alt">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
