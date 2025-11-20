import { z } from "zod";

export const conditionSchema = z.object({
  field: z.enum(["program_interest", "status", "source"]),
  operator: z.enum(["equals", "contains", "does_not_contain"]),
  value: z.string()
});

export const actionSchema = z.object({
  type: z.enum(["send_email", "send_sms", "create_task"]),
  config: z.object({
    recipient: z.enum(["guardian", "staff"]).optional(),
    subject: z.string().optional(),
    message: z.string().optional(),
    taskTitle: z.string().optional(),
    taskDueDays: z.coerce.number().optional(),
  })
});

export const automationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  trigger: z.enum(["lead_created", "status_changed"]),
  conditions: z.array(conditionSchema),
  actions: z.array(actionSchema).min(1, "At least one action is required"),
  active: z.boolean().default(true)
});

export type AutomationSchema = z.infer<typeof automationSchema>;
export type ConditionSchema = z.infer<typeof conditionSchema>;
export type ActionSchema = z.infer<typeof actionSchema>;

