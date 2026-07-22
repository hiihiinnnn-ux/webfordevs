import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import {
  handleRouteError,
  jsonCreated,
  jsonError,
  jsonOk,
  serializeModel,
  serializeTool,
} from "@/lib/api";
import { bookmarkSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: { tool: true, model: true },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk({
      items: bookmarks.map((bookmark) => ({
        id: bookmark.id,
        createdAt: bookmark.createdAt,
        tool: bookmark.tool ? serializeTool(bookmark.tool) : null,
        model: bookmark.model ? serializeModel(bookmark.model) : null,
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const body = bookmarkSchema.parse(await request.json());

    if (body.toolId) {
      const tool = await prisma.tool.findUnique({ where: { id: body.toolId } });
      if (!tool) return jsonError("Tool not found", 404);
    }

    if (body.modelId) {
      const model = await prisma.model.findUnique({
        where: { id: body.modelId },
      });
      if (!model) return jsonError("Model not found", 404);
    }

    const existing = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        ...(body.toolId ? { toolId: body.toolId } : { modelId: body.modelId }),
      },
    });

    if (existing) {
      return jsonOk({ bookmark: existing, alreadyExists: true });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        toolId: body.toolId,
        modelId: body.modelId,
      },
      include: { tool: true, model: true },
    });

    return jsonCreated({
      bookmark: {
        id: bookmark.id,
        createdAt: bookmark.createdAt,
        tool: bookmark.tool ? serializeTool(bookmark.tool) : null,
        model: bookmark.model ? serializeModel(bookmark.model) : null,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const toolId = searchParams.get("toolId");
    const modelId = searchParams.get("modelId");

    if (!id && !toolId && !modelId) {
      return jsonError("Provide id, toolId, or modelId", 400);
    }

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        ...(id ? { id } : {}),
        ...(toolId ? { toolId } : {}),
        ...(modelId ? { modelId } : {}),
      },
    });

    if (!bookmark) {
      return jsonError("Bookmark not found", 404);
    }

    await prisma.bookmark.delete({ where: { id: bookmark.id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
