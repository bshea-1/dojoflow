"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, X } from "lucide-react";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { programLeadOptions } from "@/lib/schemas/book-tour";
import { createAutomation } from "@/app/dashboard/[slug]/automations/actions";

// Schema
const automationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  trigger: z.enum(["lead_created", "status_changed", "tour_booked", "tour_completed"]),
  conditions: z.object({
    lead_path: z.array(z.string()).optional(),
    status: z.string().optional(), // For 'status_changed', maybe 'to_status'
  }),
  actions: z.array(z.object({
    type: z.enum(["send_email", "send_sms", "create_task"]),
    template: z.string().optional(), // Mock template ID or name
    message: z.string().optional(), // Mock message body
    title: z.string().optional(), // For tasks
  })).min(1, "Add at least one action"),
});

type AutomationFormValues = z.infer<typeof automationSchema>;

interface AutomationBuilderProps {
  franchiseSlug: string;
  onSuccess?: () => void;
}

export function AutomationBuilder({ franchiseSlug, onSuccess }: AutomationBuilderProps) {
  const form = useForm<AutomationFormValues>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      name: "",
      trigger: "lead_created",
      conditions: {
        lead_path: [],
      },
      actions: [
        { type: "send_email", template: "welcome_email" } // Default action
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  async function onSubmit(data: AutomationFormValues) {
    try {
      const result = await createAutomation({
        name: data.name,
        trigger: data.trigger,
        conditions: data.conditions,
        actions: data.actions,
        active: true,
      }, franchiseSlug);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Automation created");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create automation");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Automation Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. New Lead Welcome Sequence" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="trigger"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trigger</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lead_created">Lead Created</SelectItem>
                    <SelectItem value="status_changed">Status Changed</SelectItem>
                    <SelectItem value="tour_booked">Tour Booked</SelectItem>
                    <SelectItem value="tour_completed">Tour Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  When should this run?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional Conditional Fields based on Trigger */}
          {form.watch("trigger") === "status_changed" && (
             <FormField
             control={form.control}
             name="conditions.status"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>New Status Is</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                   <FormControl>
                     <SelectTrigger>
                       <SelectValue placeholder="Any Status" />
                     </SelectTrigger>
                   </FormControl>
                   <SelectContent>
                     <SelectItem value="new">New Lead</SelectItem>
                     <SelectItem value="contacted">Contacted</SelectItem>
                     <SelectItem value="tour_booked">Tour Booked</SelectItem>
                     <SelectItem value="tour_completed">Tour Completed</SelectItem>
                     <SelectItem value="enrolled">Enrolled</SelectItem>
                     <SelectItem value="lost">Lost</SelectItem>
                   </SelectContent>
                 </Select>
                 <FormMessage />
               </FormItem>
             )}
           />
          )}
        </div>

        <div className="space-y-2 rounded-md border p-3 bg-slate-50">
          <h4 className="text-sm font-medium text-muted-foreground">Conditions (Optional)</h4>
          <FormField
            control={form.control}
            name="conditions.lead_path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Path includes...</FormLabel>
                <FormControl>
                  <MultiSelectDropdown 
                    options={programLeadOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Any path"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Actions</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ type: "send_email", template: "" })}
            >
              <Plus className="mr-2 h-3 w-3" /> Add Action
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start p-3 border rounded-md relative group bg-white">
              <FormField
                control={form.control}
                name={`actions.${index}.type`}
                render={({ field }) => (
                  <FormItem className="w-[140px]">
                    <FormLabel className="text-xs">Action Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="send_email">Send Email</SelectItem>
                        <SelectItem value="send_sms">Send SMS</SelectItem>
                        <SelectItem value="create_task">Create Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="flex-1">
                {form.watch(`actions.${index}.type`) === "create_task" ? (
                   <FormField
                   control={form.control}
                   name={`actions.${index}.title`}
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel className="text-xs">Task Title</FormLabel>
                       <FormControl>
                         <Input className="h-8" placeholder="Call lead..." {...field} />
                       </FormControl>
                     </FormItem>
                   )}
                 />
                ) : (
                  <FormField
                    control={form.control}
                    name={`actions.${index}.message`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Message / Template</FormLabel>
                        <FormControl>
                          <Input className="h-8" placeholder="Welcome to Code Ninjas!..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive absolute -top-2 -right-2 bg-white border shadow-sm rounded-full"
                  onClick={() => remove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit">Create Automation</Button>
        </div>
      </form>
    </Form>
  );
}
