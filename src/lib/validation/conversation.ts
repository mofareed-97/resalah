import { z } from "zod"

export const conversationSchema = z.object({
  name: z.string().optional(),
  isGroup: z.boolean().default(false).optional(),
  userId: z.string(),
  members: z.string().array().optional(),
})

export const messageSchema = z.object({
  content: z.string().min(1),
  image: z.string().or(z.null()).optional().default(null),
})

export const groupSchema = z.object({
  name: z.string().min(1),
  image: z.string().or(z.null()).optional().default(null),
  // memebers: z.object({}).array().min(2),
})
