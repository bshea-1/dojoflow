"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { NewLeadSchema } from "@/lib/schemas/new-lead";
import { revalidatePath } from "next/cache";
import { runAutomations } from "@/lib/automations/run-automations";
import { addDays } from "date-fns";

type LeadStatus = Database["public"]["Tables"]["leads"]["Row"]["status"];

export async function updateLeadStatus(leadId: string, newStatus: LeadStatus, franchiseSlug: string) {
  const supabase = createClient();

  const { data: leadRecord } = await supabase
    .from("leads")
    .select("franchise_id")
    .eq("id", leadId)
    .single();

  // Delete any existing pending tasks for this lead to avoid stacking
  await supabase
    .from("tasks")
    .delete()
    .eq("lead_id", leadId)
    .eq("status", "pending");

  const { error } = await supabase
    .from("leads")
    .update({ status: newStatus })
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  if (leadRecord?.franchise_id) {
    const automationContext = newStatus ? { newStatus } : undefined;

    await runAutomations({
      trigger: "status_changed",
      franchiseId: leadRecord.franchise_id,
      leadId,
      franchiseSlug,
      context: automationContext,
    });

    if (newStatus === "tour_booked" || newStatus === "tour_completed") {
      const specificTrigger = newStatus === "tour_completed" ? "tour_completed" : "tour_booked";
      await runAutomations({
        trigger: specificTrigger,
        franchiseId: leadRecord.franchise_id,
        leadId,
        franchiseSlug,
        context: automationContext,
      });

      // Default Tour Tasks
      const now = new Date();
      if (newStatus === "tour_booked") {
        // Task: Confirm Tour (Due: Now, or maybe 1 day before scheduled? 
        // Since we don't have the scheduled date easily here without fetching tour, let's set to Now)
        await supabase.from("tasks").insert({
          franchise_id: leadRecord.franchise_id,
          lead_id: leadId,
          title: "Confirm Tour Appointment",
          type: "call",
          due_date: now.toISOString(),
          description: "Call to confirm upcoming tour",
          status: "pending"
        });
      } else if (newStatus === "tour_completed") {
        // Task: Follow up on Tour (Due: +1 day)
        await supabase.from("tasks").insert({
          franchise_id: leadRecord.franchise_id,
          lead_id: leadId,
          title: "Follow up on Tour",
          type: "call",
          due_date: addDays(now, 1).toISOString(),
          description: "Follow up call after tour completion",
          status: "pending"
        });
      }
    }
  }

  revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  return { success: true };
}

export async function createLead(data: NewLeadSchema, franchiseSlug: string) {
  const supabase = createClient();

  // 1. Get Franchise ID from Slug
  const { data: franchise, error: franchiseError } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", franchiseSlug)
    .single();

  if (franchiseError || !franchise) {
    return { error: "Franchise not found" };
  }

  // 2. Create Lead
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      franchise_id: franchise.id,
      status: "new",
      source: data.source || "Manual Entry",
      notes: data.notes,
    })
    .select()
    .single();

  if (leadError) {
    return { error: "Failed to create lead record" };
  }

  // 3. Create Guardian
  const { data: guardian, error: guardianError } = await supabase
    .from("guardians")
    .insert({
      lead_id: lead.id,
      first_name: data.guardian.firstName,
      last_name: data.guardian.lastName,
      email: data.guardian.email,
      phone: data.guardian.phone,
    })
    .select()
    .single();

  if (guardianError) {
    // Cleanup lead if guardian fails? 
    // Ideally use a transaction (RPC) for atomicity, but Supabase-js doesn't support raw transactions easily without RPC.
    // For now, we proceed.
    return { error: "Failed to create guardian record" };
  }

  // 4. Create Student
  const { error: studentError } = await supabase
    .from("students")
    .insert({
      guardian_id: guardian.id,
      first_name: data.student.firstName,
      dob: data.student.dob.toISOString(), // Convert Date to string for DB
      program_interest: data.student.programInterest,
    });

  if (studentError) {
    return { error: "Failed to create student record" };
  }

  await runAutomations({
    trigger: "lead_created",
    franchiseId: franchise.id,
    leadId: lead.id,
    franchiseSlug,
  });

  // Create Default Tasks
  const now = new Date();
  const defaultTasks = [
    {
      title: "Initial Phone Call",
      type: "call" as const,
      due_date: now.toISOString(),
      description: "Follow up on new lead",
    },
    {
      title: "Follow up Phone Call",
      type: "call" as const,
      due_date: addDays(now, 2).toISOString(),
      description: "Second follow up call",
    },
    {
      title: "Review Lead",
      type: "review" as const,
      due_date: addDays(now, 4).toISOString(),
      description: "Review lead status and move to Lost if needed",
    },
  ];

  const { error: tasksError } = await supabase.from("tasks").insert(
    defaultTasks.map((task) => ({
      franchise_id: franchise.id,
      lead_id: lead.id,
      title: task.title,
      type: task.type,
      due_date: task.due_date,
      description: task.description,
      status: "pending",
    }))
  );

  if (tasksError) {
    console.error("Failed to create default tasks:", tasksError);
    // Don't fail the whole request, just log it
  }

  revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  revalidatePath(`/dashboard/${franchiseSlug}/actions`);
  return { success: true };
}

export async function getLeadTasks(leadId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("lead_id", leadId)
    .order("due_date", { ascending: true });

  if (error) return [];
  return data;
}

type LeadEditPayload = {
  leadId: string;
  guardianId: string;
  studentId?: string;
  guardian: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  student?: {
    firstName: string;
    programInterest: any; // Use any to avoid strict typing issues with specific enum import here
    dob?: string;
  };
  lead?: {
    source?: string;
    notes?: string;
  };
};

export async function updateLeadDetails(
  payload: LeadEditPayload,
  franchiseSlug: string
) {
  const supabase = createClient();

  const updates = [];

  const guardianUpdate = await supabase
    .from("guardians")
    .update({
      first_name: payload.guardian.firstName,
      last_name: payload.guardian.lastName,
      email: payload.guardian.email,
      phone: payload.guardian.phone,
    })
    .eq("id", payload.guardianId);

  if (guardianUpdate.error) {
    return { error: guardianUpdate.error.message };
  }

  if (payload.studentId && payload.student) {
    const studentUpdate = await supabase
      .from("students")
      .update({
        first_name: payload.student.firstName,
        program_interest: payload.student.programInterest,
        dob: payload.student.dob || "1970-01-01",
      })
      .eq("id", payload.studentId);

    if (studentUpdate.error) {
      return { error: studentUpdate.error.message };
    }
  }

  if (payload.lead) {
    const leadUpdate = await supabase
      .from("leads")
      .update({
        source: payload.lead.source,
        notes: payload.lead.notes,
      })
      .eq("id", payload.leadId);

    if (leadUpdate.error) {
      return { error: leadUpdate.error.message };
    }
  }

  revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  revalidatePath(`/dashboard/${franchiseSlug}/members`);
  return { success: true };
}
