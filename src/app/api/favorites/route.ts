import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { serializeModel, serializeTool } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { favoriteSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error || !user) return error!;

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const modelIds = favorites.filter((f) => f.itemType === "model").map((f) => f.itemId);
  const toolIds = favorites.filter((f) => f.itemType === "tool").map((f) => f.itemId);

  const [models, tools] = await Promise.all([
    modelIds.length
      ? prisma.aiModel.findMany({ where: { id: { in: modelIds } } })
      : Promise.resolve([]),
    toolIds.length
      ? prisma.tool.findMany({ where: { id: { in: toolIds } } })
      : Promise.resolve([]),
  ]);

  const modelMap = new Map(models.map((m) => [m.id, serializeModel(m)]));
  const toolMap = new Map(tools.map((t) => [t.id, serializeTool(t)]));

  const items = favorites
    .map((fav) => {
      if (fav.itemType === "model") {
        const item = modelMap.get(fav.itemId);
        return item ? { favoriteId: fav.id, createdAt: fav.createdAt, item } : null;
      }
      const item = toolMap.get(fav.itemId);
      return item ? { favoriteId: fav.id, createdAt: fav.createdAt, item } : null;
    })
    .filter(Boolean);

  return NextResponse.json({ count: items.length, items });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error || !user) return error!;

  const body = await req.json();
  const parsed = favoriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { itemType, itemId } = parsed.data;
  if (itemType === "model") {
    const exists = await prisma.aiModel.findUnique({ where: { id: itemId } });
    if (!exists) return NextResponse.json({ error: "Model not found" }, { status: 404 });
  } else {
    const exists = await prisma.tool.findUnique({ where: { id: itemId } });
    if (!exists) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_itemType_itemId: { userId: user.id, itemType, itemId },
    },
    create: { userId: user.id, itemType, itemId },
    update: {},
  });

  return NextResponse.json({ favorite }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (error || !user) return error!;

  const itemType = req.nextUrl.searchParams.get("itemType");
  const itemId = req.nextUrl.searchParams.get("itemId");
  if (!itemType || !itemId) {
    return NextResponse.json({ error: "itemType and itemId are required" }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { userId: user.id, itemType, itemId },
  });

  return NextResponse.json({ ok: true });
}
