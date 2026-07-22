import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk, serializeTool } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const tool = await prisma.tool.findUnique({ where: { slug } });
    if (!tool) {
      return jsonError("Tool not found", 404);
    }
    return jsonOk({ tool: serializeTool(tool) });
  } catch (error) {
    return handleRouteError(error);
  }
}
