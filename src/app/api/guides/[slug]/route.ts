import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const guide = await prisma.guide.findUnique({ where: { slug } });
    if (!guide) {
      return jsonError("Guide not found", 404);
    }
    return jsonOk({ guide });
  } catch (error) {
    return handleRouteError(error);
  }
}
