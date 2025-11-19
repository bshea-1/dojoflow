import { z } from "zod";

export const bookTourSchema = z.object({
  leadId: z.string().uuid("Invalid Lead ID"),
  scheduledAt: z.date({
    required_error: "Please select a date and time",
    invalid_type_error: "That's not a date!",
  }),
  notes: z.string().optional(),
});

export type BookTourSchema = z.infer<typeof bookTourSchema>;

