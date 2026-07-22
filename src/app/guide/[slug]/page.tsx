import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

function renderMarkdown(content: string) {
  const blocks = content.trim().split(/\n\n+/);
  return blocks.map((block, index) => {
    if (block.startsWith("```")) {
      const lines = block.split("\n");
      const code = lines.slice(1, -1).join("\n");
      return (
        <pre key={index}>
          <code>{code}</code>
        </pre>
      );
    }

    if (block.startsWith("# ")) {
      return <h1 key={index}>{block.slice(2)}</h1>;
    }
    if (block.startsWith("## ")) {
      return <h2 key={index}>{block.slice(3)}</h2>;
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").map((line) => line.replace(/^- /, ""));
      return (
        <ul key={index}>
          {items.map((item) => (
            <li key={item}>{formatInline(item)}</li>
          ))}
        </ul>
      );
    }
    if (/^\d+\.\s/.test(block)) {
      const items = block.split("\n");
      return (
        <ol key={index}>
          {items.map((item) => (
            <li key={item}>{formatInline(item.replace(/^\d+\.\s/, ""))}</li>
          ))}
        </ol>
      );
    }

    return <p key={index}>{formatInline(block)}</p>;
  });
}

function formatInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = await prisma.guide.findUnique({ where: { slug } });
  return {
    title: guide?.title ?? "Guide",
    description: guide?.summary,
  };
}

export default async function GuideDetailPage({ params }: Params) {
  const { slug } = await params;
  const guide = await prisma.guide.findUnique({ where: { slug } });
  if (!guide) notFound();

  const siblings = await prisma.guide.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, title: true, sortOrder: true },
  });
  const index = siblings.findIndex((item) => item.slug === guide.slug);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index < siblings.length - 1 ? siblings[index + 1] : null;

  return (
    <div className="shell">
      <div className="detail-head">
        <div className="result-meta">
          <span>{guide.level}</span>
          <span>Lesson {guide.sortOrder}</span>
        </div>
        <h1>{guide.title}</h1>
        <p>{guide.summary}</p>
      </div>
      <article className="detail-body prose">{renderMarkdown(guide.content)}</article>
      <div className="cta-row shell" style={{ paddingBottom: "4rem" }}>
        {prev ? (
          <Link className="btn ghost" href={`/guide/${prev.slug}`}>
            ← {prev.title}
          </Link>
        ) : (
          <Link className="btn ghost" href="/guide">
            All guides
          </Link>
        )}
        {next ? (
          <Link className="btn primary" href={`/guide/${next.slug}`}>
            Next: {next.title}
          </Link>
        ) : (
          <Link className="btn primary" href="/explore">
            Explore tools & models
          </Link>
        )}
      </div>
    </div>
  );
}
