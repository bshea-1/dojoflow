import { Sidebar } from "@/components/dashboard/sidebar";
import { PageTransition } from "@/components/dashboard/page-transition";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPendingTaskCount } from "./actions/actions";

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
    .select("role, franchise_id")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "sensei";
  const userFranchiseId = profile?.franchise_id as string | null | undefined;
  let assignedFranchises: { name: string; slug: string }[] = [];

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
      assignedFranchises = data
        .map((item: any) => item.franchises)
        .filter((f: any) => f && f.name && f.slug)
        .map((f: any) => ({
          name: f.name as string,
          slug: f.slug as string,
        }));
    }

    // If the current slug is not one of the assigned franchises, redirect
    if (assignedFranchises.length > 0) {
      const slugAllowed = assignedFranchises.some(
        (f) => f.slug === params.slug
      );
      if (!slugAllowed) {
        redirect(`/dashboard/${assignedFranchises[0].slug}`);
      }
    } else if (currentFranchise) {
      // Fallback: no assignments found, but slug maps to a franchise
      assignedFranchises = [currentFranchise];
    }
  } else {
    // For non-franchisee roles, tie to the franchise_id on the profile when possible
    if (userFranchiseId) {
      const { data: primaryFranchise } = await supabase
        .from("franchises")
        .select("name, slug")
        .eq("id", userFranchiseId)
        .single();

      if (primaryFranchise) {
        assignedFranchises = [primaryFranchise];

        // If URL slug doesn't match their profile franchise, redirect
        if (params.slug !== primaryFranchise.slug) {
          redirect(`/dashboard/${primaryFranchise.slug}`);
        }
      } else if (currentFranchise) {
        // Fallback: profile franchise_id invalid, but slug points to a real franchise
        assignedFranchises = [currentFranchise];
      }
    } else if (currentFranchise) {
      // No franchise_id on profile; fall back to the current slug's franchise
      assignedFranchises = [currentFranchise];
    }
  }

  const taskCount = await getPendingTaskCount(params.slug);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        franchiseSlug={params.slug}
        userRole={userRole}
        assignedFranchises={assignedFranchises}
        taskCount={taskCount}
      />

      <div className="md:pl-64 transition-all duration-200">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
          {/* Top bar content (User Profile, etc.) */}
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </header>
        <main className="p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
