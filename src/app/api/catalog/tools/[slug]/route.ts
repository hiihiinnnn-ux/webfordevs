import { NextResponse } from "next/server";
import { serializeTool } from "@/lib/catalog";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({ where: { slug } });
  if (!tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }
  return NextResponse.json({ item: serializeTool(tool) });
}
