"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { TourWithGuardian } from "@/types/tours";
import {
  updateTour,
  deleteTour,
} from "@/app/dashboard/[slug]/tours/actions";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "no-show", label: "No Show" },
] as const;

interface TourDetailDialogProps {
  tour: TourWithGuardian | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  franchiseSlug: string;
  readOnly?: boolean;
}

export function TourDetailDialog({
  tour,
  open,
  onOpenChange,
  franchiseSlug,
  readOnly = false,
}: TourDetailDialogProps) {
  const router = useRouter();
  const [scheduledInput, setScheduledInput] = useState("");
  const [status, setStatus] =
    useState<TourWithGuardian["status"]>("scheduled");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (tour) {
      setScheduledInput(
        tour.scheduled_at
          ? new Date(tour.scheduled_at)
              .toISOString()
              .slice(0, 16)
          : ""
      );
      setStatus(tour.status ?? "scheduled");
    }
  }, [tour, open]);

  const parentName =
    tour?.leads?.guardians?.[0]
      ? `${tour.leads.guardians[0].first_name ?? ""} ${
          tour.leads.guardians[0].last_name ?? ""
        }`.trim()
      : "Unknown Parent";

  async function handleSave() {
    if (!tour) return;
    if (!scheduledInput) {
      toast.error("Select a date and time");
      return;
    }

    setIsSaving(true);
    try {
      const isoDate = new Date(scheduledInput).toISOString();
      const originalDate = tour.scheduled_at 
        ? new Date(tour.scheduled_at).toISOString() 
        : null;
      
      // Only include scheduledAt if it actually changed
      const updateData: { scheduledAt?: string; status?: TourWithGuardian["status"] } = {
        status: status ?? "scheduled",
      };
      
      // Only send scheduledAt if the date/time actually changed
      if (isoDate !== originalDate) {
        updateData.scheduledAt = isoDate;
      }
      
      const result = await updateTour(
        tour.id,
        updateData,
        franchiseSlug
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Tour updated");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update tour");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!tour) return;
    const confirmed = window.confirm(
      "Remove this tour from the calendar? This cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await deleteTour(tour.id, franchiseSlug);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Tour removed");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove tour");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Tour</DialogTitle>
          <DialogDescription>
            Update scheduling details or remove a booked tour.
          </DialogDescription>
        </DialogHeader>

        {tour ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Lead
              </p>
              <p className="text-base font-semibold">{parentName}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date &amp; Time</label>
              <Input
                type="datetime-local"
                value={scheduledInput}
                onChange={(event) => setScheduledInput(event.target.value)}
                disabled={readOnly}
                className={readOnly ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={status ?? "scheduled"}
                onValueChange={(value) =>
                  setStatus(value as TourWithGuardian["status"])
                }
                disabled={readOnly}
              >
                <SelectTrigger className={readOnly ? "bg-muted cursor-not-allowed" : ""}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No tour selected.
          </p>
        )}

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto"
            disabled={isDeleting || !tour || readOnly}
            onClick={handleDelete}
          >
            {isDeleting ? "Removing..." : "Remove Tour"}
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={isSaving || !tour || readOnly}
            onClick={handleSave}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

