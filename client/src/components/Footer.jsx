import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <span className="brand-mark">◆</span> LocalAI<span className="brand-accent">Hub</span>
          <p className="footer-tag">Your developer’s guide to running AI locally.</p>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Explore</h4>
            <Link to="/tools">Tools</Link>
            <Link to="/models">Models</Link>
            <Link to="/learn">Learn</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/register">Sign up</Link>
            <Link to="/login">Log in</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </div>
      <div className="footer-base">
        Built for developers exploring local AI. Data is illustrative and community-curated.
      </div>
    </footer>
  );
}
