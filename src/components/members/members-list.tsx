"use client";

import { useMemo, useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LeadEditForm } from "@/components/leads/lead-edit-form";
import { EditLeadSchema } from "@/lib/schemas/edit-lead";
import type { Member as MemberType } from "@/app/dashboard/[slug]/members/actions";
import { programLeadOptions } from "@/lib/schemas/book-tour";
import { FamilyProfileDialog } from "./family-profile-dialog";

interface MembersListProps {
  initialMembers: MemberType[];
  franchiseSlug: string;
  isReadOnly?: boolean;
}

const formatStatus = (status?: string | null) =>
  status ? status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Active";

export function FamiliesList({ initialMembers, franchiseSlug, isReadOnly = false }: MembersListProps) {
  const [members, setMembers] = useState(initialMembers);
  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilters, setProgramFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [editingMember, setEditingMember] = useState<MemberType | null>(null);
  const [viewingMember, setViewingMember] = useState<MemberType | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${member.guardianFirstName} ${member.guardianLastName}`.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProgram =
        programFilters.length === 0 ||
        (Array.isArray(member.program) &&
          member.program.some((p) => programFilters.includes(p)));

      const matchesStatus =
        statusFilters.length === 0 ||
        (member.status && statusFilters.includes(member.status));

      return matchesSearch && matchesProgram && matchesStatus;
    });
  }, [members, searchQuery, programFilters, statusFilters]);

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

  const handleEditSaved = (values: EditLeadSchema) => {
    if (!editingMember) return;
    setMembers((prev) =>
      prev.map((member) =>
        member.id === editingMember.id
          ? {
            ...member,
            guardianFirstName: values.guardianFirstName,
            guardianLastName: values.guardianLastName,
            email: values.guardianEmail,
            phone: values.guardianPhone,
            studentName: values.studentFirstName,
            program: values.studentProgram,
            source: values.source,
            notes: values.notes,
          }
          : member
      )
    );
    setEditingMember(null);
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
              Lead Path {programFilters.length > 0 && `(${programFilters.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {programLeadOptions.map((program) => (
              <DropdownMenuCheckboxItem
                key={program.value}
                checked={programFilters.includes(program.value)}
                onCheckedChange={(checked) =>
                  setProgramFilters((prev) =>
                    checked
                      ? [...prev, program.value]
                      : prev.filter((p) => p !== program.value)
                  )
                }
              >
                {program.label}
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
            {["new", "contacted", "tour_booked", "tour_completed", "tour_not_completed", "enrolled", "lost"].map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilters.includes(status)}
                onCheckedChange={(checked) =>
                  setStatusFilters((prev) =>
                    checked
                      ? [...prev, status]
                      : prev.filter((s) => s !== status)
                  )
                }
              >
                {formatStatus(status)}
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
              <TableHead>Lead Path</TableHead>
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
                <TableCell className="font-medium">
                  {member.guardianFirstName} {member.guardianLastName}
                </TableCell>
                <TableCell>{member.studentName}</TableCell>
                <TableCell className="capitalize">
                  {member.program.map(p =>
                    programLeadOptions.find(opt => opt.value === p)?.label || p
                  ).join(", ") || "N/A"}
                </TableCell>
                <TableCell>
                  <Badge variant={member.status === "enrolled" ? "default" : "outline"}>
                    {formatStatus(member.status)}
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
                      <DropdownMenuItem onClick={() => setViewingMember(member)}>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleIndividualAction(`${member.guardianFirstName} ${member.guardianLastName}`, "email")}
                      >
                        Email Guardian
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleIndividualAction(`${member.guardianFirstName} ${member.guardianLastName}`, "sms")}
                      >
                        SMS Guardian
                      </DropdownMenuItem>
                      {!isReadOnly && (
                        <DropdownMenuItem onClick={() => setEditingMember(member)}>
                          Edit Details
                        </DropdownMenuItem>
                      )}
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
                  No families match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit Member Details</DialogTitle>
            <DialogDescription>Update guardian and student information.</DialogDescription>
          </DialogHeader>
          {editingMember && (
            <LeadEditForm
              franchiseSlug={franchiseSlug}
              leadId={editingMember.leadId}
              guardianId={editingMember.guardianId}
              studentId={editingMember.studentId}
              isReadOnly={isReadOnly}
              initialValues={{
                guardianFirstName: editingMember.guardianFirstName || "",
                guardianLastName: editingMember.guardianLastName || "",
                guardianEmail: editingMember.email || "",
                guardianPhone: editingMember.phone || "",
                studentFirstName: editingMember.studentName || "",
                studentProgram: (editingMember.program || ["jr"]) as EditLeadSchema["studentProgram"],
                source: editingMember.source || "",
                notes: editingMember.notes || "",
              }}
              onSaved={handleEditSaved}
            />
          )}
        </DialogContent>
      </Dialog>

      {viewingMember && (
        <FamilyProfileDialog
          member={viewingMember}
          franchiseSlug={franchiseSlug}
          open={!!viewingMember}
          onOpenChange={(open) => !open && setViewingMember(null)}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
}
