import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <p className="brand-inline">Ember</p>
          <p className="muted">
            A developer portal for local AI runtimes, models, and on-device
            workflows.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/explore">Search catalog</Link>
          <Link href="/guide">Start learning</Link>
          <Link href="/api-docs">HTTP API</Link>
          <Link href="/register">Join</Link>
        </div>
      </div>
    </footer>
  );
}
