import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  handleRouteError,
  jsonOk,
  serializeModel,
  serializeTool,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const type = searchParams.get("type")?.trim() ?? "all";
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

    if (!q) {
      return jsonOk({
        query: q,
        tools: [],
        models: [],
        guides: [],
        total: 0,
      });
    }

    const textFilter = {
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ],
    };

    const guideFilter = {
      OR: [
        { title: { contains: q } },
        { summary: { contains: q } },
        { content: { contains: q } },
      ],
    };

    const [tools, models, guides] = await Promise.all([
      type === "all" || type === "tools"
        ? prisma.tool.findMany({
            where: {
              OR: [
                ...textFilter.OR,
                { category: { contains: q } },
              ],
            },
            take: limit,
            orderBy: [{ featured: "desc" }, { name: "asc" }],
          })
        : Promise.resolve([]),
      type === "all" || type === "models"
        ? prisma.model.findMany({
            where: {
              OR: [
                ...textFilter.OR,
                { family: { contains: q } },
              ],
            },
            take: limit,
            orderBy: [{ featured: "desc" }, { name: "asc" }],
          })
        : Promise.resolve([]),
      type === "all" || type === "guides"
        ? prisma.guide.findMany({
            where: guideFilter,
            take: limit,
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              summary: true,
              level: true,
              sortOrder: true,
            },
          })
        : Promise.resolve([]),
    ]);

    return jsonOk({
      query: q,
      tools: tools.map(serializeTool),
      models: models.map(serializeModel),
      guides,
      total: tools.length + models.length + guides.length,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
