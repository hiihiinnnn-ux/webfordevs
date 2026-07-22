import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [toolCount, modelCount, guideCount] = await Promise.all([
    prisma.tool.count(),
    prisma.model.count(),
    prisma.guide.count(),
  ]);

  return (
    <>
      <section className="hero">
        <div className="hero-visual" aria-hidden />
        <div className="shell hero-content">
          <h1 className="hero-brand">Ember</h1>
          <p className="hero-copy">
            Run models on your machine. Discover local runtimes, compare open
            weights, and learn the APIs that keep inference on localhost.
          </p>
          <div className="cta-row">
            <Link href="/explore" className="btn primary">
              Search the catalog
            </Link>
            <Link href="/register" className="btn ghost">
              Create a free account
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell split-grid">
          <div>
            <h2>Local AI, explained for builders</h2>
            <p className="section-intro">
              Ember is a developer portal: accounts, bookmarks, and a searchable
              catalog backed by real HTTP APIs — plus a short path from “what is
              local inference?” to your first localhost chat completion.
            </p>
            <ul className="flow-list">
              <li>
                <strong>Pick a runtime</strong>
                <span className="muted">
                  Ollama, LM Studio, llama.cpp, and friends.
                </span>
              </li>
              <li>
                <strong>Choose a model that fits your RAM</strong>
                <span className="muted">
                  Filter by family, size, and minimum memory.
                </span>
              </li>
              <li>
                <strong>Call localhost like any other API</strong>
                <span className="muted">
                  Most stacks speak OpenAI-compatible chat completions.
                </span>
              </li>
            </ul>
          </div>
          <div className="terminal" aria-label="Example local API call">
            <div>
              <span className="prompt">$</span> ollama pull llama3.2:3b
            </div>
            <div>
              <span className="prompt">$</span> curl localhost:11434/api/chat \
            </div>
            <div>
              &nbsp;&nbsp;-d &apos;{`{"model":"llama3.2:3b","messages":[{"role":"user","content":"hi"}]}`}&apos;
            </div>
            <div style={{ marginTop: "1rem", color: "var(--muted)" }}>
              Catalog now: {toolCount} tools · {modelCount} models ·{" "}
              {guideCount} guides
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2>Built with a real backend</h2>
          <p className="section-intro">
            Auth sessions, catalog search, bookmarks, and stats are all served
            from Next.js route handlers over SQLite.
          </p>
          <div className="feature-strip">
            <article>
              <h3>Accounts</h3>
              <p>
                Register and log in with secure password hashes and HTTP-only
                JWT cookies.
              </p>
            </article>
            <article>
              <h3>Search APIs</h3>
              <p>
                Query <code>/api/search</code>, <code>/api/tools</code>, and{" "}
                <code>/api/models</code> with filters.
              </p>
            </article>
            <article>
              <h3>Learning path</h3>
              <p>
                Short guides cover hardware, Ollama, app wiring, and local RAG.
              </p>
            </article>
          </div>
          <div className="cta-row" style={{ marginTop: "2rem" }}>
            <Link href="/guide" className="btn primary">
              Read the intro
            </Link>
            <Link href="/api-docs" className="btn ghost">
              Browse API docs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
