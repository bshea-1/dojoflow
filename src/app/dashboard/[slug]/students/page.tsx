import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default async function StudentsPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  // 1. Get Franchise ID
  const { data: franchise } = await supabase
    .from("franchises")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (!franchise) return <div>Franchise not found</div>;

  // 2. Fetch Students via Guardians -> Leads -> Franchise
  // This is a complex join. 
  // We need students where guardian -> lead -> franchise_id = current
  
  const { data: students, error } = await supabase
    .from("students")
    .select(`
      *,
      guardians!inner (
        first_name,
        last_name,
        leads!inner (
          franchise_id
        )
      )
    `)
    .eq("guardians.leads.franchise_id", franchise.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Active Students</h1>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Current Belt</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  {student.first_name}
                </TableCell>
                <TableCell className="capitalize">{student.program_interest}</TableCell>
                <TableCell>
                  <Badge variant="outline">{student.current_belt || "White"}</Badge>
                </TableCell>
                <TableCell>
                  {student.guardians?.first_name} {student.guardians?.last_name}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/${params.slug}/students/${student.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {(!students || students.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No students found. Enroll leads to see them here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

