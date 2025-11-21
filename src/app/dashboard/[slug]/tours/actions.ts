"use server";

import { createClient } from "@/lib/supabase/server";
import { BookTourSchema, programLeadOptions } from "@/lib/schemas/book-tour";
import { revalidatePath } from "next/cache";
import { addDays, format, getDay } from "date-fns";
import { runAutomations } from "@/lib/automations/run-automations";
import { Database } from "@/types/supabase";

// Helper to parse time string "HH:mm" to hours
function parseTime(timeStr: string) {
  const [hours] = timeStr.split(":").map(Number);
  return hours;
}

// Helper to convert a Date to EST timezone and return as ISO string
// EST is UTC-5 (or UTC-4 during daylight saving time - EDT)
// This ensures all tour times are stored and displayed consistently in EST
// The input date should represent the time as the user entered it (treating as EST)
function toESTISOString(date: Date): string {
  // Get the date components - treat these as EST time
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ms = date.getMilliseconds();

  // Determine if DST is in effect for EST/EDT on this date
  // DST in US starts 2nd Sunday in March, ends 1st Sunday in November
  // Calculate 2nd Sunday in March
  const march1 = new Date(year, 2, 1);
  const marchFirstSunday = 7 - march1.getDay();
  const dstStart = new Date(year, 2, marchFirstSunday + 7);
  
  // Calculate 1st Sunday in November
  const nov1 = new Date(year, 10, 1);
  const novFirstSunday = 7 - nov1.getDay();
  const dstEnd = new Date(year, 10, novFirstSunday);
  
  const testDate = new Date(year, month, day);
  const isDST = testDate >= dstStart && testDate < dstEnd;
  const estOffsetHours = isDST ? 4 : 5; // EDT is UTC-4, EST is UTC-5

  // Create UTC date by adding EST offset (EST is behind UTC)
  // If it's 4pm EST, that's 9pm UTC (EST is UTC-5, so add 5 hours)
  // If it's 4pm EDT, that's 8pm UTC (EDT is UTC-4, so add 4 hours)
  const utcDate = new Date(Date.UTC(year, month, day, hours + estOffsetHours, minutes, seconds, ms));

  return utcDate.toISOString();
}

type TourStatus = Database["public"]["Tables"]["tours"]["Row"]["status"];

type LeadStatus = Database["public"]["Tables"]["leads"]["Row"]["status"];

async function upsertTourTask(params: {
  supabase: ReturnType<typeof createClient>;
  franchiseId: string;
  leadId: string;
  tourId: string;
  scheduledAt: string;
}) {
  const { supabase, franchiseId, leadId, tourId, scheduledAt } = params;
  // Convert UTC date back to EST for display
  // scheduledAt is stored as UTC but represents EST time
  const utcDate = new Date(scheduledAt);
  // EST is UTC-5 or UTC-4 (EDT)
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth();
  const day = utcDate.getUTCDate();
  const hours = utcDate.getUTCHours();
  const minutes = utcDate.getUTCMinutes();
  
  // Determine if DST is in effect
  const dstStart = new Date(year, 2, 14 - (new Date(year, 2, 1).getDay() + 1) % 7);
  const dstEnd = new Date(year, 10, 7 - (new Date(year, 10, 1).getDay() + 1) % 7);
  const testDate = new Date(year, month, day);
  const isDST = testDate >= dstStart && testDate < dstEnd;
  const estOffsetHours = isDST ? 4 : 5;
  
  // Convert UTC to EST
  const estDate = new Date(Date.UTC(year, month, day, hours - estOffsetHours, minutes));
  const friendlyDate = format(estDate, "MMM d, yyyy h:mm a");
  const description = `Tour scheduled for ${friendlyDate}`;

  const { data: existingTask, error: fetchError } = await supabase
    .from("tasks")
    .select("id, status")
    .eq("tour_id", tourId)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching existing tour task:", fetchError);
  }

  if (existingTask) {
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        due_date: scheduledAt,
        description,
      })
      .eq("id", existingTask.id);

    if (updateError) {
      console.error("Error updating tour task:", updateError);
    }
  } else {
    const scheduledDate = new Date(scheduledAt);
    const windowStart = new Date(scheduledDate.getTime() - 30 * 60 * 1000).toISOString();
    const windowEnd = new Date(scheduledDate.getTime() + 30 * 60 * 1000).toISOString();

    const { data: fallbackTask, error: fallbackError } = await supabase
      .from("tasks")
      .select("id")
      .eq("lead_id", leadId)
      .eq("title", "Tour Scheduled")
      .is("tour_id", null)
      .eq("status", "pending")
      .gte("due_date", windowStart)
      .lte("due_date", windowEnd)
      .order("due_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fallbackError) {
      console.error("Error fetching fallback task:", fallbackError);
    }

    if (fallbackTask) {
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          due_date: scheduledAt,
          description,
          tour_id: tourId,
          type: "tour",
        })
        .eq("id", fallbackTask.id);

      if (updateError) {
        console.error("Error updating fallback task:", updateError);
      }
    } else {
      const { error: insertError } = await supabase.from("tasks").insert({
        franchise_id: franchiseId,
        lead_id: leadId,
        tour_id: tourId,
        title: "Tour Scheduled",
        description,
        due_date: scheduledAt,
        type: "tour",
        status: "pending",
      });

      if (insertError) {
        console.error("Error inserting tour task:", insertError);
        throw insertError;
      }
    }
  }
}

async function createFollowUpTask(params: {
  supabase: ReturnType<typeof createClient>;
  franchiseId: string;
  leadId: string;
  franchiseSlug: string;
  title: string;
  description: string;
  dueDate: Date;
}) {
  const { supabase, franchiseId, leadId, franchiseSlug, title, description, dueDate } = params;
  await supabase.from("tasks").insert({
    franchise_id: franchiseId,
    lead_id: leadId,
    title,
    description,
    due_date: dueDate.toISOString(),
    type: "call",
    status: "pending",
  });
  revalidatePath(`/dashboard/${franchiseSlug}/actions`);
}

async function handleTourStatusChange(params: {
  supabase: ReturnType<typeof createClient>;
  tourId: string;
  leadId: string;
  franchiseId: string;
  franchiseSlug: string;
  newTourStatus: TourStatus;
  scheduledAt: string;
}) {
  const { supabase, tourId, leadId, franchiseId, franchiseSlug, newTourStatus, scheduledAt } =
    params;

  if (!leadId) return;

  let leadStatusUpdate: LeadStatus | undefined;
  if (newTourStatus === "completed") {
    leadStatusUpdate = "tour_completed";
  } else if (newTourStatus === "no-show") {
    leadStatusUpdate = "tour_not_completed";
  }

  if (leadStatusUpdate) {
    await supabase
      .from("leads")
      .update({ status: leadStatusUpdate })
      .eq("id", leadId);

    await runAutomations({
      trigger: "status_changed",
      franchiseId,
      leadId,
      franchiseSlug,
      context: { newStatus: leadStatusUpdate },
    });

    if (leadStatusUpdate === "tour_completed") {
      await runAutomations({
        trigger: "tour_completed",
        franchiseId,
        leadId,
        franchiseSlug,
        context: { newStatus: leadStatusUpdate },
      });
    }
  }

  const outcomeLabel =
    newTourStatus === "completed" ? "Tour Completed" : "Tour Not Completed";

  // Mark the tour task as completed
  const { error: taskUpdateError } = await supabase
    .from("tasks")
    .update({
      status: "completed",
      outcome: outcomeLabel,
    })
    .eq("tour_id", tourId);

  if (taskUpdateError) {
    console.error("Error updating tour task status:", taskUpdateError);
  }

  // Calculate follow-up date as start of next day (9 AM)
  const tourDate = new Date(scheduledAt);
  const nextDay = addDays(tourDate, 1);
  nextDay.setHours(9, 0, 0, 0); // Set to 9 AM the next day

  if (newTourStatus === "completed") {
    await createFollowUpTask({
      supabase,
      franchiseId,
      leadId,
      franchiseSlug,
      title: "Post-Tour Follow-up",
      description: "Call family to discuss enrollment options.",
      dueDate: nextDay,
    });
  } else if (newTourStatus === "no-show") {
    await createFollowUpTask({
      supabase,
      franchiseId,
      leadId,
      franchiseSlug,
      title: "Tour No-Show Follow-up",
      description: "Reach out to reschedule their tour.",
      dueDate: nextDay,
    });
  }
}

function revalidateTourSurfaces(franchiseSlug: string) {
  revalidatePath(`/dashboard/${franchiseSlug}/tours`);
  revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  revalidatePath(`/dashboard/${franchiseSlug}/actions`);
}

export async function bookTour(data: BookTourSchema, franchiseSlug: string) {
  const supabase = createClient();

  // 1. Get Franchise ID
  const { data: franchise, error: franchiseError } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", franchiseSlug)
    .single();

  if (franchiseError || !franchise) {
    return { error: franchiseError?.message || "Franchise not found" };
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
      franchiseSlug,
    });
  }

  if (!leadId) {
    return { error: "Select or create a lead before booking." };
  }

  // 3. Create Tour
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .insert({
      franchise_id: franchise.id,
      lead_id: leadId,
      scheduled_at: toESTISOString(data.scheduledAt),
      status: "scheduled",
    })
    .select()
    .single();

  if (tourError || !tour) {
    return { error: tourError?.message || "Failed to book tour" };
  }

  try {
    await upsertTourTask({
      supabase,
      franchiseId: franchise.id,
      leadId,
      tourId: tour.id,
      scheduledAt: toESTISOString(data.scheduledAt),
    });
  } catch (taskError: any) {
    console.error("Error creating tour task:", taskError);
    // Continue even if task creation fails - tour is still booked
  }

  // 4. Update Lead Status
  const { error: updateError } = await supabase
    .from("leads")
    .update({ status: "tour_booked" })
    .eq("id", leadId);

  if (updateError) {
    return { error: updateError.message || "Tour booked but failed to update lead status." };
  }

  await runAutomations({
    trigger: "status_changed",
    franchiseId: franchise.id,
    leadId,
    franchiseSlug,
    context: { newStatus: "tour_booked" },
  });

  await runAutomations({
    trigger: "tour_booked",
    franchiseId: franchise.id,
    leadId,
    franchiseSlug,
    context: { newStatus: "tour_booked" },
  });

  revalidateTourSurfaces(franchiseSlug);

  return { success: true };
}

export async function updateTour(
  tourId: string,
  data: { scheduledAt?: string; status?: TourStatus },
  franchiseSlug: string
) {
  const supabase = createClient();

  const { data: existingTour, error: fetchError } = await supabase
    .from("tours")
    .select("lead_id, franchise_id, status, scheduled_at")
    .eq("id", tourId)
    .single();

  if (fetchError || !existingTour) {
    return { error: fetchError?.message || "Tour not found" };
  }

  const updates: Record<string, any> = {};
  if (data.scheduledAt) {
    // Convert to EST before storing
    updates.scheduled_at = toESTISOString(new Date(data.scheduledAt));
  }
  if (data.status) {
    updates.status = data.status;
  }

  if (Object.keys(updates).length === 0) {
    return { success: true };
  }

  const { error } = await supabase
    .from("tours")
    .update(updates)
    .eq("id", tourId);

  if (error) {
    return { error: error.message };
  }

  const scheduledAtIso = updates.scheduled_at ?? existingTour.scheduled_at;

  // Only update the tour task if the scheduled time changed (not just status)
  // If status changed to completed/no-show, handleTourStatusChange will mark the task as completed
  if (updates.scheduled_at && scheduledAtIso && data.status !== "completed" && data.status !== "no-show") {
    await upsertTourTask({
      supabase,
      franchiseId: existingTour.franchise_id,
      leadId: existingTour.lead_id,
      tourId,
      scheduledAt: scheduledAtIso,
    });
  }

  // Handle status changes (completed/no-show)
  if (data.status && data.status !== existingTour.status && scheduledAtIso) {
    await handleTourStatusChange({
      supabase,
      tourId,
      leadId: existingTour.lead_id,
      franchiseId: existingTour.franchise_id,
      franchiseSlug,
      newTourStatus: data.status,
      scheduledAt: scheduledAtIso,
    });
  }

  revalidateTourSurfaces(franchiseSlug);
  return { success: true };
}

export async function deleteTour(tourId: string, franchiseSlug: string) {
  const supabase = createClient();

  const { data: existingTour } = await supabase
    .from("tours")
    .select("lead_id, scheduled_at")
    .eq("id", tourId)
    .single();

  const { error } = await supabase.from("tours").delete().eq("id", tourId);

  if (error) {
    return { error: error.message };
  }

  if (existingTour?.lead_id) {
    await supabase
      .from("leads")
      .update({ status: "contacted" })
      .eq("id", existingTour.lead_id);
  }

  await supabase.from("tasks").delete().eq("tour_id", tourId);

  if (existingTour?.lead_id && existingTour.scheduled_at) {
    const scheduledDate = new Date(existingTour.scheduled_at);
    const windowStart = new Date(
      scheduledDate.getTime() - 30 * 60 * 1000
    ).toISOString();
    const windowEnd = new Date(
      scheduledDate.getTime() + 30 * 60 * 1000
    ).toISOString();

    await supabase
      .from("tasks")
      .delete()
      .eq("lead_id", existingTour.lead_id)
      .eq("title", "Tour Scheduled")
      .is("tour_id", null)
      .eq("status", "pending")
      .gte("due_date", windowStart)
      .lte("due_date", windowEnd);
  }

  revalidateTourSurfaces(franchiseSlug);
  return { success: true };
}
