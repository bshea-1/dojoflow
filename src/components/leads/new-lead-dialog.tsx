"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { newLeadSchema, NewLeadSchema } from "@/lib/schemas/new-lead";
import { createLead } from "@/app/dashboard/[slug]/pipeline/actions";

interface NewLeadDialogProps {
  franchiseSlug: string;
}

export function NewLeadDialog({ franchiseSlug }: NewLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<NewLeadSchema>({
    resolver: zodResolver(newLeadSchema),
    defaultValues: {
      guardian: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      },
      student: {
        firstName: "",
        programInterest: "jr", // default
        // dob is managed by date input
      },
      source: "",
      notes: "",
    },
  });

  async function onSubmit(data: NewLeadSchema) {
    try {
      const result = await createLead(data, franchiseSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Lead created successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Enter the guardian and student details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Guardian Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Guardian Information</h3>
                <Separator className="flex-1" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guardian.firstName"
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
                  name="guardian.lastName"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guardian.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="jane@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guardian.phone"
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
            </div>

            {/* Student Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Student Information</h3>
                <Separator className="flex-1" />
              </div>

              <FormField
                control={form.control}
                name="student.firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Ninja Sam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="student.dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.valueAsDate)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="student.programInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Interest</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a program" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="jr">JR</SelectItem>
                          <SelectItem value="create">Create</SelectItem>
                          <SelectItem value="camp">Camps</SelectItem>
                          <SelectItem value="ai">AI</SelectItem>
                          <SelectItem value="robotics">Robotics</SelectItem>
                          <SelectItem value="clubs">Clubs</SelectItem>
                          <SelectItem value="birthday_party">Birthday Party</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Additional Details</h3>
                <Separator className="flex-1" />
              </div>

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Walk-in, Facebook, etc." {...field} />
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
                      <Input placeholder="Any specific needs..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Create Lead</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
