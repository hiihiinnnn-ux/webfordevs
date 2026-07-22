import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [models, tools, guides, users] = await Promise.all([
    prisma.aiModel.count(),
    prisma.tool.count(),
    prisma.guide.count(),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    status: "ok",
    service: "localbench-api",
    version: "1.0.0",
    counts: { models, tools, guides, users },
  });
}
