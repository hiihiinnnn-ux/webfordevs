import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Guides" };

export default async function GuidesPage() {
  const guides = await prisma.guide.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="shell">
      <div className="page-hero">
        <h1>Introduction to local AI</h1>
        <p className="section-lead">
          Short, practical guides for developers who want private inference, localhost APIs, and
          RAG without cloud lock-in.
        </p>
      </div>
      <div className="guide-list" style={{ paddingBottom: "4rem" }}>
        {guides.map((guide, index) => (
          <article key={guide.id} className="guide-row">
            <span className="guide-index">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>
                <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
              </h2>
              <p>{guide.summary}</p>
            </div>
            <div className="muted tiny" style={{ textAlign: "right" }}>
              <div>{guide.level}</div>
              <div>{guide.readingMins} min</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
