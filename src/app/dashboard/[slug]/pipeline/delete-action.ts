"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteLead(leadId: string, franchiseSlug: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/${franchiseSlug}/pipeline`);
  return { success: true };
}

