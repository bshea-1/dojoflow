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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";

type Tour = Database["public"]["Tables"]["tours"]["Row"] & {
  leads: {
    guardians: {
      first_name: string;
      last_name: string;
    }[];
  } | null; // Joined data structure might vary slightly
};

// Mock data for visualization if real data is empty
const MOCK_HOURS = { start: 10, end: 19 }; // 10 AM to 7 PM

interface CalendarViewProps {
  tours?: any[];
  onSlotSelect?: (date: Date) => void;
}

export function CalendarView({ tours = [], onSlotSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  return (
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
                  <div
                    key={`slot-${day.toISOString()}-${hour}`}
                    className="p-1 border-b border-r h-20 relative hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => slotTours.length === 0 && onSlotSelect?.(slotDate)}
                  >
                    {slotTours.map(tour => (
                      <div key={tour.id} className="bg-primary/10 text-primary border-l-2 border-primary text-[10px] p-1 rounded mb-1 truncate">
                        Tour Booked
                      </div>
                    ))}
                    {slotTours.length === 0 && onSlotSelect && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                        {/* Tap to schedule removed */}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

