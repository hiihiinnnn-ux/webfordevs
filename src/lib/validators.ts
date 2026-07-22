import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().max(255),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const searchSchema = z.object({
  q: z.string().optional().default(""),
  type: z.enum(["all", "models", "tools"]).optional().default("all"),
  category: z.string().optional(),
  tag: z.string().optional(),
  difficulty: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const favoriteSchema = z.object({
  itemType: z.enum(["model", "tool"]),
  itemId: z.string().min(1),
});

export function parseJsonTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
