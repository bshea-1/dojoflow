export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      franchises: {
        Row: {
          id: string
          name: string
          slug: string
          address: string | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          address?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          address?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          franchise_id: string | null
          full_name: string | null
          role: 'owner' | 'director' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          franchise_id?: string | null
          full_name?: string | null
          role?: 'owner' | 'director' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          franchise_id?: string | null
          full_name?: string | null
          role?: 'owner' | 'director' | null
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          franchise_id: string
          status: 'new' | 'contacted' | 'tour_booked' | 'tour_completed' | 'enrolled' | 'lost' | null
          source: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          franchise_id: string
          status?: 'new' | 'contacted' | 'tour_booked' | 'tour_completed' | 'enrolled' | 'lost' | null
          source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          franchise_id?: string
          status?: 'new' | 'contacted' | 'tour_booked' | 'tour_completed' | 'enrolled' | 'lost' | null
          source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      guardians: {
        Row: {
          id: string
          lead_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          guardian_id: string
          first_name: string
          dob: string
          program_interest: 'jr' | 'create' | 'camp' | 'ai' | 'robotics' | 'clubs' | 'birthday_party'
          current_belt: string | null
          last_promotion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guardian_id: string
          first_name: string
          dob: string
          program_interest: 'jr' | 'create' | 'camp' | 'ai' | 'robotics' | 'clubs' | 'birthday_party'
          current_belt?: string | null
          last_promotion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guardian_id?: string
          first_name?: string
          dob?: string
          program_interest?: 'jr' | 'create' | 'camp'
          current_belt?: string | null
          last_promotion_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tours: {
        Row: {
          id: string
          lead_id: string
          franchise_id: string
          scheduled_at: string
          status: 'scheduled' | 'completed' | 'no-show' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          franchise_id: string
          scheduled_at: string
          status?: 'scheduled' | 'completed' | 'no-show' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          franchise_id?: string
          scheduled_at?: string
          status?: 'scheduled' | 'completed' | 'no-show' | null
          created_at?: string
          updated_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          student_id: string
          belt_rank: string
          promoted_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          student_id: string
          belt_rank: string
          promoted_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          belt_rank?: string
          promoted_at?: string
          created_by?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          franchise_id: string
          lead_id: string | null
          assigned_to: string | null
          title: string
          description: string | null
          due_date: string | null
          status: 'pending' | 'completed'
          type: 'call' | 'email' | 'text' | 'review' | 'other'
          outcome: string | null
          notify_email: boolean | null
          notify_sms: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          franchise_id: string
          lead_id?: string | null
          assigned_to?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          status?: 'pending' | 'completed'
          type?: 'call' | 'email' | 'text' | 'review' | 'other'
          outcome?: string | null
          notify_email?: boolean | null
          notify_sms?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          franchise_id?: string
          lead_id?: string | null
          assigned_to?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          status?: 'pending' | 'completed'
          type?: 'call' | 'email' | 'text' | 'review' | 'other'
          outcome?: string | null
          notify_email?: boolean | null
          notify_sms?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

