import { Database } from "./supabase";

export type TourWithGuardian = Database["public"]["Tables"]["tours"]["Row"] & {
  leads?: {
    guardians?: Array<{
      id?: string;
      first_name: string | null;
      last_name: string | null;
      students?: Array<{
        program_interest:
          | Database["public"]["Tables"]["students"]["Row"]["program_interest"]
          | null;
      }>;
    }>;
  } | null;
};

