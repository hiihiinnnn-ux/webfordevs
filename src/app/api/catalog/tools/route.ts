import { NextRequest, NextResponse } from "next/server";
import { serializeTool } from "@/lib/catalog";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const difficulty = req.nextUrl.searchParams.get("difficulty");
  const tools = await prisma.tool.findMany({ orderBy: { name: "asc" } });
  let items = tools.map(serializeTool);
  if (category) {
    items = items.filter((t) => t.category.toLowerCase() === category.toLowerCase());
  }
  if (difficulty) {
    items = items.filter((t) => t.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  return NextResponse.json({ count: items.length, items });
}
