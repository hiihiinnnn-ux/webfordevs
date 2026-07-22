import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { publicUser, setAuthCookie, signToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, username, password, displayName } = parsed.data;
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email or username already in use" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        displayName: displayName?.trim() || username,
      },
    });

    const session = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
    };
    const token = await signToken(session);
    const response = NextResponse.json(
      { user: publicUser(session), message: "Account created" },
      { status: 201 },
    );
    setAuthCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to register" }, { status: 500 });
  }
}
