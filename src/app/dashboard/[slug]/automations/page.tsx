import { AutomationList } from "@/components/automations/automation-list";
import { AutomationBuilderDialog } from "@/components/automations/automation-builder-dialog";
import { getAutomations } from "./actions";

export default async function AutomationsPage({ params }: { params: { slug: string } }) {
  const automations = await getAutomations(params.slug);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automations</h1>
          <p className="text-muted-foreground">
            Create workflows to automatically follow up with leads and members.
          </p>
        </div>
        <AutomationBuilderDialog franchiseSlug={params.slug} />
      </div>

      <div className="flex-1">
        <AutomationList automations={automations} franchiseSlug={params.slug} />
      </div>
    </div>
  );
}
