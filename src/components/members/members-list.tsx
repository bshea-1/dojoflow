"use client";

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
  Mail,
  MessageSquare,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  guardian_name: string;
  student_name: string;
  program: string;
  status: string;
  email: string;
  phone: string;
}

interface MembersListProps {
  initialMembers: Member[];
}

const PROGRAM_OPTIONS = ["jr", "create", "ai", "robotics", "clubs", "camp"];

export function MembersList({ initialMembers }: MembersListProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilters, setProgramFilters] = useState<string[]>([]);

  const filteredMembers = useMemo(() => {
    return initialMembers.filter((member) => {
      const matchesSearch =
        member.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.guardian_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram =
        programFilters.length === 0 || programFilters.includes(member.program);

      return matchesSearch && matchesProgram;
    });
  }, [initialMembers, searchQuery, programFilters]);

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
              <TableHead>Guardian</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
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
                <TableCell className="font-medium">{member.guardian_name}</TableCell>
                <TableCell>{member.student_name}</TableCell>
                <TableCell className="capitalize">{member.program}</TableCell>
                <TableCell>
                  <Badge variant={member.status === "Active" ? "default" : "outline"}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{member.email}</div>
                  <div className="text-xs text-muted-foreground">{member.phone}</div>
                </TableCell>
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
                        onClick={() => handleIndividualAction(member.guardian_name, "email")}
                      >
                        Email Guardian
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleIndividualAction(member.guardian_name, "sms")}
                      >
                        SMS Guardian
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
