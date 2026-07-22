import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonOk, serializeTool } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const difficulty = searchParams.get("difficulty")?.trim() ?? "";
    const featured = searchParams.get("featured");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
    const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

    const where = {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { description: { contains: q } },
                { tags: { contains: q } },
                { category: { contains: q } },
              ],
            }
          : {},
        category ? { category: { equals: category } } : {},
        difficulty ? { difficulty: { equals: difficulty } } : {},
        featured === "true" ? { featured: true } : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        orderBy: [{ featured: "desc" }, { name: "asc" }],
        take: limit,
        skip: offset,
      }),
      prisma.tool.count({ where }),
    ]);

    return jsonOk({
      items: items.map(serializeTool),
      total,
      limit,
      offset,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
