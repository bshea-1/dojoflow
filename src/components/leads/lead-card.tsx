import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/types/supabase";
import { differenceInHours } from "date-fns";
import { Badge } from "@/components/ui/badge"; // Need to create Badge or just use div
import { cn } from "@/lib/utils";

// We need a type that includes the guardian
type LeadWithGuardian = Database["public"]["Tables"]["leads"]["Row"] & {
  guardians: Database["public"]["Tables"]["guardians"]["Row"][];
};

interface LeadCardProps {
  lead: LeadWithGuardian;
}

export function LeadCard({ lead }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: {
      type: "Lead",
      lead,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Staleness Logic
  const isStale =
    lead.status === "new" &&
    differenceInHours(new Date(), new Date(lead.created_at)) > 4;

  const guardianName = lead.guardians?.[0]
    ? `${lead.guardians[0].first_name} ${lead.guardians[0].last_name}`
    : "Unknown Guardian";

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg h-24"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <Card className={cn("cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow", isStale && "border-destructive border-2")}>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-semibold">
              {guardianName}
            </CardTitle>
            {isStale && (
              <span className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                STALE
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-xs text-muted-foreground">
            Source: {lead.source || "Direct"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
             {new Date(lead.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

