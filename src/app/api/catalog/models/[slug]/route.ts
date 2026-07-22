import { NextResponse } from "next/server";
import { serializeModel } from "@/lib/catalog";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const model = await prisma.aiModel.findUnique({ where: { slug } });
  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }
  return NextResponse.json({ item: serializeModel(model) });
}
