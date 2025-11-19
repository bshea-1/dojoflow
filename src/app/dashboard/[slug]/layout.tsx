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

  if (userRole === "franchisee") {
    const { data } = await supabase
      .from("franchise_assignments")
      .select("franchises(name, slug)")
      .eq("profile_id", user.id);
    
    if (data) {
      assignedFranchises = data.map((item: any) => ({
        name: item.franchises.name,
        slug: item.franchises.slug,
      }));
    }
  } else {
    // For non-franchisees, they just have one location implicitly via profile or assignments
    // We can fetch it just to display the name correctly if needed, but for now simpler logic
    const { data: franchise } = await supabase.from("franchises").select("name, slug").eq("slug", params.slug).single();
    if (franchise) {
      assignedFranchises = [franchise];
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
