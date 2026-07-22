import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/favorite-button";
import { serializeModel } from "@/lib/catalog";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const model = await prisma.aiModel.findUnique({ where: { slug } });
  return { title: model?.name ?? "Model" };
}

export default async function ModelDetailPage({ params }: Params) {
  const { slug } = await params;
  const model = await prisma.aiModel.findUnique({ where: { slug } });
  if (!model) notFound();
  const item = serializeModel(model);

  return (
    <div className="shell detail-panel">
      <div className="page-hero" style={{ paddingBottom: 0 }}>
        <p className="pill">model</p>
        <h1>{item.name}</h1>
        <p className="section-lead">{item.description}</p>
        <div className="meta-grid">
          <span>Vendor: {item.vendor}</span>
          {item.sizeParams ? <span>Size: {item.sizeParams}</span> : null}
          {item.contextLength ? <span>Context: {item.contextLength.toLocaleString()}</span> : null}
          {item.hardwareMin ? <span>Hardware: {item.hardwareMin}</span> : null}
          {item.license ? <span>License: {item.license}</span> : null}
        </div>
        <div className="cta-row" style={{ marginTop: "1.25rem" }}>
          <FavoriteButton itemType="model" itemId={item.id} />
          {item.ollamaName ? (
            <code className="inline-code">ollama pull {item.ollamaName}</code>
          ) : null}
          {item.hfUrl ? (
            <a className="btn btn-ghost compact" href={item.hfUrl} target="_blank" rel="noreferrer">
              Hugging Face
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
