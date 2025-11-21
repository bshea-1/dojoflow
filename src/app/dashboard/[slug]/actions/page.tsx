import { getTasks } from "./actions";
import { ActionList } from "@/components/actions/action-list";
import { createClient } from "@/lib/supabase/server";

export default async function ActionsPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  // Get Current User Role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id || "")
    .single();

  const role = profile?.role || "sensei";

  const tasks = await getTasks(params.slug);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Actions & Tasks</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        <ActionList
          franchiseSlug={params.slug}
          initialTasks={tasks}
          userRole={role}
        />
      </div>
    </div>
  );
}
