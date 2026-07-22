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
  const model = await prisma.model.findUnique({ where: { slug } });
  return {
    title: model?.name ?? "Model",
    description: model?.description,
  };
}

export default async function ModelDetailPage({ params }: Params) {
  const { slug } = await params;
  const model = await prisma.model.findUnique({ where: { slug } });
  if (!model) notFound();

  const user = await getSessionUser();
  const bookmark = user
    ? await prisma.bookmark.findFirst({
        where: { userId: user.id, modelId: model.id },
      })
    : null;

  const tags = parseTags(model.tags);

  return (
    <div className="shell">
      <div className="detail-head">
        <div className="result-meta">
          <span>{model.family}</span>
          <span>{model.sizeParams}</span>
          <span>{model.minRamGb}GB RAM</span>
          <span>{model.contextLength.toLocaleString()} context</span>
        </div>
        <h1>{model.name}</h1>
        <p>{model.description}</p>
        <BookmarkButton
          modelId={model.id}
          initiallyBookmarked={Boolean(bookmark)}
        />
      </div>
      <div className="detail-body">
        <p>
          License: {model.license}
          {model.quantization ? ` · Typical quant: ${model.quantization}` : ""}
        </p>
        {model.ollamaPull ? (
          <pre>
            <code>ollama pull {model.ollamaPull}</code>
          </pre>
        ) : null}
        {model.huggingFaceId ? (
          <p>
            Hugging Face:{" "}
            <a
              href={`https://huggingface.co/${model.huggingFaceId}`}
              target="_blank"
              rel="noreferrer"
            >
              {model.huggingFaceId}
            </a>
          </p>
        ) : null}
        <p>Tags: {tags.join(", ")}</p>
        <Link className="btn primary" href="/explore?type=models">
          Browse more models
        </Link>
      </div>
    </div>
  );
}
