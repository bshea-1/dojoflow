import { z } from "zod";

export const programOptions = [
  "jr",
  "create",
  "camp",
  "ai",
  "robotics",
  "clubs",
  "birthday_party",
] as const;

export const editLeadSchema = z.object({
  guardianFirstName: z.string().min(1, "First name is required"),
  guardianLastName: z.string().min(1, "Last name is required"),
  guardianEmail: z.string().email("Invalid email"),
  guardianPhone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be at most 15 digits"),
  studentFirstName: z.string().min(1, "Student name is required"),
  studentProgram: z.enum(programOptions, {
    errorMap: () => ({ message: "Program is required" }),
  }),
  studentDob: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

export type EditLeadSchema = z.infer<typeof editLeadSchema>;

