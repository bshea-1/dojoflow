import { z } from "zod";

const programValues = [
  "jr", 
  "create", 
  "camp", 
  "ai", 
  "robotics", 
  "clubs", 
  "birthday_party"
] as const;

export type ProgramInterestValue = typeof programValues[number];

export const programLeadOptions = [
  { value: "jr", label: "JR" },
  { value: "create", label: "Create" },
  { value: "camp", label: "Camps" },
  { value: "ai", label: "AI" },
  { value: "robotics", label: "Robotics" },
  { value: "clubs", label: "Clubs" },
  { value: "birthday_party", label: "Birthday Party" },
] as const;

const childSchema = z.object({
  name: z.string().min(1, "Child name is required"),
  age: z.coerce.number().optional(), // Relaxed age validation
});

const newLeadPayload = z.object({
  parentFirstName: z.string().min(1, "Parent first name required"),
  parentLastName: z.string().min(1, "Parent last name required"),
  parentEmail: z.string().email("Valid email required"),
  parentPhone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(20, "Phone is too long"),
  children: z.array(childSchema).min(1, "Add at least one child"),
  programs: z
    .array(z.enum(programValues))
    .min(1, "Select at least one program"),
});

export const bookTourSchema = z
  .object({
    leadId: z.string().uuid("Invalid Lead ID").optional(),
    scheduledAt: z.date({
      required_error: "Please select a date and time",
      invalid_type_error: "That's not a date!",
    }),
    notes: z.string().optional(),
    newLead: newLeadPayload
      .extend({
        children: z.array(childSchema),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.leadId && !data.newLead) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a lead or provide details",
        path: ["leadId"],
      });
    }

    if (data.newLead) {
      const validation = newLeadPayload.safeParse(data.newLead);
      if (!validation.success) {
        validation.error.issues.forEach((issue) => ctx.addIssue(issue));
      }
    }
  });

export type BookTourSchema = z.infer<typeof bookTourSchema>;
