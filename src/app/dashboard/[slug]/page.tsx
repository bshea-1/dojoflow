import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardRangePicker } from "@/components/dashboard/range-picker";
import { differenceInHours, differenceInMonths, isPast, subDays } from "date-fns";

export const dynamic = "force-dynamic";

const RANGE_LABELS = {
  "7d": "Last 7 Days",
  "31d": "Last 31 Days",
  lifetime: "Lifetime",
} as const;

type RangeKey = keyof typeof RANGE_LABELS;

export default async function DashboardOverview({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { range?: string };
}) {
  const supabase = createClient();

  const urlRange = searchParams?.range;
  const range: RangeKey =
    urlRange === "31d" || urlRange === "lifetime" ? urlRange : "7d";
  const rangeDays = range === "lifetime" ? null : range === "31d" ? 31 : 7;
  const sinceDate = rangeDays ? subDays(new Date(), rangeDays) : null;
  const sinceIso = sinceDate?.toISOString();

  // Get Current User & Profile
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id || "")
    .single();

  const role = profile?.role || "sensei";
  const showLtv = role === "franchisee";

  const { data: franchise } = await supabase
    .from("franchises")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!franchise) return <div>Franchise not found</div>;

  // Fetch Data for Stats
  let leadsQuery = supabase
    .from("leads")
    .select("id, status, created_at, updated_at")
    .eq("franchise_id", franchise.id);
  if (sinceIso) {
    leadsQuery = leadsQuery.gte("created_at", sinceIso);
  }

  let tasksQuery = supabase
    .from("tasks")
    .select("status, due_date, type, updated_at")
    .eq("franchise_id", franchise.id);
  if (sinceIso) {
    tasksQuery = tasksQuery.gte("updated_at", sinceIso);
  }

  let toursQuery = supabase
    .from("tours")
    .select("lead_id, status, scheduled_at, updated_at")
    .eq("franchise_id", franchise.id);
  if (sinceIso) {
    toursQuery = toursQuery.gte("scheduled_at", sinceIso);
  }

  const [leadsRes, tasksRes, toursRes] = await Promise.all([
    leadsQuery,
    tasksQuery,
    toursQuery,
  ]);

  const leads = leadsRes.data || [];
  const tasks = tasksRes.data || [];
  const tours = toursRes.data || [];

  // --- 1. Total Estimated Lifetime Value ---
  // Calculation: For every lead that is NOT Enrolled and NOT Lost,
  // Calculate months since created_at (minimum 1 month).
  // Sum (months * $249).
  let totalLifetimeValue = 0;
  const now = new Date();

  leads.forEach(lead => {
    if (lead.status !== "enrolled" && lead.status !== "lost") {
      const createdAt = new Date(lead.created_at);
      // Determine months in pipeline.
      // If created today, differenceInMonths is 0. We want at least 1 month value?
      // "goes up by $249 each month". If they just entered, maybe it's $249 immediately (current month).
      // Let's assume inclusive of current month.
      const monthsInPipeline = Math.max(1, differenceInMonths(now, createdAt) + 1);
      totalLifetimeValue += monthsInPipeline * 249;
    }
  });

  // --- 2. Quick Stats ---
  // A. Families Completing Tours Within 72 Hours
  const tourCompletedLeads = leads.filter((lead) => lead.status === "tour_completed");
  const fastToursWithin72 = tourCompletedLeads.filter((lead) => {
    if (!lead.created_at || !lead.updated_at) return false;
    const hoursBetween = differenceInHours(new Date(lead.updated_at), new Date(lead.created_at));
    return hoursBetween <= 72;
  });
  const fastToursPercent =
    tourCompletedLeads.length > 0
      ? Math.round((fastToursWithin72.length / tourCompletedLeads.length) * 100)
      : 0;

  // B. Tasks That Are Past Due
  const pendingTasks = tasks.filter(t => t.status === "pending");
  const overdueTasks = pendingTasks.filter(t => t.due_date && isPast(new Date(t.due_date)));
  const overdueTasksPercent = pendingTasks.length > 0
    ? Math.round((overdueTasks.length / pendingTasks.length) * 100)
    : 0;

  // C. New Families Getting To Wait List or Registered (Enrolled / Total)
  const enrolledCount = leads.filter(l => l.status === "enrolled").length;
  const totalLeads = leads.length;
  const waitlistPercent = totalLeads > 0
    ? Math.round((enrolledCount / totalLeads) * 100)
    : 0;

  // --- 3. Children by Status (Bar Chart) ---
  const statusCounts: Record<string, number> = {
    new: 0,
    contacted: 0,
    tour_booked: 0,
    tour_completed: 0,
    enrolled: 0,
    lost: 0
  };

  leads.forEach(lead => {
    const s = lead.status || "new";
    if (statusCounts[s] !== undefined) {
      statusCounts[s]++;
    }
  });

  const childrenByStatus = [
    { name: "Inquiries", value: statusCounts.new },
    { name: "Engaged", value: statusCounts.contacted },
    { name: "Tour Scheduled", value: statusCounts.tour_booked },
    { name: "Tour Completed", value: statusCounts.tour_completed },
    { name: "Enrolled", value: statusCounts.enrolled }
  ];

  // --- 4. Conversion Success (Gauges) ---
  // A. New Families Getting to Tour Scheduled (Tour Booked+ / Total)
  const leadsReachedTourBooked = leads.filter(l => ["tour_booked", "tour_completed", "enrolled"].includes(l.status || "")).length;
  const newToTourScheduledPercent = totalLeads > 0
    ? Math.round((leadsReachedTourBooked / totalLeads) * 100)
    : 0;

  // B. New Families Getting to Tour Completed (Tour Completed+ / Total)
  const leadsReachedTourCompleted = leads.filter(l => ["tour_completed", "enrolled"].includes(l.status || "")).length;
  const newToTourCompletedPercent = totalLeads > 0
    ? Math.round((leadsReachedTourCompleted / totalLeads) * 100)
    : 0;

  // C. Scheduled Tours Getting Completed (Tour Show Rate)
  const completedToursCount = tours.filter(t => t.status === "completed").length;
  const totalScheduledTours = tours.filter(t => ["scheduled", "completed", "no-show"].includes(t.status || "")).length;
  const scheduledToCompletedPercent = totalScheduledTours > 0
    ? Math.round((completedToursCount / totalScheduledTours) * 100)
    : 0;

  // D. Children Registered After Tour Completion (Enrolled / Tour Completed+)
  const registeredAfterTourPercent = leadsReachedTourCompleted > 0
    ? Math.round((enrolledCount / leadsReachedTourCompleted) * 100)
    : 0;


  // --- 5. Past Due Tasks (Bar Chart) ---
  // Helper for capitalization
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const pastDueByType: Record<string, number> = { Call: 0, Text: 0, Email: 0, Review: 0, Other: 0 };
  overdueTasks.forEach(t => {
    const type = t.type ? capitalize(t.type) : "Other";
    // Safety check if type is not in list
    if (pastDueByType[type] !== undefined) pastDueByType[type]++;
    else pastDueByType.Other++;
  });
  const pastDueChartData = Object.entries(pastDueByType).map(([name, value]) => ({ name, value }));

  // --- 6. Completed Tasks (Bar Chart) ---
  const completedTasksList = tasks.filter(t => t.status === "completed");
  const completedByType: Record<string, number> = { Call: 0, Text: 0, Email: 0, Review: 0, Other: 0 };
  completedTasksList.forEach(t => {
    const type = t.type ? capitalize(t.type) : "Other";
    if (completedByType[type] !== undefined) completedByType[type]++;
    else completedByType.Other++;
  });
  const completedChartData = Object.entries(completedByType).map(([name, value]) => ({ name, value }));


  const stats = {
    totalLifetimeValue,
    quickStats: {
      fastToursPercent,
      overdueTasksPercent,
      waitlistPercent,
      fastToursNote: undefined,
      overdueTasksNote: undefined,
      waitlistNote: undefined,
    },
    childrenByStatus,
    conversionStats: {
      newToTourScheduledPercent,
      newToTourCompletedPercent,
      scheduledToCompletedPercent,
      registeredAfterTourPercent,
    },
    pastDueChartData,
    completedChartData
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <DashboardRangePicker currentRange={range} />
      </div>
      <DashboardStats
        stats={stats}
        userName={franchise.name}
        showLtv={showLtv}
        rangeLabel={RANGE_LABELS[range]}
      />
    </div>
  );
}
