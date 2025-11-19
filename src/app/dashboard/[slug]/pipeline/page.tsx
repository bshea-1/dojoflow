import { PipelineBoard } from "@/components/leads/pipeline-board";
import { NewLeadDialog } from "@/components/leads/new-lead-dialog";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

type StudentRow = Database["public"]["Tables"]["students"]["Row"];
type GuardianRow = Database["public"]["Tables"]["guardians"]["Row"] & {
  students: StudentRow[];
};

type LeadWithGuardian = Database["public"]["Tables"]["leads"]["Row"] & {
  guardians: GuardianRow[];
};

export default async function PipelinePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  const { data: leads } = await supabase
    .from("leads")
    .select("*, guardians(*, students(*))");

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lead Pipeline</h1>
        <NewLeadDialog franchiseSlug={params.slug} />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <PipelineBoard 
          franchiseSlug={params.slug} 
          initialLeads={(leads as LeadWithGuardian[]) || []} 
        />
      </div>
    </div>
  );
}
