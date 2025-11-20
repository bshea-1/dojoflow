"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  toggleAutomation,
  deleteAutomation,
  Automation,
} from "@/app/dashboard/[slug]/automations/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AutomationBuilder } from "./automation-builder";

interface AutomationListProps {
  automations: Automation[];
  franchiseSlug: string;
}

function AutomationEditDialog({
  automation,
  franchiseSlug,
}: {
  automation: Automation;
  franchiseSlug: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Automation</DialogTitle>
          <DialogDescription>
            Update the trigger, conditions, or actions for this automation.
          </DialogDescription>
        </DialogHeader>
        <AutomationBuilder
          franchiseSlug={franchiseSlug}
          automation={automation}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function AutomationList({ automations, franchiseSlug }: AutomationListProps) {
  
  const handleToggle = async (id: string, currentActive: boolean) => {
    const result = await toggleAutomation(id, !currentActive, franchiseSlug);
    if (result.error) {
      toast.error("Failed to update automation");
    } else {
      toast.success(currentActive ? "Automation paused" : "Automation activated");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    const result = await deleteAutomation(id, franchiseSlug);
    if (result.error) {
      toast.error("Failed to delete automation");
    } else {
      toast.success("Automation deleted");
    }
  };

  if (automations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center border rounded-lg bg-muted/10">
        <Zap className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Automations Yet</h3>
        <p className="text-muted-foreground max-w-sm mt-2">
          Get started by creating your first automation to streamline your workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {automations.map((automation) => {
        const normalizedConditions =
          (automation.conditions as Record<string, any>) || {};
        const conditionEntries = Object.entries(normalizedConditions).filter(
          ([, value]) => {
            if (Array.isArray(value)) {
              return value.length > 0;
            }
            return value !== null && value !== "" && value !== undefined;
          }
        );
        const normalizedActions = Array.isArray(automation.actions)
          ? (automation.actions as any[])
          : [];

        return (
          <Card key={automation.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-base">{automation.name}</CardTitle>
                  <CardDescription className="text-xs capitalize">
                    Trigger: {automation.trigger.replace("_", " ")}
                  </CardDescription>
                </div>
                <Switch
                  checked={automation.active || false}
                  onCheckedChange={() =>
                    handleToggle(automation.id, automation.active || false)
                  }
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium text-foreground mb-1 text-xs uppercase tracking-wider">
                    Conditions
                  </div>
                  {conditionEntries.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {conditionEntries.map(([key, value]) => (
                        <Badge
                          key={key}
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {key.replace("_", " ")}:{" "}
                          {Array.isArray(value)
                            ? value.join(", ")
                            : String(value)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs italic">No extra conditions</span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <div className="font-medium text-foreground mb-1 text-xs uppercase tracking-wider">
                    Actions
                  </div>
                  {normalizedActions.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {normalizedActions.map((action, idx) => {
                        const detail =
                          action.type === "create_task"
                            ? action.title || "Automation task"
                            : action.message ||
                              action.template ||
                              "No content specified";
                        return (
                          <li key={idx} className="text-xs">
                            <span className="font-medium capitalize">
                              {action.type.replace("_", " ")}
                            </span>
                            <span className="opacity-75"> — {detail}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="text-xs italic">No actions configured</span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <AutomationEditDialog
                    automation={automation}
                    franchiseSlug={franchiseSlug}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(automation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
