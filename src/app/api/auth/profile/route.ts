import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { handleRouteError, jsonOk } from "@/lib/api";
import { profileSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSessionUser();
    const body = profileSchema.parse(await request.json());

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.bio !== undefined ? { bio: body.bio } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
      },
    });

    return jsonOk({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
