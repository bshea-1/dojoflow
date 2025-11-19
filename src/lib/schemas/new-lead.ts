import { z } from "zod";

// Helper to calculate age
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
    dob: z.coerce.date()
      .refine((date) => {
        const age = calculateAge(date);
        return age >= 5 && age <= 15;
      }, {
        message: "Student must be between 5 and 15 years old",
      }),
    programInterest: z.enum(["jr", "create", "camp"]),
  }),

  // Lead Meta
  source: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  const age = calculateAge(data.student.dob);
  const program = data.student.programInterest;

  // Program-specific age validation
  if (program === "jr") {
    if (age < 5 || age > 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "JR program is strictly for ages 5-7",
        path: ["student", "programInterest"],
      });
    }
  }

  if (program === "create") {
    if (age < 7 || age > 14) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Create program is strictly for ages 7-14",
        path: ["student", "programInterest"],
      });
    }
  }
});

export type NewLeadSchema = z.infer<typeof newLeadSchema>;

