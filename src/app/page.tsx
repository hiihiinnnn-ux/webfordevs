import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="shell">
          <div className="hero-copy">
            <p className="hero-brand">Localbench</p>
            <h1>Run AI on your machine—not someone else&apos;s API bill.</h1>
            <p className="hero-lead">
              A developer workbench for discovering local models, runtimes, and patterns with a real
              auth-backed API behind it.
            </p>
            <div className="cta-row">
              <Link href="/explore" className="btn btn-primary">
                Search the catalog
              </Link>
              <Link href="/guides" className="btn btn-ghost">
                Read the intro
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden />
        </div>
      </section>

      <section className="section">
        <div className="shell split-grid">
          <div>
            <h2 className="section-title">Built like a product API</h2>
            <p className="section-lead">
              Localbench is not just marketing copy. Accounts, catalog search, favorites, and guides
              are served by typed REST endpoints with JWT cookies, Zod validation, and SQLite
              persistence.
            </p>
            <div className="cta-row">
              <Link href="/api-docs" className="btn btn-secondary">
                Browse API docs
              </Link>
              <Link href="/register" className="btn btn-ghost">
                Create a free account
              </Link>
            </div>
          </div>
          <div className="stack-list">
            <article className="stack-item" style={{ animationDelay: "40ms" }}>
              <h3>Auth that sticks</h3>
              <p>Register, log in, and keep a session cookie across search and favorites.</p>
            </article>
            <article className="stack-item" style={{ animationDelay: "120ms" }}>
              <h3>Searchable catalog</h3>
              <p>Filter models and tools by tags, category, difficulty, and free-text query.</p>
            </article>
            <article className="stack-item" style={{ animationDelay: "200ms" }}>
              <h3>Guides for local AI</h3>
              <p>Go from “what is local AI?” to OpenAI-compatible localhost APIs in one sitting.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
