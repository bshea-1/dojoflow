"use server";

import { createClient } from "@/lib/supabase/server";
import { BookTourSchema, programLeadOptions } from "@/lib/schemas/book-tour";
import { revalidatePath } from "next/cache";
import { getDay } from "date-fns";
import { runAutomations } from "@/lib/automations/run-automations";

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
    return { error: franchiseError?.message || "Franchise not found" };
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

  let leadId = data.leadId;

  if (!leadId && data.newLead) {
    // Create the lead
    const childSummary = data.newLead.children
      .map((child) => `${child.name} (${child.age})`)
      .join(", ");
    const programSummary = data.newLead.programs
      .map(
        (program) =>
          programLeadOptions.find((opt) => opt.value === program)?.label ?? program
      )
      .join(", ");

    const { data: insertedLead, error: leadError } = await supabase
      .from("leads")
      .insert({
        franchise_id: franchise.id,
        status: "new",
        source: "Tour Booking",
        notes: `Children: ${childSummary} | Programs: ${programSummary}`,
      })
      .select()
      .single();

    if (leadError || !insertedLead) {
      return { error: leadError?.message || "Failed to create lead record" };
    }

    const { data: insertedGuardian, error: guardianError } = await supabase
      .from("guardians")
      .insert({
        lead_id: insertedLead.id,
        first_name: data.newLead.parentFirstName,
        last_name: data.newLead.parentLastName,
        email: data.newLead.parentEmail,
        phone: data.newLead.parentPhone,
      })
      .select("id") // return the ID
      .single();

    if (guardianError || !insertedGuardian) {
      return { error: guardianError?.message || "Failed to create guardian record" };
    }
    
    // Create student for new lead
    const { error: studentError } = await supabase
      .from("students")
      .insert({
        guardian_id: insertedGuardian.id,
        first_name: data.newLead.children[0]?.name || "Student",
        dob: "1970-01-01", // Default DOB
        program_interest: data.newLead.programs
      });

     if (studentError) {
       console.error("Failed to create student for tour booking:", studentError);
     }

    const newLeadId = insertedLead.id;
    leadId = newLeadId;

    await runAutomations({
      trigger: "lead_created",
      franchiseId: franchise.id,
      leadId: newLeadId,
    });
  }

  if (!leadId) {
    return { error: "Select or create a lead before booking." };
  }

  // 3. Create Tour
  const { error: tourError } = await supabase
    .from("tours")
    .insert({
      franchise_id: franchise.id,
      lead_id: leadId,
      scheduled_at: data.scheduledAt.toISOString(),
      status: "scheduled",
    });

  if (tourError) {
    return { error: tourError.message || "Failed to book tour" };
  }

  // 4. Update Lead Status
  const { error: updateError } = await supabase
    .from("leads")
    .update({ status: "tour_booked" })
    .eq("id", leadId);

  if (updateError) {
      return { error: updateError.message || "Tour booked but failed to update lead status." };
  }

  // 5. Create Task
  const { error: taskError } = await supabase
    .from("tasks")
    .insert({
      franchise_id: franchise.id,
      lead_id: leadId,
      title: "Tour Scheduled",
      description: `Tour scheduled for ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString()}`,
      due_date: scheduledDate.toISOString(),
      type: "other",
      status: "pending"
    });
    
  if (taskError) {
      console.error("Failed to create task for tour:", taskError);
  }

  await runAutomations({
    trigger: "status_changed",
    franchiseId: franchise.id,
    leadId,
    context: { newStatus: "tour_booked" },
  });

  await runAutomations({
    trigger: "tour_booked",
    franchiseId: franchise.id,
    leadId,
    context: { newStatus: "tour_booked" },
  });

  revalidatePath(`/dashboard/${franchiseSlug}/tours`);
  revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  
  return { success: true };
}
