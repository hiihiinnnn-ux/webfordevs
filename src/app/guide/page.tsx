import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Guide",
  description: "An introduction to local AI for developers.",
};

export const dynamic = "force-dynamic";

export default async function GuideIndexPage() {
  const guides = await prisma.guide.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="shell">
      <div className="page-head">
        <h1>Introduction to local AI</h1>
        <p>
          A short curriculum for developers: what local inference is, how to
          stand up a server, how hardware fits, and how to wire models into
          apps.
        </p>
      </div>
      <div className="guide-list">
        {guides.map((guide) => (
          <Link key={guide.id} href={`/guide/${guide.slug}`}>
            <div className="result-meta">
              <span>{guide.level}</span>
              <span>Lesson {guide.sortOrder}</span>
            </div>
            <h2>{guide.title}</h2>
            <p className="muted">{guide.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
