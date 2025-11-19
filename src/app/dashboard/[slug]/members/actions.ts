"use server";

import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

type Member = {
  id: string;
  guardian_name: string;
  student_name: string;
  belt: string;
  program: string;
  status: string; // Derived or stored? Assuming active if enrolled
  email: string;
  phone: string;
};

export async function getMembers(franchiseSlug: string) {
  const supabase = createClient();

  // Get franchise ID
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", franchiseSlug)
    .single();

  if (!franchise) return [];

  // Fetch students with guardians
  // We need to join students -> guardians -> leads (to check franchise_id)
  // But RLS should handle franchise_id check if we just query students?
  // RLS for students: USING (EXISTS (SELECT 1 FROM guardians JOIN leads ... WHERE leads.franchise_id = get_my_franchise_id()))
  // So we can just query students directly if we are logged in.
  
  const { data: students, error } = await supabase
    .from("students")
    .select(`
      *,
      guardians (
        first_name,
        last_name,
        email,
        phone
      )
    `);

  if (error) {
    console.error("Error fetching members:", error);
    return [];
  }

  // Transform to Member type
  return students.map((student) => ({
    id: student.id,
    guardian_name: `${student.guardians?.first_name} ${student.guardians?.last_name}`,
    student_name: student.first_name,
    belt: student.current_belt || "White",
    program: student.program_interest,
    status: "Active", // Placeholder logic
    email: student.guardians?.email,
    phone: student.guardians?.phone,
  }));
}

