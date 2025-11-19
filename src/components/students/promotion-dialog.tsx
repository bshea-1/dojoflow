"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award } from "lucide-react";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { promoteStudentSchema, PromoteStudentSchema, BELT_RANKS } from "@/lib/schemas/student";
import { promoteStudent } from "@/app/dashboard/[slug]/students/actions";

interface PromotionDialogProps {
  studentId: string;
  currentBelt: string;
  franchiseSlug: string;
}

export function PromotionDialog({ studentId, currentBelt, franchiseSlug }: PromotionDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Determine next belt index
  const currentBeltIndex = BELT_RANKS.findIndex(b => b === currentBelt);
  const nextBelt = currentBeltIndex !== -1 && currentBeltIndex < BELT_RANKS.length - 1
    ? BELT_RANKS[currentBeltIndex + 1]
    : BELT_RANKS[0];

  const form = useForm<PromoteStudentSchema>({
    resolver: zodResolver(promoteStudentSchema),
    defaultValues: {
      studentId,
      newBelt: nextBelt as any,
      promotedAt: new Date(),
    },
  });

  async function onSubmit(data: PromoteStudentSchema) {
    try {
      const result = await promoteStudent(data, franchiseSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Student promoted to ${data.newBelt} Belt!`);
      setOpen(false);
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Award className="mr-2 h-4 w-4" /> Promote Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Promote Student</DialogTitle>
          <DialogDescription>
            Record a belt promotion for this student.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newBelt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Belt Rank</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select belt rank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BELT_RANKS.map((belt) => (
                        <SelectItem key={belt} value={belt}>
                          {belt} Belt
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="promotedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? format(field.value, "yyyy-MM-dd")
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

            <DialogFooter>
              <Button type="submit">Confirm Promotion</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

