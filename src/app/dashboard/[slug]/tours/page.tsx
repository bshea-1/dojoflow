import { createClient } from "@/lib/supabase/server";
import { ToursClient } from "@/components/tours/tours-client";
import { TourWithGuardian } from "@/types/tours";

export default async function ToursPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  // 1. Get Franchise ID
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (!franchise) return <div>Franchise not found</div>;

  // 2. Fetch Tours (only scheduled tours - filter out completed and no-show)
  const { data: tours } = await supabase
    .from("tours")
    .select(`
      *,
      leads (
        id,
        guardians (
          first_name,
          last_name,
          students (
            program_interest
          )
        )
      )
    `)
    .eq("franchise_id", franchise.id)
    .or("status.eq.scheduled,status.is.null"); // Only show scheduled tours

  // 3. Fetch Leads for Dropdown (only those not yet enrolled/lost ideally, or just all active)
  const { data: leads } = await supabase
    .from("leads")
    .select(`
      id,
      guardians (first_name, last_name)
    `)
    .eq("franchise_id", franchise.id)
    .neq("status", "lost")
    .neq("status", "enrolled");

  const leadOptions = leads?.map(l => ({
    id: l.id,
    label: l.guardians?.[0] 
      ? `${l.guardians[0].first_name} ${l.guardians[0].last_name}` 
      : "Unknown Lead"
  })) || [];

  return (
    <ToursClient
      franchiseSlug={params.slug}
      leads={leadOptions}
      tours={(tours as TourWithGuardian[]) || []}
    />
  );
}
