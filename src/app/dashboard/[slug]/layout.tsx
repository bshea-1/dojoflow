import { Sidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const supabase = createClient();
  
  // Verify access to this franchise
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "sensei";
  let assignedFranchises: { name: string; slug: string }[] = [];

  // Always fetch the current franchise by slug so it can be included in the switcher
  const { data: currentFranchise } = await supabase
    .from("franchises")
    .select("name, slug")
    .eq("slug", params.slug)
    .single();

  if (userRole === "franchisee") {
    const { data } = await supabase
      .from("franchise_assignments")
      .select("franchises(name, slug)")
      .eq("profile_id", user.id);

    if (data) {
      // Guard against any null joined franchises (e.g. if a franchise was deleted)
      assignedFranchises = data
        .map((item: any) => item.franchises)
        .filter((f: any) => f && f.name && f.slug)
        .map((f: any) => ({
          name: f.name as string,
          slug: f.slug as string,
        }));
    }

    // Ensure the currently viewed franchise is always in the list,
    // even if the join above failed due to missing relationship/RLS.
    if (currentFranchise) {
      const alreadyIncluded = assignedFranchises.some(
        (f) => f.slug === currentFranchise.slug
      );
      if (!alreadyIncluded) {
        assignedFranchises.push(currentFranchise);
      }
    }
  } else {
    // For non-franchisees, they just have one location implicitly; show the current one.
    if (currentFranchise) {
      assignedFranchises = [currentFranchise];
    }
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        franchiseSlug={params.slug} 
        userRole={userRole}
        assignedFranchises={assignedFranchises}
      />
      
      <div className="md:pl-64 transition-all duration-200">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
          {/* Top bar content (User Profile, etc.) */}
          <div className="ml-auto flex items-center gap-4">
             <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
