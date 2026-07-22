import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonCreated<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details !== undefined ? { details } : {}) },
    { status },
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof AuthError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof ZodError) {
    return jsonError("Validation failed", 400, error.flatten());
  }

  console.error(error);
  return jsonError("Internal server error", 500);
}

export function parseTags(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function serializeTool<T extends { tags: string; platforms: string }>(
  tool: T,
) {
  return {
    ...tool,
    tags: parseTags(tool.tags),
    platforms: parseTags(tool.platforms),
  };
}

export function serializeModel<T extends { tags: string }>(model: T) {
  return {
    ...model,
    tags: parseTags(model.tags),
  };
}
