import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const guide = await prisma.guide.findUnique({ where: { slug } });
  if (!guide) {
    return NextResponse.json({ error: "Guide not found" }, { status: 404 });
  }
  return NextResponse.json({ item: guide });
}
