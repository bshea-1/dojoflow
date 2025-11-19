"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Filter, Mail, MessageSquare, MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";

// Mock Data
const MOCK_MEMBERS = [
  { id: "1", name: "Ninja Sam", belt: "White", program: "JR", status: "Active", guardian: "Jane Doe" },
  { id: "2", name: "Ninja Mike", belt: "Yellow", program: "Create", status: "Active", guardian: "John Smith" },
  { id: "3", name: "Ninja Sarah", belt: "Orange", program: "Create", status: "Paused", guardian: "Emily Jones" },
  { id: "4", name: "Ninja Tom", belt: "White", program: "JR", status: "Active", guardian: "Michael Brown" },
  { id: "5", name: "Ninja Alex", belt: "Green", program: "Create", status: "Active", guardian: "Sarah Wilson" },
];

export default function MembersPage() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [filterBelt, setFilterBelt] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic
  const filteredMembers = MOCK_MEMBERS.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.guardian.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBelt = filterBelt ? member.belt === filterBelt : true;
    return matchesSearch && matchesBelt;
  });

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  const toggleSelectMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(mId => mId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  // Mock Actions
  const handleBulkAction = (action: "email" | "sms") => {
    toast.success(`Mock: Sending ${action} to ${selectedMembers.length} members.`);
    setSelectedMembers([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <div className="flex gap-2">
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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
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
              Filter by Belt {filterBelt && `(${filterBelt})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["White", "Yellow", "Orange", "Green"].map((belt) => (
              <DropdownMenuCheckboxItem 
                key={belt}
                checked={filterBelt === belt}
                onCheckedChange={(checked) => setFilterBelt(checked ? belt : null)}
              >
                {belt}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
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
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredMembers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
