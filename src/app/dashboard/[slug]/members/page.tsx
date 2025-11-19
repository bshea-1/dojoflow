import { getMembers } from "./actions";
import { MembersList } from "@/components/members/members-list";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  // Get Current User Role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id || "")
    .single();
  
  const role = profile?.role || "sensei";
  const isReadOnly = role === "sensei";

  const members = await getMembers(params.slug);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          This view focuses on guardian/parent contacts so you can keep following up on leads
          without the distractions of belt tracking.
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-10">
        <MembersList 
          initialMembers={members} 
          franchiseSlug={params.slug} 
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  );
}
