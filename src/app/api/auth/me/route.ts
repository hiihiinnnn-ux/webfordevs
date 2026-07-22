import { NextResponse } from "next/server";
import { getSessionFromCookies, publicUser } from "@/lib/auth";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user: publicUser(session) });
}
