import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const guides = await prisma.guide.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      level: true,
      readingMins: true,
      sortOrder: true,
    },
  });
  return NextResponse.json({ count: guides.length, items: guides });
}
