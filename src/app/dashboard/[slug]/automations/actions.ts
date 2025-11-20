"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/supabase";

export type Automation = Database["public"]["Tables"]["automations"]["Row"];
export type NewAutomation = Database["public"]["Tables"]["automations"]["Insert"];

export async function getAutomations(franchiseSlug: string) {
  const supabase = createClient();

  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", franchiseSlug)
    .single();

  if (!franchise) return [];

  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .eq("franchise_id", franchise.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching automations:", error);
    return [];
  }

  return data as Automation[];
}

export async function createAutomation(
  automation: Omit<NewAutomation, "franchise_id">,
  franchiseSlug: string
) {
  const supabase = createClient();

  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", franchiseSlug)
    .single();

  if (!franchise) return { error: "Franchise not found" };

  const { error } = await supabase
    .from("automations")
    .insert({
      ...automation,
      franchise_id: franchise.id,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/${franchiseSlug}/automations`);
  return { success: true };
}

export async function updateAutomation(
  id: string,
  automation: Partial<Omit<NewAutomation, "franchise_id">>,
  franchiseSlug: string
) {
  const supabase = createClient();

  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", franchiseSlug)
    .single();

  if (!franchise) return { error: "Franchise not found" };

  const { error } = await supabase
    .from("automations")
    .update({
      ...automation,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("franchise_id", franchise.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/${franchiseSlug}/automations`);
  return { success: true };
}

export async function deleteAutomation(id: string, franchiseSlug: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("automations")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/${franchiseSlug}/automations`);
  return { success: true };
}

export async function toggleAutomation(id: string, active: boolean, franchiseSlug: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("automations")
    .update({ active })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/${franchiseSlug}/automations`);
  return { success: true };
}
