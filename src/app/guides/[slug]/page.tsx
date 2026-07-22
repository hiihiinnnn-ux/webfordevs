import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownLite } from "@/components/markdown-lite";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const guide = await prisma.guide.findUnique({ where: { slug } });
  return { title: guide?.title ?? "Guide" };
}

export default async function GuideDetailPage({ params }: Params) {
  const { slug } = await params;
  const guide = await prisma.guide.findUnique({ where: { slug } });
  if (!guide) notFound();

  return (
    <div className="shell detail-panel">
      <div className="page-hero" style={{ paddingBottom: 0 }}>
        <div className="meta-grid">
          <span className="pill">{guide.level}</span>
          <span>{guide.readingMins} min read</span>
        </div>
        <h1>{guide.title}</h1>
        <p className="section-lead">{guide.summary}</p>
        <Link href="/guides" className="btn btn-ghost compact">
          All guides
        </Link>
      </div>
      <MarkdownLite content={guide.content} />
    </div>
  );
}
