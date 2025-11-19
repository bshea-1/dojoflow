import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  type: z.enum(["call", "email", "text", "review", "other"]).default("other"),
  leadId: z.string().uuid().optional(),
});

export type TaskSchema = z.infer<typeof taskSchema>;

