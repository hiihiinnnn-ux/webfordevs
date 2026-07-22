import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <p className="brand-text footer-brand">Localbench</p>
          <p className="muted">A developer workbench for local AI models, tools, and APIs.</p>
        </div>
        <div className="footer-links">
          <Link href="/explore">Explore catalog</Link>
          <Link href="/guides">Learn local AI</Link>
          <Link href="/api-docs">REST API</Link>
          <Link href="/register">Create account</Link>
        </div>
      </div>
    </footer>
  );
}
