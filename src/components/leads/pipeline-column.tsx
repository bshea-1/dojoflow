import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { LeadCard } from "./lead-card";
import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";

type LeadWithGuardian = Database["public"]["Tables"]["leads"]["Row"] & {
  guardians: Database["public"]["Tables"]["guardians"]["Row"][];
};

interface PipelineColumnProps {
  id: string;
  title: string;
  leads: LeadWithGuardian[];
  onLeadClick?: (lead: LeadWithGuardian) => void;
}

export function PipelineColumn({ id, title, leads, onLeadClick }: PipelineColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col h-full min-w-[280px] w-80 rounded-lg bg-slate-100 p-2">
      <div className="flex items-center justify-between p-2 mb-2">
        <h3 className="font-semibold text-sm text-slate-700">{title}</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
          {leads.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-[100px]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onClick={() => onLeadClick?.(lead)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
