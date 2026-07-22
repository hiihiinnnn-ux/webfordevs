import { NextRequest, NextResponse } from "next/server";
import { matchesQuery, serializeModel, serializeTool } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { searchSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = searchSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { q, type, category, tag, difficulty, limit, offset } = parsed.data;

  const [models, tools] = await Promise.all([
    type === "tools" ? Promise.resolve([]) : prisma.aiModel.findMany({ orderBy: { name: "asc" } }),
    type === "models" ? Promise.resolve([]) : prisma.tool.findMany({ orderBy: { name: "asc" } }),
  ]);

  const modelResults = models.map(serializeModel).filter((m) => {
    const blob = [m.name, m.vendor, m.description, m.tags.join(" "), m.useCases.join(" ")].join(" ");
    if (!matchesQuery(blob, q)) return false;
    if (tag && !m.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())) return false;
    return true;
  });

  const toolResults = tools.map(serializeTool).filter((t) => {
    const blob = [t.name, t.category, t.description, t.tags.join(" "), t.platforms.join(" ")].join(" ");
    if (!matchesQuery(blob, q)) return false;
    if (category && t.category.toLowerCase() !== category.toLowerCase()) return false;
    if (difficulty && t.difficulty.toLowerCase() !== difficulty.toLowerCase()) return false;
    if (tag && !t.tags.map((x) => x.toLowerCase()).includes(tag.toLowerCase())) return false;
    return true;
  });

  const combined = [...modelResults, ...toolResults].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const total = combined.length;
  const items = combined.slice(offset, offset + limit);

  return NextResponse.json({
    query: { q, type, category, tag, difficulty, limit, offset },
    total,
    count: items.length,
    items,
    facets: {
      modelTags: Array.from(new Set(modelResults.flatMap((m) => m.tags))).sort(),
      toolCategories: Array.from(new Set(toolResults.map((t) => t.category))).sort(),
      difficulties: Array.from(new Set(toolResults.map((t) => t.difficulty))).sort(),
    },
  });
}
