"use server";

import { createClient } from "@/lib/supabase/server";
import { TaskSchema } from "@/lib/schemas/task";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/supabase";

export type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  leads?: {
    guardians: {
      first_name: string;
      last_name: string;
    }[];
  } | null;
};

export async function getTasks(franchiseSlug: string) {
  const supabase = createClient();

  // Get franchise ID
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", franchiseSlug)
    .single();

  if (!franchise) return [];

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(`
      *,
      leads (
        id,
        guardians (
          first_name,
          last_name
        )
      )
    `)
    .eq("franchise_id", franchise.id)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return tasks;
}

export async function getPendingTaskCount(franchiseSlug: string) {
  const supabase = createClient();

  // Get franchise ID
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", franchiseSlug)
    .single();

  if (!franchise) return 0;

  const { count, error } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("franchise_id", franchise.id)
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching task count:", error);
    return 0;
  }

  return count || 0;
}

export async function createTask(data: TaskSchema, franchiseSlug: string) {
  const supabase = createClient();

  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", franchiseSlug)
    .single();

  if (!franchise) return { error: "Franchise not found" };

  const { error } = await supabase.from("tasks").insert({
    franchise_id: franchise.id,
    title: data.title,
    description: data.description,
    due_date: data.dueDate ? data.dueDate.toISOString() : null,
    type: data.type,
    lead_id: data.leadId,
    status: "pending",
    notify_email: data.notifyEmail,
    notify_sms: data.notifySms,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${franchiseSlug}/actions`);
  if (data.leadId) {
    revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  }
  return { success: true };
}

export async function updateTaskStatus(
  taskId: string,
  status: "pending" | "completed",
  franchiseSlug: string,
  outcome?: string
) {
  const supabase = createClient();

  const updateData: any = { status };
  if (outcome !== undefined) {
    updateData.outcome = outcome;
  }

  const { error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${franchiseSlug}/actions`);
  revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  return { success: true };
}

export async function deleteTask(taskId: string, franchiseSlug: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${franchiseSlug}/actions`);
  revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  return { success: true };
}
