"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { PipelineColumn } from "./pipeline-column";
import { LeadCard } from "./lead-card";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLeadStatus } from "@/app/dashboard/[slug]/pipeline/actions";
import { Database } from "@/types/supabase";
import { toast } from "sonner";
import { LeadDetailDialog } from "./lead-detail-dialog";

type LeadStatus = Database["public"]["Tables"]["leads"]["Row"]["status"];
type GuardianWithStudents = Database["public"]["Tables"]["guardians"]["Row"] & {
  students: Database["public"]["Tables"]["students"]["Row"][];
};

type LeadWithGuardian = Database["public"]["Tables"]["leads"]["Row"] & {
  guardians: GuardianWithStudents[];
};

const COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: "new", title: "New Leads" },
  { id: "contacted", title: "Contacted" },
  { id: "tour_booked", title: "Tour Booked" },
  { id: "tour_completed", title: "Tour Completed" },
  { id: "enrolled", title: "Enrolled" },
  { id: "lost", title: "Lost" },
];

interface PipelineBoardProps {
  initialLeads?: LeadWithGuardian[];
  franchiseSlug: string;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export function PipelineBoard({ franchiseSlug, initialLeads }: PipelineBoardProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadWithGuardian | null>(null);

  const { data: leads = [] } = useQuery({
    queryKey: ["leads", franchiseSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*, guardians(*, students(*))");
      
      if (error) throw error;
      return data as LeadWithGuardian[];
    },
    initialData: initialLeads,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      return await updateLeadStatus(id, status);
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["leads", franchiseSlug] });
      const previousLeads = queryClient.getQueryData(["leads", franchiseSlug]);

      queryClient.setQueryData(["leads", franchiseSlug], (old: LeadWithGuardian[] = []) => {
        return old.map((lead) =>
          lead.id === id ? { ...lead, status } : lead
        );
      });

      return { previousLeads };
    },
    onError: (err, newLead, context) => {
      queryClient.setQueryData(["leads", franchiseSlug], context?.previousLeads);
      toast.error("Failed to update status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", franchiseSlug] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group leads by column
  const columns = useMemo(() => {
    const grouped = COLUMNS.map((col) => ({
      ...col,
      leads: leads.filter((lead) => lead.status === col.id),
    }));
    return grouped;
  }, [leads]);

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeId),
    [activeId, leads]
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    // In a more complex implementation, we might move items between arrays here for smooth list reordering
    // For now, we handle the logical move on DragEnd
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    // Find which column the "over" target belongs to
    // "over" could be a column ID or another card ID
    let newStatus: LeadStatus | undefined;

    // Check if over a column directly
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn) {
      newStatus = overColumn.id;
    } else {
      // Check if over a card
      const overLead = leads.find((l) => l.id === overId);
      if (overLead) {
        newStatus = overLead.status;
      }
    }

    if (newStatus && activeLead && activeLead.status !== newStatus) {
      mutation.mutate({ id: activeLeadId, status: newStatus });
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-[calc(100vh-10rem)] gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <PipelineColumn
              key={col.id}
              id={col.id || "new"}
              title={col.title}
              leads={col.leads}
              onLeadClick={(lead) => setSelectedLead(lead)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeLead ? <LeadCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>

      {selectedLead && (
        <LeadDetailDialog
          lead={selectedLead}
          franchiseSlug={franchiseSlug}
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
        />
      )}
    </>
  );
}
