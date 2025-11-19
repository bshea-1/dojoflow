import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardRoot() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Double check if they have a franchise now
  const { data: profile } = await supabase
    .from("profiles")
    .select("franchises (slug)")
    .eq("id", user.id)
    .single();

  const slug = (profile as any)?.franchises?.slug;

  if (slug) {
    redirect(`/dashboard/${slug}`);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-destructive">No Franchise Assigned</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your account is created, but you are not linked to any Code Ninjas location yet.
          </p>
          <p className="text-sm">
            Please contact your administrator or support to get access.
          </p>
          <div className="text-xs text-slate-400">
            User ID: {user.id}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

