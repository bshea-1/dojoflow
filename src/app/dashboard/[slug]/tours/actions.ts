"use server";

import { createClient } from "@/lib/supabase/server";
import { BookTourSchema } from "@/lib/schemas/book-tour";
import { revalidatePath } from "next/cache";
import { getDay } from "date-fns";

// Helper to parse time string "HH:mm" to hours
function parseTime(timeStr: string) {
  const [hours] = timeStr.split(":").map(Number);
  return hours;
}

export async function bookTour(data: BookTourSchema, franchiseSlug: string) {
  const supabase = createClient();

  // 1. Get Franchise Settings
  const { data: franchise, error: franchiseError } = await supabase
    .from("franchises")
    .select("id, settings")
    .eq("slug", franchiseSlug)
    .single();

  if (franchiseError || !franchise) {
    return { error: "Franchise not found" };
  }

  // 2. Validate Operating Hours
  const scheduledDate = new Date(data.scheduledAt);
  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][getDay(scheduledDate)];
  const hour = scheduledDate.getHours();

  const settings = franchise.settings as any;
  const operatingHours = settings?.operating_hours || {
    // Default fallback if not set
    Mon: { open: "10:00", close: "19:00" },
    Tue: { open: "10:00", close: "19:00" },
    Wed: { open: "10:00", close: "19:00" },
    Thu: { open: "10:00", close: "19:00" },
    Fri: { open: "10:00", close: "19:00" },
    Sat: { open: "09:00", close: "14:00" },
    Sun: null, // Closed
  };

  const dayHours = operatingHours[dayOfWeek];

  if (!dayHours) {
    return { error: `We are closed on ${dayOfWeek}.` };
  }

  const openHour = parseTime(dayHours.open);
  const closeHour = parseTime(dayHours.close);

  if (hour < openHour || hour >= closeHour) {
    return { error: `Selected time is outside operating hours (${dayHours.open} - ${dayHours.close}).` };
  }

  // 3. Create Tour
  const { error: tourError } = await supabase
    .from("tours")
    .insert({
      franchise_id: franchise.id,
      lead_id: data.leadId,
      scheduled_at: data.scheduledAt.toISOString(),
      status: "scheduled",
    });

  if (tourError) {
    return { error: "Failed to book tour" };
  }

  // 4. Update Lead Status
  await supabase
    .from("leads")
    .update({ status: "tour_booked" })
    .eq("id", data.leadId);

  revalidatePath(`/dashboard/${franchiseSlug}/tours`);
  revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  
  return { success: true };
}

