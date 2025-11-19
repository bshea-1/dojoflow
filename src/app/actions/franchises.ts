"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserFranchises() {
  const supabase = createClient();
  
  // Get Current User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get User Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile) return [];

  if (profile.role === 'franchisee') {
    // Fetch all franchises linked to this franchisee via the junction table
    const { data: franchises } = await supabase
      .from("profile_franchises")
      .select(`
        franchises (
          id,
          name,
          slug
        )
      `)
      .eq("profile_id", profile.id);

    // Flatten the result
    return franchises?.map(f => f.franchises) || [];
  } else {
    // For other roles, fetch the single franchise linked via profile_franchises (assuming they are also migrated to use this table, or if we keep single linkage for them, we adapt)
    // The user request implies Franchisees specifically need multiple.
    // Let's assume standard users are also linked via this table now for consistency, or we fallback.
    // Since we are migrating to M:M, we should use the junction table for everyone.
    
    const { data: franchises } = await supabase
      .from("profile_franchises")
      .select(`
        franchises (
          id,
          name,
          slug
        )
      `)
      .eq("profile_id", profile.id);

    return franchises?.map(f => f.franchises) || [];
  }
}

