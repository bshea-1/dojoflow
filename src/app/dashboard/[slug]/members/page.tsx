import { getMembers } from "./actions";
import { MembersList } from "@/components/members/members-list";

export default async function MembersPage({ params }: { params: { slug: string } }) {
  const members = await getMembers(params.slug);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-10">
        <MembersList initialMembers={members} />
      </div>
    </div>
  );
}
