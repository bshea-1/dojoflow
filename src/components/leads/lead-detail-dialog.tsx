"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Mail, 
  MessageSquare, 
  Phone, 
  Plus, 
  Trash2,
  User
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { Database } from "@/types/supabase";
import { getLeadTasks, updateLeadStatus } from "@/app/dashboard/[slug]/pipeline/actions";
import { createTask, updateTaskStatus, deleteTask } from "@/app/dashboard/[slug]/actions/actions";
import { deleteLead } from "@/app/dashboard/[slug]/pipeline/delete-action";
import { LeadEditForm } from "./lead-edit-form";
import { EditLeadSchema } from "@/lib/schemas/edit-lead";

type StudentRow = Database["public"]["Tables"]["students"]["Row"];
type GuardianRow = Database["public"]["Tables"]["guardians"]["Row"] & {
  students: StudentRow[];
};

type LeadWithGuardian = Database["public"]["Tables"]["leads"]["Row"] & {
  guardians: GuardianRow[];
};

interface LeadDetailDialogProps {
  lead: LeadWithGuardian;
  franchiseSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailDialog({ 
  lead, 
  franchiseSlug, 
  open, 
  onOpenChange 
}: LeadDetailDialogProps) {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<"call" | "email" | "text" | "review" | "other">("call");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifySms, setNotifySms] = useState(false);

  // Fetch Tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", lead.id],
    queryFn: () => getLeadTasks(lead.id),
    enabled: open,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => updateLeadStatus(lead.id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", franchiseSlug] });
      toast.success("Lead status updated");
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (params?: { title: string; type: any; date: string }) => {
      const title = params?.title || newTaskTitle;
      const type = params?.type || newTaskType;
      const date = params?.date || newTaskDate;

      if (!title) return;

      const result = await createTask({
        title,
        type,
        dueDate: date ? new Date(date) : undefined,
        leadId: lead.id,
        notifyEmail,
        notifySms,
      }, franchiseSlug);

      if (result.error) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks", franchiseSlug] }); // Refresh global list too
      setNewTaskTitle("");
      setNewTaskDate("");
      setNotifyEmail(false);
      setNotifySms(false);
      toast.success("Task added");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pending" | "completed" }) => 
      updateTaskStatus(id, status, franchiseSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks", franchiseSlug] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id, franchiseSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks", franchiseSlug] });
      toast.success("Task deleted");
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: () => deleteLead(lead.id, franchiseSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", franchiseSlug] });
      toast.success("Lead deleted");
      onOpenChange(false);
    },
  });

  const guardian = lead.guardians[0];
  const guardianName = guardian ? `${guardian.first_name} ${guardian.last_name}` : "Unknown";

  const getIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "text": return <MessageSquare className="h-4 w-4" />;
      case "review": return <User className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{guardianName}</DialogTitle>
              <DialogDescription>
                Lead Details & Actions
              </DialogDescription>
            </div>
            <div className="flex gap-2 mr-8">
              <Select 
                defaultValue={lead.status || "new"} 
                onValueChange={(val) => updateStatusMutation.mutate(val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Lead</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="tour_booked">Tour Booked</SelectItem>
                  <SelectItem value="tour_completed">Tour Completed</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this lead? (Debug)")) {
                    deleteLeadMutation.mutate();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="tasks" className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tasks">Tasks & Actions</TabsTrigger>
                <TabsTrigger value="info">Lead Info</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="tasks" className="flex-1 flex flex-col overflow-hidden mt-0 p-0">
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                {/* Quick Add Task */}
                <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add New Task
                  </h4>
                  <div className="flex gap-2">
                    <Select 
                      value={newTaskType} 
                      onValueChange={(v: any) => setNewTaskType(v)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="Task description..." 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="date" 
                      className="w-auto"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                    />
                    <div className="flex-1" />
                    <Button 
                      size="sm" 
                      onClick={() => createTaskMutation.mutate(undefined)}
                      disabled={!newTaskTitle || createTaskMutation.isPending}
                    >
                      Add Task
                    </Button>
                  </div>

                  {/* Notifications */}
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify_email" checked={notifyEmail} onCheckedChange={(c) => setNotifyEmail(!!c)} />
                      <Label htmlFor="notify_email" className="text-sm font-normal">Email Staff</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify_sms" checked={notifySms} onCheckedChange={(c) => setNotifySms(!!c)} />
                      <Label htmlFor="notify_sms" className="text-sm font-normal">Text Staff</Label>
                    </div>
                  </div>
                  
                  {/* Quick Presets */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        createTaskMutation.mutate({
                          title: "Call lead",
                          type: "call",
                          date: tomorrow.toISOString().split('T')[0]
                        });
                      }}
                    >
                      Call Tomorrow
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        createTaskMutation.mutate({
                          title: "Review lead status",
                          type: "review",
                          date: nextWeek.toISOString().split('T')[0]
                        });
                      }}
                    >
                      Review in 7 Days
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        createTaskMutation.mutate({
                          title: "Email Follow-up",
                          type: "email",
                          date: tomorrow.toISOString().split('T')[0]
                        });
                      }}
                    >
                      Email Follow-up
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => {
                        const twoDays = new Date();
                        twoDays.setDate(twoDays.getDate() + 2);
                        createTaskMutation.mutate({
                          title: "Text Check-in",
                          type: "text",
                          date: twoDays.toISOString().split('T')[0]
                        });
                      }}
                    >
                      Text Check-in
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        createTaskMutation.mutate({
                          title: "Post-Tour Follow-up",
                          type: "call",
                          date: tomorrow.toISOString().split('T')[0]
                        });
                      }}
                    >
                      Post-Tour Follow-up
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => {
                        const month = new Date();
                        month.setDate(month.getDate() + 30);
                        createTaskMutation.mutate({
                          title: "Monthly Check-in",
                          type: "call",
                          date: month.toISOString().split('T')[0]
                        });
                      }}
                    >
                      Monthly Check-in
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Task List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Upcoming Tasks</h4>
                  {tasks.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No tasks scheduled.</p>
                  )}
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => toggleTaskMutation.mutate({ 
                            id: task.id, 
                            status: task.status === "completed" ? "pending" : "completed" 
                          })}
                        >
                          {task.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        <div className={task.status === "completed" ? "opacity-50 line-through" : ""}>
                          <div className="flex items-center gap-2">
                            {getIcon(task.type)}
                            <span className="font-medium text-sm">{task.title}</span>
                          </div>
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(task.due_date), "MMM d, yyyy")}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="flex-1 overflow-y-auto p-6 mt-0">
              {guardian ? (
                <LeadEditForm
                  franchiseSlug={franchiseSlug}
                  leadId={lead.id}
                  guardianId={guardian.id}
                  studentId={guardian.students?.[0]?.id}
                  initialValues={{
                    guardianFirstName: guardian.first_name || "",
                    guardianLastName: guardian.last_name || "",
                    guardianEmail: guardian.email || "",
                    guardianPhone: guardian.phone || "",
                    studentFirstName: guardian.students?.[0]?.first_name || "",
                    studentProgram: (
                      (guardian.students?.[0]?.program_interest || "jr") as EditLeadSchema["studentProgram"]
                    ),
                    studentDob: guardian.students?.[0]?.dob
                      ? guardian.students?.[0]?.dob.split("T")[0]
                      : undefined,
                    source: lead.source || "",
                    notes: lead.notes || "",
                  }}
                  onSaved={() => {
                    queryClient.invalidateQueries({ queryKey: ["leads", franchiseSlug] });
                  }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No guardian information available.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
