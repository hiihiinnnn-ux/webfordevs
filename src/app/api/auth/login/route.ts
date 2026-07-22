import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { publicUser, setAuthCookie, signToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const ok = await compare(parsed.data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const session = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
    };
    const token = await signToken(session);
    const response = NextResponse.json({ user: publicUser(session) });
    setAuthCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to login" }, { status: 500 });
  }
}
