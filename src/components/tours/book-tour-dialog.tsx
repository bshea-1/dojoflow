'use client';

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  bookTourSchema,
  BookTourSchema,
  programLeadOptions,
  ProgramInterestValue,
} from "@/lib/schemas/book-tour";
import { bookTour } from "@/app/dashboard/[slug]/tours/actions";

interface LeadOption {
  id: string;
  label: string;
}

interface BookTourDialogProps {
  franchiseSlug: string;
  leads: LeadOption[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialSlot?: Date;
}

const buildDefaultValues = () => ({
  leadId: undefined as string | undefined,
  scheduledAt: undefined as Date | undefined,
  notes: "",
  newLead: {
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhone: "",
    children: [{ name: "", age: 7 }],
    programs: [] as ProgramInterestValue[],
  },
});

export function BookTourDialog({
  franchiseSlug,
  leads,
  open,
  onOpenChange,
  initialSlot,
}: BookTourDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean" && !!onOpenChange;
  const dialogOpen = isControlled ? Boolean(open) : internalOpen;

  const form = useForm<BookTourSchema>({
    resolver: zodResolver(bookTourSchema),
    defaultValues: buildDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "newLead.children",
  });

  const leadId = form.watch("leadId");
  const showNewLeadForm = !leadId;

  useEffect(() => {
    if (initialSlot) {
      form.setValue("scheduledAt", initialSlot);
    }
  }, [initialSlot, form]);

  useEffect(() => {
    if (!dialogOpen) {
      form.reset(buildDefaultValues());
    }
  }, [dialogOpen, form]);

  async function onSubmit(data: BookTourSchema) {
    try {
      const result = await bookTour(data, franchiseSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Tour booked successfully");
      handleOpenChange(false);
      form.reset(buildDefaultValues());
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }

    if (!next) {
      form.reset(buildDefaultValues());
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Book a Tour</DialogTitle>
          <DialogDescription>
            Schedule a tour for a prospective ninja.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="leadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Existing Lead (optional)</FormLabel>
                  <div className="flex items-center gap-2">
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a lead" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leads.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Clear lead"
                        onClick={() => field.onChange(undefined)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showNewLeadForm && (
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="text-sm font-semibold">Parent Details</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="newLead.parentFirstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newLead.parentLastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newLead.parentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jane@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newLead.parentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Children</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ name: "", age: 7 })}
                    >
                      <Plus className="mr-2 h-3 w-3" /> Add Child
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {fields.map((fieldItem, index) => (
                      <div key={fieldItem.id} className="rounded-md border p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">Child {index + 1}</span>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`newLead.children.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ninja Sam" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`newLead.children.${index}.age`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="newLead.programs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Interests</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {programLeadOptions.map((program) => (
                          <label
                            key={program.value}
                            className="flex items-center gap-2 rounded-md border p-2 text-sm"
                          >
                            <Checkbox
                              checked={field.value?.includes(program.value) ?? false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...(field.value ?? []), program.value]);
                                } else {
                                  field.onChange(
                                    (field.value ?? []).filter((p) => p !== program.value)
                                  );
                                }
                              }}
                            />
                            {program.label}
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={
                        field.value
                          ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                          : ""
                      }
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        field.onChange(date);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Special requests..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Confirm Booking</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
