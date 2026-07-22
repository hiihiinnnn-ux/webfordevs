import Link from "next/link";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const guides = await api.guides();

  return (
    <div className="container">
      <div className="page-header">
        <h1>Learning Guides</h1>
        <p>Step-by-step introductions to local AI — from your first Ollama model to RAG pipelines.</p>
      </div>
      <div className="card-grid">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card">
            <span className="card-type type-guide">Guide</span>
            <h3>{g.title}</h3>
            <p>{g.summary}</p>
            <div className="card-tags">
              <span className="tag">{g.level}</span>
              <span className="tag">{g.reading_time_minutes} min</span>
              {g.tags.split(",").slice(0, 3).map((t) => (
                <span key={t} className="tag">
                  {t.trim()}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
