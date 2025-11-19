"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editLeadSchema, EditLeadSchema, programOptions } from "@/lib/schemas/edit-lead";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLeadDetails } from "@/app/dashboard/[slug]/pipeline/actions";
import { toast } from "sonner";

export interface LeadEditFormValues {
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail: string;
  guardianPhone: string;
  studentFirstName: string;
  studentProgram: string;
  studentDob?: string;
  source?: string;
  notes?: string;
}

interface LeadEditFormProps {
  franchiseSlug: string;
  leadId: string;
  guardianId: string;
  studentId?: string;
  initialValues: LeadEditFormValues;
  onSaved?: (values: EditLeadSchema) => void;
}

export function LeadEditForm({
  franchiseSlug,
  leadId,
  guardianId,
  studentId,
  initialValues,
  onSaved,
}: LeadEditFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<EditLeadSchema>({
    resolver: zodResolver(editLeadSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [initialValues, form]);

  const mutation = useMutation({
    mutationFn: async (values: EditLeadSchema) => {
      return await updateLeadDetails(
        {
          leadId,
          guardianId,
          studentId,
          guardian: {
            firstName: values.guardianFirstName,
            lastName: values.guardianLastName,
            email: values.guardianEmail,
            phone: values.guardianPhone,
          },
          student: {
            firstName: values.studentFirstName,
            programInterest: values.studentProgram,
            dob: values.studentDob,
          },
          lead: {
            source: values.source,
            notes: values.notes,
          },
        },
        franchiseSlug
      );
    },
    onSuccess: (result, variables) => {
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Lead details updated");
      queryClient.invalidateQueries({ queryKey: ["leads", franchiseSlug] });
      queryClient.invalidateQueries({ queryKey: ["members", franchiseSlug] });
      onSaved?.(variables);
    },
    onError: () => {
      toast.error("Failed to update lead");
    },
  });

  const onSubmit = (values: EditLeadSchema) => {
    mutation.mutate(values);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground">Guardian Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <Label htmlFor="guardianFirstName">First Name</Label>
            <Input id="guardianFirstName" {...form.register("guardianFirstName")} />
            {form.formState.errors.guardianFirstName && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.guardianFirstName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="guardianLastName">Last Name</Label>
            <Input id="guardianLastName" {...form.register("guardianLastName")} />
            {form.formState.errors.guardianLastName && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.guardianLastName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="guardianEmail">Email</Label>
            <Input id="guardianEmail" type="email" {...form.register("guardianEmail")} />
            {form.formState.errors.guardianEmail && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.guardianEmail.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="guardianPhone">Phone</Label>
            <Input id="guardianPhone" {...form.register("guardianPhone")} />
            {form.formState.errors.guardianPhone && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.guardianPhone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-muted-foreground">Student Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <Label htmlFor="studentFirstName">Student Name</Label>
            <Input id="studentFirstName" {...form.register("studentFirstName")} />
            {form.formState.errors.studentFirstName && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.studentFirstName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="studentProgram">Program Interest</Label>
            <Select
              onValueChange={(val) => form.setValue("studentProgram", val)}
              value={form.watch("studentProgram")}
            >
              <SelectTrigger id="studentProgram">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {programOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.studentProgram && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.studentProgram.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="studentDob">Date of Birth</Label>
            <Input id="studentDob" type="date" {...form.register("studentDob")} />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-muted-foreground">Lead Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <Label htmlFor="source">Source</Label>
            <Input id="source" placeholder="Facebook, Walk-in..." {...form.register("source")} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}

