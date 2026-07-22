"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { FavoriteButton } from "@/components/favorite-button";

type FavItem = {
  favoriteId: string;
  item:
    | {
        type: "model";
        id: string;
        slug: string;
        name: string;
        description: string;
        vendor: string;
      }
    | {
        type: "tool";
        id: string;
        slug: string;
        name: string;
        description: string;
        category: string;
      };
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<FavItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setItems(data.items ?? []);
      } catch {
        setError("Could not load favorites.");
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="shell page-hero">
        <p className="muted">Loading session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="shell page-hero">
        <h1>Your bench</h1>
        <p className="section-lead">Log in to see saved models and tools.</p>
        <div className="cta-row">
          <Link href="/login" className="btn btn-primary">
            Log in
          </Link>
          <Link href="/register" className="btn btn-ghost">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="page-hero">
        <h1>Hey {user.displayName || user.username}</h1>
        <p className="section-lead">
          Saved items from the catalog, backed by <code className="inline-code">GET /api/favorites</code>.
        </p>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="dashboard-grid">
        {items.length === 0 ? (
          <p className="empty-state">
            Nothing saved yet. <Link href="/explore">Explore the catalog</Link> and hit Save.
          </p>
        ) : (
          items.map((fav) => (
            <article key={fav.favoriteId} className="result-row">
              <div className="result-main">
                <div className="result-kicker">
                  <span className="pill">{fav.item.type}</span>
                  <span className="muted tiny">
                    {fav.item.type === "model" ? fav.item.vendor : fav.item.category}
                  </span>
                </div>
                <h3>
                  <Link
                    href={
                      fav.item.type === "model"
                        ? `/explore/models/${fav.item.slug}`
                        : `/explore/tools/${fav.item.slug}`
                    }
                  >
                    {fav.item.name}
                  </Link>
                </h3>
                <p>{fav.item.description}</p>
              </div>
              <FavoriteButton itemType={fav.item.type} itemId={fav.item.id} initiallySaved />
            </article>
          ))
        )}
      </div>
    </div>
  );
}
