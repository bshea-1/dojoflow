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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MoreHorizontal, 
  Mail, 
  MessageSquare, 
  Filter, 
  Search 
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  first_name: string;
  program_interest: string;
  current_belt: string | null;
  guardians: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export function MembersList({ students }: { students: any[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterBelt, setFilterBelt] = useState<string | null>(null);
  const [filterProgram, setFilterProgram] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.guardians.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBelt = filterBelt ? student.current_belt === filterBelt : true;
    const matchesProgram = filterProgram ? student.program_interest === filterProgram : true;

    return matchesSearch && matchesBelt && matchesProgram;
  });

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Mock Actions
  const handleBulkAction = (action: string) => {
    toast.success(`${action} sent to ${selectedIds.size} members (Mock)`);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search members..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-1">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by Program</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterProgram(null)}>All Programs</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterProgram("jr")}>JR</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterProgram("create")}>Create</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Belt</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterBelt(null)}>All Belts</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBelt("White")}>White</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBelt("Yellow")}>Yellow</DropdownMenuItem>
              {/* Add more belts as needed */}
            </DropdownMenuContent>
          </DropdownMenu>

          {(filterBelt || filterProgram) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setFilterBelt(null); setFilterProgram(null); }}
              className="h-10 px-2 text-muted-foreground"
            >
              Reset
            </Button>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5">
            <span className="text-sm text-muted-foreground mr-2">
              {selectedIds.size} selected
            </span>
            <Button size="sm" onClick={() => handleBulkAction("Email")}>
              <Mail className="mr-2 h-4 w-4" /> Email
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleBulkAction("SMS")}>
              <MessageSquare className="mr-2 h-4 w-4" /> SMS
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedIds.size === filteredStudents.length && filteredStudents.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Belt</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id} data-state={selectedIds.has(student.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.has(student.id)}
                    onCheckedChange={() => toggleSelect(student.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{student.first_name}</TableCell>
                <TableCell className="capitalize">{student.program_interest}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    student.current_belt === "White" ? "bg-slate-100" :
                    student.current_belt === "Yellow" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                    "bg-slate-100"
                  }>
                    {student.current_belt || "White"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{student.guardians.first_name} {student.guardians.last_name}</span>
                    <span className="text-xs text-muted-foreground">{student.guardians.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => toast.success(`Email sent to ${student.guardians.email} (Mock)`)}>
                        Email Guardian
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`SMS sent to ${student.guardians.phone} (Mock)`)}>
                        SMS Guardian
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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

