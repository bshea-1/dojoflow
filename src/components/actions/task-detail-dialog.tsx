"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Database } from "@/types/supabase";
import { updateTaskStatus, deleteTask } from "@/app/dashboard/[slug]/actions/actions";
import { updateTour } from "@/app/dashboard/[slug]/tours/actions";

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  leads?: {
    id: string;
    guardians: {
      first_name: string;
      last_name: string;
    }[];
  } | null;
};

interface TaskDetailDialogProps {
  task: Task;
  franchiseSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveAndAdd?: () => void;
  isReadOnly?: boolean;
}

const OUTCOME_OPTIONS = [
  "Called, answered",
  "Called, left message",
  "Called, no answer",
  "Emailed",
  "Texted",
  "Tour Scheduled",
  "Tour Completed",
  "Tour Not Completed",
  "Enrolled",
  "Not Interested",
  "Other",
];

export function TaskDetailDialog({ 
  task, 
  franchiseSlug, 
  open, 
  onOpenChange,
  onSaveAndAdd,
  isReadOnly = false
}: TaskDetailDialogProps) {
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState<string>(task.outcome || "");
  const [notes, setNotes] = useState<string>(task.description || "");
  const [isTourActionPending, setIsTourActionPending] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: "pending" | "completed"; closeAfter?: boolean }) => {
      await updateTaskStatus(task.id, status, franchiseSlug, outcome);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", franchiseSlug] });
      if (task.lead_id) {
        queryClient.invalidateQueries({ queryKey: ["tasks", task.lead_id] });
      }
      toast.success("Task saved");
      if (variables?.closeAfter) {
        onSaveAndAdd?.();
        onOpenChange(false);
      }
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => deleteTask(task.id, franchiseSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", franchiseSlug] });
      if (task.lead_id) {
        queryClient.invalidateQueries({ queryKey: ["tasks", task.lead_id] });
      }
      toast.success("Task deleted");
      onOpenChange(false);
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "text":
        return <MessageSquare className="h-4 w-4" />;
      case "review":
        return <User className="h-4 w-4" />;
      case "tour":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const handleTourAction = async (status: "completed" | "no-show") => {
    if (!task.tour_id) return;
    setIsTourActionPending(true);
    const outcomeLabel = status === "completed" ? "Tour Completed" : "Tour Not Completed";
    setOutcome(outcomeLabel);
    try {
      const result = await updateTour(
        task.tour_id,
        { status, scheduledAt: task.due_date || undefined },
        franchiseSlug
      );
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      await updateStatusMutation.mutateAsync({ status: "completed", closeAfter: true });
    } catch (error) {
      toast.error("Failed to update tour");
    } finally {
      setIsTourActionPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getIcon(task.type)}
              <DialogTitle>{task.title}</DialogTitle>
            </div>
            {!isReadOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (confirm("Delete this task?")) {
                    deleteTaskMutation.mutate();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DialogDescription>
            {task.leads ? (
              <span>
                For: {task.leads.guardians[0]?.first_name} {task.leads.guardians[0]?.last_name}
              </span>
            ) : (
              <span>General Task</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Due: {task.due_date ? format(new Date(task.due_date), "PPP") : "No due date"}
          </div>

          {task.type === "tour" && task.tour_id && (
            <div className="space-y-2 rounded-md border border-dashed border-muted p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Tour Actions
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={isTourActionPending}
                  onClick={() => handleTourAction("completed")}
                >
                  Mark Tour Completed
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  disabled={isTourActionPending}
                  onClick={() => handleTourAction("no-show")}
                >
                  Tour Not Completed
                </Button>
              </div>
            </div>
          )}

          {task.description && (
            <div className="text-sm bg-muted p-3 rounded-md">
              {task.description}
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Completion Details</h4>
            
            <div className="space-y-2">
              <label className="text-xs font-medium">Outcome / Result</label>
              <Select value={outcome} onValueChange={setOutcome} disabled={isReadOnly}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome..." />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOME_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!isReadOnly ? (
            <>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                disabled={isTourActionPending}
                onClick={() => updateStatusMutation.mutate({ status: "completed" })}
              >
                Save Task
              </Button>
              <Button 
                className="w-full sm:w-auto"
                disabled={isTourActionPending}
                onClick={() => updateStatusMutation.mutate({ status: "completed", closeAfter: true })}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save + Add Task
              </Button>
            </>
          ) : (
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
