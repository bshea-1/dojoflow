"use server";

import { createClient } from "@/lib/supabase/server";

export type Member = {
  id: string;
  studentId: string;
  leadId: string;
  guardianId: string;
  guardianFirstName: string;
  guardianLastName: string;
  studentName: string;
  program: string;
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
          program: student.program_interest,
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

