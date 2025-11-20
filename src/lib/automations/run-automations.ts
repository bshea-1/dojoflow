"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { revalidatePath } from "next/cache";

type AutomationTrigger = Database["public"]["Enums"]["automation_trigger"];
type AutomationActionType = Database["public"]["Enums"]["automation_action_type"];

type AutomationAction = {
  type: AutomationActionType;
  title?: string | null;
  template?: string | null;
  message?: string | null;
  taskType?: Database["public"]["Tables"]["tasks"]["Row"]["type"] | null;
};

type AutomationConditions = {
  lead_path?: string[];
  status?: string;
  [key: string]: any;
} | null;

interface ExecuteAutomationOptions {
  trigger: AutomationTrigger;
  franchiseId: string;
  leadId: string;
  franchiseSlug?: string; // Optional slug for cache revalidation
  context?: {
    newStatus?: string;
  };
}

export async function runAutomations({
  trigger,
  franchiseId,
  leadId,
  franchiseSlug,
  context = {},
}: ExecuteAutomationOptions) {
  const supabase = createClient();

  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .eq("franchise_id", franchiseId)
    .eq("trigger", trigger)
    .eq("active", true);

  if (!automations || automations.length === 0) {
    return;
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("id, status, franchise_id, guardians ( id, first_name, last_name, email, phone, students ( program_interest ) )")
    .eq("id", leadId)
    .single();

  if (!lead) return;

  const guardian = lead.guardians?.[0];
  const leadPaths =
    guardian?.students?.flatMap((student) => student.program_interest ?? []) ?? [];
  const effectiveStatus = context.newStatus || lead.status || undefined;

  for (const automation of automations) {
    const conditions = (automation.conditions as AutomationConditions) || {};

    if (conditions?.status && conditions.status !== effectiveStatus) {
      continue;
    }

    if (conditions?.lead_path?.length) {
      const matchesPath = leadPaths.some((path) =>
        conditions.lead_path!.includes(path)
      );
      if (!matchesPath) continue;
    }

    const actions = Array.isArray(automation.actions)
      ? (automation.actions as AutomationAction[])
      : [];

    for (const action of actions) {
      try {
        if (action.type === "send_email") {
          if (!guardian?.email) continue;
          await supabase.from("interactions").insert({
            lead_id: lead.id,
            type: "email",
            content: action.message || action.template || "Automation email sent.",
          });
        } else if (action.type === "send_sms") {
          if (!guardian?.phone) continue;
          await supabase.from("interactions").insert({
            lead_id: lead.id,
            type: "sms",
            content: action.message || "Automation SMS sent.",
          });
        } else if (action.type === "create_task") {
          await supabase.from("tasks").insert({
            franchise_id: franchiseId,
            lead_id: lead.id,
            title: action.title || `Automation Task: ${automation.name}`,
            description: action.message ?? action.template ?? null,
            type: action.taskType ?? "other",
            status: "pending",
            tour_id: null,
          });
          // Revalidate actions page if slug is provided
          if (franchiseSlug) {
            revalidatePath(`/dashboard/${franchiseSlug}/actions`);
          }
        }
        await supabase.from("automation_logs").insert({
          franchise_id: franchiseId,
          automation_id: automation.id,
          lead_id: lead.id,
          status: "success",
          error_message: null,
        });
      } catch (error) {
        console.error("Failed to execute automation action", {
          automationId: automation.id,
          action,
          error,
        });
        await supabase.from("automation_logs").insert({
          franchise_id: franchiseId,
          automation_id: automation.id,
          lead_id: lead.id,
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }
}

