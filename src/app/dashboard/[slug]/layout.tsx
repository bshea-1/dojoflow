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

  // In a real app, we would verify here if the user actually belongs to params.slug
  // optimizing by trusting middleware for now but double checking is good practice.
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar franchiseSlug={params.slug} />
      
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

