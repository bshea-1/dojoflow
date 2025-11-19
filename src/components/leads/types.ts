import { Database } from "@/types/supabase";

export type StudentWithGuardian = Database["public"]["Tables"]["students"]["Row"];

export type GuardianWithStudents = Database["public"]["Tables"]["guardians"]["Row"] & {
  students: StudentWithGuardian[];
};

export type LeadWithGuardian = Database["public"]["Tables"]["leads"]["Row"] & {
  guardians: GuardianWithStudents[];
};

