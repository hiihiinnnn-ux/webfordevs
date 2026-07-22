import Link from "next/link";
import { api } from "@/lib/api";
import SearchBar from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [tools, guides, stats] = await Promise.all([
    api.tools(),
    api.guides(),
    api.stats().catch(() => ({ tools: 6, models: 6, frameworks: 5, guides: 5, users: 0 })),
  ]);

  return (
    <>
      <section className="hero container">
        <div className="hero-badge">For developers · Privacy-first · No API keys required</div>
        <h1>
          Your intro to <em>local AI</em> development
        </h1>
        <p>
          Search tools like Ollama and llama.cpp, compare open models, learn RAG basics,
          and build apps that run entirely on your hardware.
        </p>
        <SearchBar />
        <div className="stats-row">
          <div className="stat-card">
            <div className="num">{stats.tools}</div>
            <div className="label">Tools</div>
          </div>
          <div className="stat-card">
            <div className="num">{stats.models}</div>
            <div className="label">Models</div>
          </div>
          <div className="stat-card">
            <div className="num">{stats.frameworks}</div>
            <div className="label">Frameworks</div>
          </div>
          <div className="stat-card">
            <div className="num">{stats.guides}</div>
            <div className="label">Guides</div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-header">
          <h2>Start learning</h2>
          <Link href="/guides">All guides →</Link>
        </div>
        <div className="card-grid">
          {guides.slice(0, 3).map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="card">
              <span className="card-type type-guide">Guide</span>
              <h3>{g.title}</h3>
              <p>{g.summary}</p>
              <div className="card-tags">
                <span className="tag">{g.level}</span>
                <span className="tag">{g.reading_time_minutes} min read</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-header">
          <h2>Popular tools</h2>
          <Link href="/tools">Browse all →</Link>
        </div>
        <div className="card-grid">
          {tools.slice(0, 3).map((t) => (
            <div key={t.slug} className="card">
              <span className="card-type type-tool">Tool</span>
              <h3>{t.name}</h3>
              <p>{t.tagline}</p>
              <div className="card-tags">
                <span className="tag">{t.category}</span>
                <span className="tag">{t.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
