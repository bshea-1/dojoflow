"use client";

import { useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  isSameDay,
  addWeeks,
  subWeeks
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TourWithGuardian } from "@/types/tours";
import { DndContext, DragEndEvent, useDraggable, useDroppable, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { updateTour } from "@/app/dashboard/[slug]/tours/actions";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Mock data for visualization if real data is empty
const MOCK_HOURS = { start: 10, end: 19 }; // 10 AM to 7 PM

interface CalendarViewProps {
  tours?: TourWithGuardian[];
  onSlotSelect?: (date: Date) => void;
  onTourClick?: (tour: TourWithGuardian) => void;
}

function DraggableTourCard({ tour, onClick }: { tour: TourWithGuardian; onClick?: (tour: TourWithGuardian) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tour.id,
    data: { tour },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100,
  } : undefined;

  const guardian = tour.leads?.guardians?.[0];
  const parentName = guardian
    ? `${guardian.first_name ?? ""} ${guardian.last_name ?? ""}`.trim()
    : "Unknown Parent";

  const leadPaths =
    guardian?.students?.flatMap(
      (student) => student.program_interest || []
    ) ?? [];

  const hasJuniorPath = leadPaths.includes("jr");
  const pathLabel = hasJuniorPath ? "JRs" : "Gamebuilding Session";

  const cardClasses = cn(
    "border rounded p-2 text-[10px] truncate cursor-grab active:cursor-grabbing shadow-sm",
    hasJuniorPath
      ? "bg-purple-100 text-purple-700 border-purple-400"
      : "bg-primary/10 text-primary border-primary",
    isDragging && "opacity-50"
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cardClasses}
      title={`${parentName} • ${pathLabel}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(tour);
      }}
    >
      <div className="font-semibold truncate">{parentName}</div>
      <div className="text-muted-foreground truncate">{pathLabel}</div>
    </div>
  );
}

function DroppableTimeSlot({
  date,
  hour,
  children,
  onSlotSelect,
  hasTours
}: {
  date: Date;
  hour: number;
  children: React.ReactNode;
  onSlotSelect?: (date: Date) => void;
  hasTours: boolean;
}) {
  const slotId = `${date.toISOString()}-${hour}`;
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
    data: { date, hour },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-1 border-b border-r min-h-[5rem] relative transition-colors",
        isOver ? "bg-blue-100" : "hover:bg-slate-50",
        !hasTours && "cursor-pointer"
      )}
      onClick={() => !hasTours && onSlotSelect?.(date)}
    >
      {children}
    </div>
  );
}

export function CalendarView({
  tours = [],
  onSlotSelect,
  onTourClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const params = useParams();
  const franchiseSlug = params.slug as string;

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Generate time slots
  const timeSlots = [];
  for (let i = MOCK_HOURS.start; i < MOCK_HOURS.end; i++) {
    timeSlots.push(i);
  }

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Enable click by requiring drag distance
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const tourId = active.id as string;
      const { date } = over.data.current as { date: Date; hour: number };

      // Use the date directly from the droppable slot (already has correct hour set)
      toast.promise(
        updateTour(tourId, { scheduledAt: date.toISOString() }, franchiseSlug),
        {
          loading: "Rescheduling tour...",
          success: "Tour rescheduled successfully",
          error: "Failed to reschedule tour",
        }
      );
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 border rounded-lg overflow-auto bg-white">
          <div className="grid grid-cols-8 min-w-[800px]">
            {/* Header Row */}
            <div className="p-4 border-b border-r bg-slate-50 text-center font-semibold text-muted-foreground">
              Time
            </div>
            {days.map((day) => (
              <div
                key={day.toString()}
                className={cn(
                  "p-4 border-b border-r bg-slate-50 text-center font-semibold",
                  isSameDay(day, new Date()) && "bg-blue-50 text-primary"
                )}
              >
                {format(day, "EEE d")}
              </div>
            ))}

            {/* Time Slots */}
            {timeSlots.map((hour) => (
              <div className="contents" key={`time-row-${hour}`}>
                <div className="p-4 border-b border-r text-xs text-muted-foreground text-center h-20">
                  {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                </div>
                {days.map((day) => {
                  const slotTours = tours.filter(t => {
                    const tDate = new Date(t.scheduled_at);
                    return isSameDay(tDate, day) && tDate.getHours() === hour;
                  });

                  const slotDate = new Date(day);
                  slotDate.setHours(hour, 0, 0, 0);

                  return (
                    <DroppableTimeSlot
                      key={`slot-${day.toISOString()}-${hour}`}
                      date={slotDate}
                      hour={hour}
                      onSlotSelect={onSlotSelect}
                      hasTours={slotTours.length > 0}
                    >
                      {slotTours.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {slotTours.map((tour) => (
                            <DraggableTourCard
                              key={tour.id}
                              tour={tour}
                              onClick={onTourClick}
                            />
                          ))}
                        </div>
                      )}
                    </DroppableTimeSlot>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}

