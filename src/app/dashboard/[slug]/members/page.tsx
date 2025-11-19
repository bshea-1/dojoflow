'use client';

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_MEMBERS = [
  { id: "1", name: "Ninja Sam", belt: "White", program: "JR", status: "Active", guardian: "Jane Doe" },
  { id: "2", name: "Ninja Mike", belt: "Yellow", program: "Create", status: "Active", guardian: "John Smith" },
  { id: "3", name: "Ninja Sarah", belt: "Orange", program: "Create", status: "Paused", guardian: "Emily Jones" },
  { id: "4", name: "Ninja Tom", belt: "White", program: "JR", status: "Active", guardian: "Michael Brown" },
  { id: "5", name: "Ninja Alex", belt: "Green", program: "Create", status: "Active", guardian: "Sarah Wilson" },
  { id: "6", name: "Ninja Leah", belt: "Blue", program: "AI", status: "Active", guardian: "Robert King" },
  { id: "7", name: "Ninja Eli", belt: "Purple", program: "Robotics", status: "Paused", guardian: "Amy Clark" },
] as const;

const BELT_OPTIONS = ["White", "Yellow", "Orange", "Green", "Blue", "Purple"];
const STATUS_OPTIONS = ["Active", "Paused"];
const PROGRAM_OPTIONS = ["JR", "Create", "AI", "Robotics", "Clubs", "Camps"];

export default function MembersPage() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [beltFilters, setBeltFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [programFilters, setProgramFilters] = useState<string[]>([]);

  const filteredMembers = useMemo(() => {
    return MOCK_MEMBERS.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.guardian.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBelt =
        beltFilters.length === 0 || beltFilters.includes(member.belt);
      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(member.status);
      const matchesProgram =
        programFilters.length === 0 || programFilters.includes(member.program);

      return matchesSearch && matchesBelt && matchesStatus && matchesProgram;
    });
  }, [searchQuery, beltFilters, statusFilters, programFilters]);

  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map((m) => m.id));
    }
  };

  const toggleSelectMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: "email" | "sms") => {
    if (selectedMembers.length === 0) return;
    toast.success(
      `Mock: Sending ${action} to ${selectedMembers.length} members.`
    );
    setSelectedMembers([]);
  };

  const handleIndividualAction = (
    memberName: string,
    action: "email" | "sms"
  ) => {
    toast.success(`Mock: Sending ${action} to ${memberName}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setSelectedMembers(filteredMembers.map((member) => member.id))
            }
          >
            Select All
          </Button>
          {selectedMembers.length > 0 && (
            <>
              <Button variant="outline" onClick={() => handleBulkAction("email")}>
                <Mail className="mr-2 h-4 w-4" /> Email ({selectedMembers.length})
              </Button>
              <Button variant="outline" onClick={() => handleBulkAction("sms")}>
                <MessageSquare className="mr-2 h-4 w-4" /> SMS ({selectedMembers.length})
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members or guardians..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Belt {beltFilters.length > 0 && `(${beltFilters.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {BELT_OPTIONS.map((belt) => (
              <DropdownMenuCheckboxItem
                key={belt}
                checked={beltFilters.includes(belt)}
                onCheckedChange={(checked) =>
                  setBeltFilters((prev) =>
                    checked ? [...prev, belt] : prev.filter((b) => b !== belt)
                  )
                }
              >
                {belt}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Status {statusFilters.length > 0 && `(${statusFilters.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {STATUS_OPTIONS.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilters.includes(status)}
                onCheckedChange={(checked) =>
                  setStatusFilters((prev) =>
                    checked ? [...prev, status] : prev.filter((s) => s !== status)
                  )
                }
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Program {programFilters.length > 0 && `(${programFilters.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {PROGRAM_OPTIONS.map((program) => (
              <DropdownMenuCheckboxItem
                key={program}
                checked={programFilters.includes(program)}
                onCheckedChange={(checked) =>
                  setProgramFilters((prev) =>
                    checked
                      ? [...prev, program]
                      : prev.filter((p) => p !== program)
                  )
                }
              >
                {program}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={
                    filteredMembers.length > 0 &&
                    selectedMembers.length === filteredMembers.length
                  }
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Belt</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleSelectMember(member.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{member.belt}</Badge>
                </TableCell>
                <TableCell>{member.program}</TableCell>
                <TableCell>
                  <Badge variant={member.status === "Active" ? "default" : "outline"}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>{member.guardian}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleIndividualAction(member.name, "email")}
                      >
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleIndividualAction(member.name, "sms")}
                      >
                        Send SMS
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredMembers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No members match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
