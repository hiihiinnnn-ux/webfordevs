import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorite-button";
import { serializeTool } from "@/lib/catalog";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({ where: { slug } });
  return { title: tool?.name ?? "Tool" };
}

export default async function ToolDetailPage({ params }: Params) {
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({ where: { slug } });
  if (!tool) notFound();
  const item = serializeTool(tool);

  return (
    <div className="shell detail-panel">
      <div className="page-hero" style={{ paddingBottom: 0 }}>
        <p className="pill">tool</p>
        <h1>{item.name}</h1>
        <p className="section-lead">{item.description}</p>
        <div className="meta-grid">
          <span>Category: {item.category}</span>
          <span>Difficulty: {item.difficulty}</span>
          <span>Platforms: {item.platforms.join(", ")}</span>
        </div>
        <div className="cta-row" style={{ marginTop: "1.25rem" }}>
          <FavoriteButton itemType="tool" itemId={item.id} />
          {item.website ? (
            <a className="btn btn-primary compact" href={item.website} target="_blank" rel="noreferrer">
              Website
            </a>
          ) : null}
          {item.github ? (
            <a className="btn btn-ghost compact" href={item.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          ) : null}
          <Link href="/explore" className="btn btn-ghost compact">
            Back to explore
          </Link>
        </div>
        <div className="tag-row">
          {item.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
