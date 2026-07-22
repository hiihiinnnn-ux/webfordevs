"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, Favorite } from "@/lib/api";

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    api
      .favorites(token)
      .then(setFavorites)
      .finally(() => setLoading(false));
  }, [token, authLoading, router]);

  async function removeFavorite(id: number) {
    if (!token) return;
    await api.removeFavorite(token, id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  if (authLoading || !user) {
    return <div className="container empty">Loading…</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Hey, {user.display_name || user.username}</h1>
        <p>Your saved tools, models, frameworks, and guides.</p>
      </div>

      {loading && <p className="empty">Loading favorites…</p>}

      {!loading && favorites.length === 0 && (
        <div className="empty">
          <p>No favorites yet. Try searching the catalog!</p>
          <Link href="/search" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-flex" }}>
            Search catalog
          </Link>
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="card-grid">
          {favorites.map((f) => (
            <div key={f.id} className="card">
              <span className={`card-type type-${f.item_type}`}>{f.item_type}</span>
              <h3>{f.item.name || f.item.title}</h3>
              <p>{f.item.tagline || f.item.summary || f.item.provider || f.item.language}</p>
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: "0.75rem" }}
                onClick={() => removeFavorite(f.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <section className="section">
        <h2 style={{ marginBottom: "1rem" }}>Quick links</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/guides/first-model-ollama" className="btn btn-ghost">
            Run your first model
          </Link>
          <Link href="/tools" className="btn btn-ghost">
            Browse tools
          </Link>
          <Link href="/models" className="btn btn-ghost">
            Compare models
          </Link>
        </div>
      </section>
    </div>
  );
}
