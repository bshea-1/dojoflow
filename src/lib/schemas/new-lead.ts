import { z } from "zod";

// Helper to calculate age (kept for potential future use or display)
const calculateAge = (dob: Date) => {
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
};

export const newLeadSchema = z.object({
  // Guardian Information
  guardian: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  }),

  // Student Information
  student: z.object({
    firstName: z.string().min(1, "Student name is required"),
    dob: z.coerce.date(),
    programInterest: z.enum([
      "jr", 
      "create", 
      "camp", 
      "ai", 
      "robotics", 
      "clubs", 
      "birthday_party"
    ]),
  }),

  // Lead Meta
  source: z.string().optional(),
  notes: z.string().optional(),
});

export type NewLeadSchema = z.infer<typeof newLeadSchema>;
