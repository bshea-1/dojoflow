"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Member = {
  id: string;
  studentId: string;
  leadId: string;
  guardianId: string;
  guardianFirstName: string;
  guardianLastName: string;
  studentName: string;
  program: string[];
  status: string;
  email: string;
  phone: string;
  source?: string | null;
  notes?: string | null;
};

export async function getMembers(franchiseSlug: string): Promise<Member[]> {
  const supabase = createClient();

  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", franchiseSlug)
    .single();

  if (!franchise) return [];

  const { data: leads, error } = await supabase
    .from("leads")
    .select(`
      id,
      status,
      source,
      notes,
      guardians (
        id,
        first_name,
        last_name,
        email,
        phone,
        students (
          id,
          first_name,
          program_interest
        )
      )
    `)
    .eq("franchise_id", franchise.id);

  if (error || !leads) {
    console.error("Error fetching members:", error);
    return [];
  }

  const members: Member[] = [];

  leads.forEach((lead) => {
    lead.guardians?.forEach((guardian: any) => {
      guardian.students?.forEach((student: any) => {
        members.push({
          id: student.id,
          studentId: student.id,
          leadId: lead.id,
          guardianId: guardian.id,
          guardianFirstName: guardian.first_name,
          guardianLastName: guardian.last_name,
          studentName: student.first_name,
          program: Array.isArray(student.program_interest) ? student.program_interest : [],
          status: lead.status || "active",
          email: guardian.email,
          phone: guardian.phone,
          source: lead.source,
          notes: lead.notes,
        });
      });
    });
  });

  return members;
}

export async function getFamilyTasks(leadId: string) {
  const supabase = createClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("lead_id", leadId)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching family tasks:", error);
    return [];
  }

  return tasks || [];
}

export async function updateLeadNotes(leadId: string, notes: string, franchiseSlug: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("leads")
    .update({ notes })
    .eq("id", leadId);

  if (error) {
    console.error("Error updating lead notes:", error);
    throw new Error("Failed to update notes");
  }

  revalidatePath(`/dashboard/${franchiseSlug}/members`);
}
