import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const models = await api.models();

  return (
    <div className="container">
      <div className="page-header">
        <h1>Open Models</h1>
        <p>Compare parameter sizes, VRAM requirements, and use cases for local deployment.</p>
      </div>
      <div className="card-grid">
        {models.map((m) => (
          <article key={m.slug} className="card">
            <span className="card-type type-model">{m.provider}</span>
            <h3>{m.name}</h3>
            <p>
              {m.parameter_size} · {m.context_length} context
              {m.min_vram_gb ? ` · ~${m.min_vram_gb} GB VRAM` : ""}
            </p>
            <p style={{ marginTop: "0.75rem" }}>{m.description}</p>
            <div className="card-tags">
              {m.use_cases.split(",").map((uc) => (
                <span key={uc} className="tag">
                  {uc.trim()}
                </span>
              ))}
              {m.license && <span className="tag">{m.license}</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
