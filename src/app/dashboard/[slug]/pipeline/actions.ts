"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import { NewLeadSchema } from "@/lib/schemas/new-lead";
import { revalidatePath } from "next/cache";

type LeadStatus = Database["public"]["Tables"]["leads"]["Row"]["status"];

export async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
  const supabase = createClient();

  const { error } = await supabase
    .from("leads")
    .update({ status: newStatus })
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

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

  revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  return { success: true };
}
