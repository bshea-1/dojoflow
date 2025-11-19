"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateSettings(franchiseSlug: string, formData: FormData) {
  const supabase = createClient();

  // Extract operating hours from form data
  // Expected format: "Mon_open", "Mon_close", etc.
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const operating_hours: Record<string, { open: string; close: string } | null> = {};

  days.forEach(day => {
    const open = formData.get(`${day}_open`) as string;
    const close = formData.get(`${day}_close`) as string;
    const isClosed = formData.get(`${day}_closed`) === "on";

    if (isClosed || !open || !close) {
      operating_hours[day] = null;
    } else {
      operating_hours[day] = { open, close };
    }
  });

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
    operating_hours,
    // We do NOT update twilio_phone here anymore as requested
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
