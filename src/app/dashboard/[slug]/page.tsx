import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { isPast } from "date-fns";

export default async function DashboardOverview({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: franchise } = await supabase
    .from("franchises")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!franchise) return <div>Franchise not found</div>;

  // Fetch Data for Stats
  const [leadsRes, tasksRes, toursRes] = await Promise.all([
    supabase.from("leads").select("status, created_at"),
    supabase.from("tasks").select("status, due_date, type"),
    supabase.from("tours").select("status, scheduled_at, updated_at"),
  ]);

  const leads = leadsRes.data || [];
  const tasks = tasksRes.data || [];
  const tours = toursRes.data || [];

  // --- 1. Total Estimated Lifetime Value ---
  // Assumption: Each enrolled student is worth ~$3000 LTV
  const enrolledCount = leads.filter(l => l.status === "enrolled").length;
  const totalLifetimeValue = enrolledCount * 3000;

  // --- 2. Quick Stats ---
  // A. Families Completing Tours Within 24 Hours (Placeholder)
  const fastToursPercent = 0;

  // B. Tasks That Are Past Due
  const pendingTasks = tasks.filter(t => t.status === "pending");
  const overdueTasks = pendingTasks.filter(t => t.due_date && isPast(new Date(t.due_date)));
  const overdueTasksPercent = pendingTasks.length > 0
    ? Math.round((overdueTasks.length / pendingTasks.length) * 100)
    : 0;

  // C. New Families Getting To Wait List or Registered (Enrolled / Total)
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
    { name: "Registered", value: statusCounts.enrolled }, // Using "Registered" as label
    { name: "Enrolled", value: statusCounts.enrolled } // Wait, maybe Enrolled is different? Using Enrolled twice or mapping differently?
    // Let's map "enrolled" to "Enrolled". "Registered" might be "Tour Completed" + intent?
    // I'll stick to the DB statuses:
    // New -> Inquiries
    // Contacted -> Engaged
    // Tour Booked -> Tour Scheduled
    // Tour Completed -> Tour Completed
    // Enrolled -> Enrolled
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
  // Assumption: Enrolled leads must have passed through Tour Completed.
  // Denominator: leads that reached Tour Completed stage.
  const registeredAfterTourPercent = leadsReachedTourCompleted > 0
    ? Math.round((enrolledCount / leadsReachedTourCompleted) * 100)
    : 0;


  // --- 5. Past Due Tasks (Bar Chart) ---
  const pastDueByType: Record<string, number> = { call: 0, text: 0, email: 0, review: 0, other: 0 };
  overdueTasks.forEach(t => {
    const type = t.type || "other";
    if (pastDueByType[type] !== undefined) pastDueByType[type]++;
    else pastDueByType.other++;
  });
  const pastDueChartData = Object.entries(pastDueByType).map(([name, value]) => ({ name, value }));

  // --- 6. Completed Tasks (Bar Chart) ---
  const completedTasksList = tasks.filter(t => t.status === "completed");
  const completedByType: Record<string, number> = { call: 0, text: 0, email: 0, review: 0, other: 0 };
  completedTasksList.forEach(t => {
    const type = t.type || "other";
    if (completedByType[type] !== undefined) completedByType[type]++;
    else completedByType.other++;
  });
  const completedChartData = Object.entries(completedByType).map(([name, value]) => ({ name, value }));


  const stats = {
    totalLifetimeValue,
    quickStats: {
      fastToursPercent,
      overdueTasksPercent,
      waitlistPercent
    },
    childrenByStatus,
    conversionStats: {
      newToTourScheduledPercent,
      newToTourCompletedPercent,
      scheduledToCompletedPercent,
      registeredAfterTourPercent
    },
    pastDueChartData,
    completedChartData
  };

  return (
    <div className="space-y-6">
      {/* <h1 className="text-3xl font-bold tracking-tight">Dashboard: {franchise.name}</h1> */}
      {/* Removed title to match image cleaner look, or maybe keep it simple */}
      <DashboardStats stats={stats} userName={franchise.name} />
    </div>
  );
}
