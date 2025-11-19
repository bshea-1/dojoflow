"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isPast, isFuture, startOfDay } from "date-fns";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Mail, 
  MessageSquare, 
  Phone, 
  Plus, 
  Trash2,
  User,
  Calendar as CalendarIcon
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Database } from "@/types/supabase";
import { getTasks, createTask, updateTaskStatus, deleteTask } from "@/app/dashboard/[slug]/actions/actions";

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  leads?: {
    id: string;
    guardians: {
      first_name: string;
      last_name: string;
    }[];
  } | null;
};

interface ActionListProps {
  franchiseSlug: string;
  initialTasks: Task[];
}

export function ActionList({ franchiseSlug, initialTasks }: ActionListProps) {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<"call" | "email" | "text" | "review" | "other">("call");
  const [newTaskDate, setNewTaskDate] = useState("");

  const { data: tasks = initialTasks } = useQuery({
    queryKey: ["tasks", franchiseSlug],
    queryFn: () => getTasks(franchiseSlug),
    initialData: initialTasks,
  });

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      if (!newTaskTitle) return;
      await createTask({
        title: newTaskTitle,
        type: newTaskType,
        dueDate: newTaskDate ? new Date(newTaskDate) : undefined,
      }, franchiseSlug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", franchiseSlug] });
      setNewTaskTitle("");
      setNewTaskDate("");
      toast.success("Task added");
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pending" | "completed" }) => 
      updateTaskStatus(id, status, franchiseSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", franchiseSlug] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id, franchiseSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", franchiseSlug] });
      toast.success("Task deleted");
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "call": return <Phone className="h-4 w-4" />;
      case "email": return <Mail className="h-4 w-4" />;
      case "text": return <MessageSquare className="h-4 w-4" />;
      case "review": return <User className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  // Group Tasks
  const overdueTasks = tasks.filter(t => 
    t.status === "pending" && 
    t.due_date && 
    isPast(startOfDay(new Date(t.due_date))) && 
    !isToday(new Date(t.due_date))
  );

  const todayTasks = tasks.filter(t => 
    t.status === "pending" && 
    (!t.due_date || isToday(new Date(t.due_date)))
  );

  const futureTasks = tasks.filter(t => 
    t.status === "pending" && 
    t.due_date && 
    isFuture(startOfDay(new Date(t.due_date))) && 
    !isToday(new Date(t.due_date))
  );

  const completedTasks = tasks.filter(t => t.status === "completed");

  const renderTaskList = (taskList: Task[], emptyMsg: string) => {
    if (taskList.length === 0) {
      return <p className="text-sm text-muted-foreground italic p-4">{emptyMsg}</p>;
    }
    return (
      <div className="space-y-2">
        {taskList.map((task) => (
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
                  {task.leads && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {task.leads.guardians[0]?.first_name} {task.leads.guardians[0]?.last_name}
                    </Badge>
                  )}
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <CalendarIcon className="h-3 w-3" />
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
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Add */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Quick Add Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select 
              value={newTaskType} 
              onValueChange={(v: any) => setNewTaskType(v)}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
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
              placeholder="What needs to be done?" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1"
            />
            <Input 
              type="date" 
              className="w-full sm:w-auto"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
            />
            <Button 
              onClick={() => createTaskMutation.mutate()}
              disabled={!newTaskTitle || createTaskMutation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overdue" className="relative">
            Overdue
            {overdueTasks.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {overdueTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-destructive">Overdue Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTaskList(overdueTasks, "No overdue tasks! Great job.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTaskList(todayTasks, "Nothing scheduled for today.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTaskList(futureTasks, "No upcoming tasks scheduled.")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTaskList(completedTasks, "No completed tasks yet.")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

