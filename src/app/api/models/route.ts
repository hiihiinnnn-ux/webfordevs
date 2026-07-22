import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonOk, serializeModel } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const family = searchParams.get("family")?.trim() ?? "";
    const maxRam = searchParams.get("maxRam");
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
                { family: { contains: q } },
              ],
            }
          : {},
        family ? { family: { equals: family } } : {},
        maxRam ? { minRamGb: { lte: Number(maxRam) } } : {},
        featured === "true" ? { featured: true } : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.model.findMany({
        where,
        orderBy: [{ featured: "desc" }, { minRamGb: "asc" }, { name: "asc" }],
        take: limit,
        skip: offset,
      }),
      prisma.model.count({ where }),
    ]);

    return jsonOk({
      items: items.map(serializeModel),
      total,
      limit,
      offset,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
