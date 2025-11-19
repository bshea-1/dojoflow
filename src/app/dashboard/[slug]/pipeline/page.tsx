import { PipelineBoard } from "@/components/leads/pipeline-board";
import { NewLeadDialog } from "@/components/leads/new-lead-dialog";
import { createClient } from "@/lib/supabase/server";
import { LeadWithGuardian } from "@/components/leads/types";

export default async function PipelinePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  // Get Current User Role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id || "")
    .single();
  
  const role = profile?.role || "sensei";
  const isReadOnly = role === "sensei"; // Senseis cannot add/edit

  // Get Franchise ID
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", params.slug)
    .single();

  const { data: leads } = await supabase
    .from("leads")
    .select("*, guardians(*, students(*))")
    .eq("franchise_id", franchise?.id || "")
    .order("created_at", { ascending: false });

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lead Pipeline</h1>
        {!isReadOnly && <NewLeadDialog franchiseSlug={params.slug} />}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <PipelineBoard 
          franchiseSlug={params.slug} 
          initialLeads={(leads as LeadWithGuardian[]) || []} 
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
}
