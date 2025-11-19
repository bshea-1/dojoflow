"use server";

import { createClient } from "@/lib/supabase/server";
import { PromoteStudentSchema } from "@/lib/schemas/student";
import { revalidatePath } from "next/cache";

export async function promoteStudent(data: PromoteStudentSchema, franchiseSlug: string) {
  const supabase = createClient();

  // 1. Verify User Access (Implicit via RLS, but good to check franchise context if needed)
  // The RLS on 'promotions' checks if the student belongs to the user's franchise.

  // 2. Insert Promotion Record
  const { error: promoError } = await supabase
    .from("promotions")
    .insert({
      student_id: data.studentId,
      belt_rank: data.newBelt,
      promoted_at: data.promotedAt.toISOString(),
    });

  if (promoError) {
    return { error: "Failed to record promotion history" };
  }

  // 3. Update Student Current Belt
  const { error: updateError } = await supabase
    .from("students")
    .update({
      current_belt: data.newBelt,
      last_promotion_date: data.promotedAt.toISOString(),
    })
    .eq("id", data.studentId);

  if (updateError) {
    return { error: "Failed to update student profile" };
  }

  revalidatePath(`/dashboard/${franchiseSlug}/students/${data.studentId}`);
  return { success: true };
}

