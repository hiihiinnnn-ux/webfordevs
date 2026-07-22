import { NextRequest, NextResponse } from "next/server";
import { serializeModel } from "@/lib/catalog";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const vendor = req.nextUrl.searchParams.get("vendor");
  const tag = req.nextUrl.searchParams.get("tag");
  const models = await prisma.aiModel.findMany({ orderBy: { name: "asc" } });
  let items = models.map(serializeModel);
  if (vendor) {
    items = items.filter((m) => m.vendor.toLowerCase() === vendor.toLowerCase());
  }
  if (tag) {
    items = items.filter((m) => m.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()));
  }
  return NextResponse.json({ count: items.length, items });
}
