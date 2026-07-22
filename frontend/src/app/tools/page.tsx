import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const tools = await api.tools();

  return (
    <div className="container">
      <div className="page-header">
        <h1>Local AI Tools</h1>
        <p>Runtimes, desktop apps, API servers, and inference engines for your machine.</p>
      </div>
      <div className="card-grid">
        {tools.map((t) => (
          <article key={t.slug} className="card">
            <span className="card-type type-tool">{t.category}</span>
            <h3>{t.name}</h3>
            <p>{t.tagline}</p>
            <p style={{ marginTop: "0.75rem" }}>{t.description}</p>
            <div className="card-tags">
              <span className="tag">{t.difficulty}</span>
              {t.tags.split(",").map((tag) => (
                <span key={tag} className="tag">
                  {tag.trim()}
                </span>
              ))}
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
              {t.website_url && (
                <a href={t.website_url} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              )}
              {t.github_url && (
                <a href={t.github_url} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
