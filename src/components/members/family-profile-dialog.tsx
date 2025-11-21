"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, Mail, MessageSquare, Phone, User, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getFamilyTasks, updateLeadNotes, type Member } from "@/app/dashboard/[slug]/members/actions";
import { Task } from "@/app/dashboard/[slug]/actions/actions";

interface FamilyProfileDialogProps {
    member: Member;
    franchiseSlug: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isReadOnly?: boolean;
}

export function FamilyProfileDialog({
    member,
    franchiseSlug,
    open,
    onOpenChange,
    isReadOnly = false
}: FamilyProfileDialogProps) {
    const [notes, setNotes] = useState(member.notes || "");
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    useEffect(() => {
        if (open && member.leadId) {
            setIsLoadingTasks(true);
            getFamilyTasks(member.leadId)
                .then((data) => setTasks(data as Task[]))
                .catch((err) => console.error(err))
                .finally(() => setIsLoadingTasks(false));
        }
    }, [open, member.leadId]);

    const handleSaveNotes = async () => {
        setIsSavingNotes(true);
        try {
            await updateLeadNotes(member.leadId, notes, franchiseSlug);
            toast.success("Notes updated successfully");
        } catch (error) {
            toast.error("Failed to update notes");
        } finally {
            setIsSavingNotes(false);
        }
    };

    const getTasksByStatus = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdue: Task[] = [];
        const dueToday: Task[] = [];
        const upcoming: Task[] = [];
        const completed: Task[] = [];

        tasks.forEach((task) => {
            if (task.status === "completed") {
                completed.push(task);
                return;
            }

            if (!task.due_date) {
                upcoming.push(task);
                return;
            }

            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);

            if (dueDate < today) {
                overdue.push(task);
            } else if (dueDate.getTime() === today.getTime()) {
                dueToday.push(task);
            } else {
                upcoming.push(task);
            }
        });

        return { overdue, dueToday, upcoming, completed };
    };

    const { overdue, dueToday, upcoming, completed } = getTasksByStatus();

    const renderTaskList = (taskList: Task[], emptyMsg: string) => {
        if (taskList.length === 0) {
            return <p className="text-sm text-muted-foreground italic p-4">{emptyMsg}</p>;
        }
        return (
            <div className="space-y-2">
                {taskList.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                        <div className="flex items-center gap-3">
                            <div className={task.status === "completed" ? "opacity-50" : ""}>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{task.title}</span>
                                </div>
                                {task.due_date && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <CalendarIcon className="h-3 w-3" />
                                        {format(new Date(task.due_date), "MMM d, yyyy")}
                                    </div>
                                )}
                                {task.outcome && (
                                    <div className="text-xs text-muted-foreground mt-1 italic">
                                        Outcome: {task.outcome}
                                    </div>
                                )}
                            </div>
                        </div>
                        {task.status === "completed" && (
                            <Badge variant="secondary" className="text-[10px]">Completed</Badge>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl">Family Profile</DialogTitle>
                    <DialogDescription>
                        View details, notes, and task history for this family.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    {/* Left Column: Details & Notes */}
                    <div className="md:col-span-1 space-y-6 overflow-y-auto pr-2">
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{member.guardianFirstName} {member.guardianLastName}</p>
                                    <p className="text-sm text-muted-foreground">Guardian</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">{member.studentName}</p>
                                    <p className="text-sm text-muted-foreground">Student</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a href={`mailto:${member.email}`} className="hover:underline">{member.email}</a>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a href={`tel:${member.phone}`} className="hover:underline">{member.phone}</a>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Notes */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Child Notes</label>
                                {!isReadOnly && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleSaveNotes}
                                        disabled={isSavingNotes || notes === member.notes}
                                        className="h-7 px-2"
                                    >
                                        <Save className="h-3 w-3 mr-1" />
                                        Save
                                    </Button>
                                )}
                            </div>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes about the child..."
                                className="min-h-[150px] resize-none"
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>

                    {/* Right Column: Tasks */}
                    <div className="md:col-span-2 flex flex-col h-full overflow-hidden border-l pl-6">
                        <h3 className="font-medium mb-4">Family Tasks</h3>

                        <Tabs defaultValue="upcoming" className="flex-1 flex flex-col">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overdue">
                                    Overdue
                                    {overdue.length > 0 && (
                                        <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                            {overdue.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="today">
                                    Today
                                    {dueToday.length > 0 && (
                                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                            {dueToday.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                                <TabsTrigger value="completed">History</TabsTrigger>
                            </TabsList>

                            <div className="flex-1 mt-4 overflow-hidden relative">
                                {isLoadingTasks ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[400px] pr-4">
                                        <TabsContent value="overdue" className="mt-0">
                                            {renderTaskList(overdue, "No overdue tasks.")}
                                        </TabsContent>
                                        <TabsContent value="today" className="mt-0">
                                            {renderTaskList(dueToday, "No tasks due today.")}
                                        </TabsContent>
                                        <TabsContent value="upcoming" className="mt-0">
                                            {renderTaskList(upcoming, "No upcoming tasks.")}
                                        </TabsContent>
                                        <TabsContent value="completed" className="mt-0">
                                            {renderTaskList(completed, "No completed tasks yet.")}
                                        </TabsContent>
                                    </ScrollArea>
                                )}
                            </div>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
