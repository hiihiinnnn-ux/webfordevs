import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const bookmarkSchema = z
  .object({
    toolId: z.string().cuid().optional(),
    modelId: z.string().cuid().optional(),
  })
  .refine((value) => Boolean(value.toolId) !== Boolean(value.modelId), {
    message: "Provide exactly one of toolId or modelId",
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(500).nullable().optional(),
});
