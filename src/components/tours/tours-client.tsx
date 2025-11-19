'use client';

import { useState } from "react";
import { CalendarView } from "@/components/tours/calendar-view";
import { BookTourDialog } from "@/components/tours/book-tour-dialog";
import { Button } from "@/components/ui/button";

interface LeadOption {
  id: string;
  label: string;
}

interface ToursClientProps {
  franchiseSlug: string;
  leads: LeadOption[];
  tours: any[];
}

export function ToursClient({ franchiseSlug, leads, tours }: ToursClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const openDialog = (slot?: Date | null) => {
    if (slot) {
      setSelectedSlot(slot);
    } else {
      setSelectedSlot(null);
    }
    setDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tour Schedule</h1>
        <Button onClick={() => openDialog()} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Book Tour
        </Button>
      </div>

      <BookTourDialog
        franchiseSlug={franchiseSlug}
        leads={leads}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedSlot(null);
          }
        }}
        initialSlot={selectedSlot ?? undefined}
      />

      <div className="flex-1 h-[600px]">
        <CalendarView tours={tours || []} onSlotSelect={(date) => openDialog(date)} />
      </div>
    </div>
  );
}

