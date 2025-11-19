import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { KanbanSquare, Calendar } from "lucide-react";
import Link from "next/link";

export default async function DashboardOverview({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  // Fetch some basic stats
  // 1. Get Franchise ID
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!franchise) return <div>Franchise not found</div>;

  const [leadsRes, toursRes] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("franchise_id", franchise.id),
    supabase.from("tours").select("*", { count: "exact", head: true }).eq("franchise_id", franchise.id).eq("status", "scheduled"),
  ]);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard: {franchise.name}</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Link href={`/dashboard/${params.slug}/pipeline`}>
          <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <KanbanSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadsRes.count || 0}</div>
              <p className="text-xs text-muted-foreground">Active in pipeline</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/${params.slug}/tours`}>
          <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Tours</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toursRes.count || 0}</div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

