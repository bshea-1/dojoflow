import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromotionDialog } from "@/components/students/promotion-dialog";
import { differenceInMonths, format } from "date-fns";
import { AlertTriangle, History } from "lucide-react";

export default async function StudentProfilePage({ 
  params 
}: { 
  params: { slug: string; studentId: string } 
}) {
  const supabase = createClient();

  // Fetch Student Details with Guardian info
  const { data: student, error } = await supabase
    .from("students")
    .select(`
      *,
      guardians (
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq("id", params.studentId)
    .single();

  if (error || !student) {
    return <div>Student not found</div>;
  }

  // Fetch Promotion History
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("student_id", params.studentId)
    .order("promoted_at", { ascending: false });

  // Stagnation Logic
  const lastPromoDate = student.last_promotion_date 
    ? new Date(student.last_promotion_date) 
    : new Date(student.created_at);
    
  const monthsSincePromo = differenceInMonths(new Date(), lastPromoDate);
  const isStagnant = monthsSincePromo >= 3;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {student.first_name} {student.guardians?.last_name}
          </h1>
          <p className="text-muted-foreground">
            Guardian: {student.guardians?.first_name} {student.guardians?.last_name}
          </p>
        </div>
        <PromotionDialog 
          studentId={student.id} 
          currentBelt={student.current_belt || "White"} 
          franchiseSlug={params.slug}
        />
      </div>

      {/* Alerts Section */}
      {isStagnant && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-yellow-800">Retention Alert</h3>
            <p className="text-sm text-yellow-700">
              This student hasn't promoted in {monthsSincePromo} months. Consider scheduling a progress check-in with the guardian.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Program</span>
              <span className="text-sm capitalize">{student.program_interest}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Current Belt</span>
              <Badge variant="secondary" className="text-base">
                {student.current_belt || "White"}
              </Badge>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm font-medium">Last Promotion</span>
              <span className="text-sm">
                {student.last_promotion_date 
                  ? format(new Date(student.last_promotion_date), "MMM d, yyyy")
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Promotion History Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {promotions?.map((promo) => (
                <div key={promo.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-medium">{promo.belt_rank} Belt</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(promo.promoted_at), "MMM d, yyyy")}
                  </span>
                </div>
              ))}
              {(!promotions || promotions.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No promotion history recorded.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

