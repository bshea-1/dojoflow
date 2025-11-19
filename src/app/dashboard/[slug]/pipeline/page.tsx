import { PipelineBoard } from "@/components/leads/pipeline-board";
import { NewLeadDialog } from "@/components/leads/new-lead-dialog";

export default function PipelinePage({ params }: { params: { slug: string } }) {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lead Pipeline</h1>
        <NewLeadDialog franchiseSlug={params.slug} />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <PipelineBoard franchiseSlug={params.slug} />
      </div>
    </div>
  );
}
