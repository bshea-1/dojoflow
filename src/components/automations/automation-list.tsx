"use client";

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
import { Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { toggleAutomation, deleteAutomation, Automation } from "@/app/dashboard/[slug]/automations/actions";

interface AutomationListProps {
  automations: Automation[];
  franchiseSlug: string;
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
      {automations.map((automation) => (
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
                onCheckedChange={() => handleToggle(automation.id, automation.active || false)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div className="font-medium text-foreground mb-1 text-xs uppercase tracking-wider">Conditions</div>
                {Object.keys(automation.conditions as any).length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(automation.conditions as any).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs font-normal">
                        {key.replace("_", " ")}: {Array.isArray(value) ? value.join(", ") : String(value)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic">No extra conditions</span>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <div className="font-medium text-foreground mb-1 text-xs uppercase tracking-wider">Actions</div>
                <ul className="list-disc list-inside space-y-1">
                  {(automation.actions as any[]).map((action, idx) => (
                    <li key={idx} className="text-xs">
                      <span className="font-medium capitalize">{action.type.replace("_", " ")}</span>
                      {action.template && <span className="opacity-75"> ({action.template})</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-2">
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
      ))}
    </div>
  );
}
