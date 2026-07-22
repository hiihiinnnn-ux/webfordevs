import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeModel, serializeTool } from "@/lib/api";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: { tool: true, model: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="shell">
      <div className="page-head">
        <h1>Hey, {user.name}</h1>
        <p>
          Your developer account on Ember. Bookmark local tools and models from
          detail pages, then find them here.
        </p>
      </div>
      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <h2>Profile</h2>
          <p className="muted">Email: {user.email}</p>
          <p className="muted">
            Bio: {user.bio?.trim() ? user.bio : "No bio yet — add one via PATCH /api/auth/profile."}
          </p>
          <div className="cta-row" style={{ marginTop: "1rem" }}>
            <Link href="/explore" className="btn primary">
              Search catalog
            </Link>
            <Link href="/guide" className="btn ghost">
              Continue learning
            </Link>
          </div>
        </section>
        <section className="dashboard-panel">
          <h2>Bookmarks</h2>
          {bookmarks.length === 0 ? (
            <p className="muted">
              Nothing saved yet. Open a tool or model and hit Bookmark.
            </p>
          ) : (
            <div className="result-grid" style={{ gridTemplateColumns: "1fr" }}>
              {bookmarks.map((bookmark) => {
                if (bookmark.tool) {
                  const tool = serializeTool(bookmark.tool);
                  return (
                    <Link
                      key={bookmark.id}
                      href={`/tools/${tool.slug}`}
                      className="result-item"
                    >
                      <div className="result-meta">
                        <span>tool</span>
                        <span>{tool.category}</span>
                      </div>
                      <h3>{tool.name}</h3>
                      <p>{tool.description}</p>
                    </Link>
                  );
                }
                if (bookmark.model) {
                  const model = serializeModel(bookmark.model);
                  return (
                    <Link
                      key={bookmark.id}
                      href={`/models/${model.slug}`}
                      className="result-item"
                    >
                      <div className="result-meta">
                        <span>model</span>
                        <span>{model.family}</span>
                      </div>
                      <h3>{model.name}</h3>
                      <p>{model.description}</p>
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
