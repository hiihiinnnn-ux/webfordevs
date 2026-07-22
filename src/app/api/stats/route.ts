import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const [tools, models, guides, users, categories, families] =
      await Promise.all([
        prisma.tool.count(),
        prisma.model.count(),
        prisma.guide.count(),
        prisma.user.count(),
        prisma.tool.findMany({
          distinct: ["category"],
          select: { category: true },
          orderBy: { category: "asc" },
        }),
        prisma.model.findMany({
          distinct: ["family"],
          select: { family: true },
          orderBy: { family: "asc" },
        }),
      ]);

    return jsonOk({
      tools,
      models,
      guides,
      users,
      categories: categories.map((item) => item.category),
      families: families.map((item) => item.family),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
