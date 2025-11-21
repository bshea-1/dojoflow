"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSettings(franchiseSlug: string, formData: FormData) {
  const supabase = createClient();

  // Extract theme from form data
  const theme = formData.get("theme") as string;

  // Fetch current settings to merge
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id, settings")
    .eq("slug", franchiseSlug)
    .single();

  if (!franchise) {
    return;
  }

  const currentSettings = (franchise.settings as any) || {};

  const newSettings = {
    ...currentSettings,
    theme: theme || "light",
  };

  const { error } = await supabase
    .from("franchises")
    .update({ settings: newSettings })
    .eq("id", franchise.id);

  if (error) {
    console.error("Failed to update settings:", error);
    return;
  }

  revalidatePath(`/dashboard/${franchiseSlug}/settings`);
}
