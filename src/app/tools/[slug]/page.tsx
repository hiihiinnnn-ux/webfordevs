import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkButton } from "@/components/BookmarkButton";
import { getSessionUser } from "@/lib/auth";
import { parseTags } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({ where: { slug } });
  return {
    title: tool?.name ?? "Tool",
    description: tool?.description,
  };
}

export default async function ToolDetailPage({ params }: Params) {
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({ where: { slug } });
  if (!tool) notFound();

  const user = await getSessionUser();
  const bookmark = user
    ? await prisma.bookmark.findFirst({
        where: { userId: user.id, toolId: tool.id },
      })
    : null;

  const tags = parseTags(tool.tags);
  const platforms = parseTags(tool.platforms);

  return (
    <div className="shell">
      <div className="detail-head">
        <div className="result-meta">
          <span>{tool.category}</span>
          <span>{tool.difficulty}</span>
          {platforms.map((platform) => (
            <span key={platform}>{platform}</span>
          ))}
        </div>
        <h1>{tool.name}</h1>
        <p>{tool.description}</p>
        <BookmarkButton
          toolId={tool.id}
          initiallyBookmarked={Boolean(bookmark)}
        />
      </div>
      <div className="detail-body">
        <p>{tool.longDescription ?? tool.description}</p>
        {tool.installCommand ? (
          <pre>
            <code>{tool.installCommand}</code>
          </pre>
        ) : null}
        <p>
          Tags: {tags.join(", ")}
        </p>
        <div className="cta-row">
          {tool.website ? (
            <a className="btn ghost" href={tool.website} target="_blank" rel="noreferrer">
              Website
            </a>
          ) : null}
          {tool.github ? (
            <a className="btn ghost" href={tool.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          ) : null}
          <Link className="btn primary" href="/explore">
            Back to search
          </Link>
        </div>
      </div>
    </div>
  );
}
