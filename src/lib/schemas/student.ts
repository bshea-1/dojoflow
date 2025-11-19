import { z } from "zod";

export const BELT_RANKS = [
  "White",
  "Yellow",
  "Orange",
  "Green",
  "Blue",
  "Purple",
  "Brown",
  "Red",
  "Black",
] as const;

export const promoteStudentSchema = z.object({
  studentId: z.string().uuid(),
  newBelt: z.enum(BELT_RANKS),
  promotedAt: z.date(),
});

export type PromoteStudentSchema = z.infer<typeof promoteStudentSchema>;

