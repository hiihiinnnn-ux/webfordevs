import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { handleRouteError, jsonCreated, jsonError } from "@/lib/api";
import { registerSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = registerSchema.parse(await request.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("An account with that email already exists", 409);
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
      },
    });

    const token = await createSessionToken(user.id);
    await setSessionCookie(token);

    return jsonCreated({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
