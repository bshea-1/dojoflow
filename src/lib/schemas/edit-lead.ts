import { z } from "zod";

export const programOptions = [
  "jr",
  "create",
  "camp",
  "ai",
  "robotics",
  "clubs",
  "birthday_party",
  "pno",
  "academy"
] as const;

export const editLeadSchema = z.object({
  guardianFirstName: z.string().min(1, "Guardian first name is required"),
  guardianLastName: z.string().min(1, "Guardian last name is required"),
  guardianEmail: z.string().email("Invalid email address"),
  guardianPhone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  studentFirstName: z.string().min(1, "Student first name is required"),
  studentProgram: z.array(z.enum(programOptions)).min(1, "Select at least one program"),
  studentDob: z.string().optional(), // Keep as string for date input
  source: z.string().optional(),
  notes: z.string().optional(),
});

export type EditLeadSchema = z.infer<typeof editLeadSchema>;
