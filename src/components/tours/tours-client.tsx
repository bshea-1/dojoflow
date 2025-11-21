'use client';

import { useState, useEffect } from "react";
import { CalendarView } from "@/components/tours/calendar-view";
import { BookTourDialog } from "@/components/tours/book-tour-dialog";
import { TourDetailDialog } from "@/components/tours/tour-detail-dialog";
import { Button } from "@/components/ui/button";
import { TourWithGuardian } from "@/types/tours";

interface LeadOption {
  id: string;
  label: string;
}

interface ToursClientProps {
  franchiseSlug: string;
  leads: LeadOption[];
  tours: TourWithGuardian[];
  userRole?: string;
}

export function ToursClient({ franchiseSlug, leads, tours, userRole }: ToursClientProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedTour, setSelectedTour] = useState<TourWithGuardian | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [roleView, setRoleView] = useState<string>("");

  // Load role view from localStorage
  useEffect(() => {
    const updateRoleView = () => {
      const savedRoleView = localStorage.getItem("roleView");
      setRoleView(savedRoleView || userRole || "sensei");
    };
    
    updateRoleView();
    
    // Listen for role view changes
    window.addEventListener("roleViewChange", updateRoleView);
    window.addEventListener("storage", updateRoleView);
    
    return () => {
      window.removeEventListener("roleViewChange", updateRoleView);
      window.removeEventListener("storage", updateRoleView);
    };
  }, [userRole]);

  // Check if current view is sensei (read-only mode)
  const isSenseiView = roleView === "sensei";

  const openDialog = (slot?: Date | null) => {
    // Prevent opening dialog if in sensei view
    if (isSenseiView) return;

    if (slot) {
      setSelectedSlot(slot);
    } else {
      setSelectedSlot(null);
    }
    setBookingOpen(true);
  };

  const handleTourClick = (tour: TourWithGuardian) => {
    setSelectedTour(tour);
    setDetailOpen(true);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tour Schedule</h1>
        {!isSenseiView && (
          <Button onClick={() => openDialog()} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Book Tour
          </Button>
        )}
      </div>

      <BookTourDialog
        franchiseSlug={franchiseSlug}
        leads={leads}
        open={bookingOpen}
        onOpenChange={(open) => {
          setBookingOpen(open);
          if (!open) {
            setSelectedSlot(null);
          }
        }}
        initialSlot={selectedSlot ?? undefined}
      />

      <TourDetailDialog
        tour={selectedTour}
        open={detailOpen}
        franchiseSlug={franchiseSlug}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setSelectedTour(null);
          }
        }}
        readOnly={isSenseiView}
      />

      <div className="flex-1 h-[600px]">
        <CalendarView
          tours={tours || []}
          onSlotSelect={isSenseiView ? undefined : (date) => openDialog(date)}
          onTourClick={handleTourClick}
          readOnly={isSenseiView}
        />
      </div>
    </div>
  );
}

