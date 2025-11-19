"use server";

import { createClient } from "@/lib/supabase/server";
import { TaskSchema } from "@/lib/schemas/task";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/supabase";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

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
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${franchiseSlug}/actions`);
  if (data.leadId) {
    revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  }
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: "pending" | "completed", franchiseSlug: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${franchiseSlug}/actions`);
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
  return { success: true };
}

