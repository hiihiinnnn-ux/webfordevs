import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk, serializeModel } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const model = await prisma.model.findUnique({ where: { slug } });
    if (!model) {
      return jsonError("Model not found", 404);
    }
    return jsonOk({ model: serializeModel(model) });
  } catch (error) {
    return handleRouteError(error);
  }
}
