import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonOk } from "@/lib/api";

export async function GET() {
  try {
    const guides = await prisma.guide.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        level: true,
        sortOrder: true,
      },
    });

    return jsonOk({ items: guides });
  } catch (error) {
    return handleRouteError(error);
  }
}
