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
          role: 'franchisee' | 'center_director' | 'sensei' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          franchise_id?: string | null
          full_name?: string | null
          role?: 'franchisee' | 'center_director' | 'sensei' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          franchise_id?: string | null
          full_name?: string | null
          role?: 'franchisee' | 'center_director' | 'sensei' | null
          created_at?: string
          updated_at?: string
        }
      }
      franchise_assignments: {
        Row: {
          id: string
          profile_id: string
          franchise_id: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          franchise_id: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          franchise_id?: string
          created_at?: string
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
          program_interest: ('jr' | 'create' | 'camp' | 'ai' | 'robotics' | 'clubs' | 'birthday_party' | 'pno' | 'academy')[]
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
          program_interest: ('jr' | 'create' | 'camp' | 'ai' | 'robotics' | 'clubs' | 'birthday_party' | 'pno' | 'academy')[]
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
          program_interest?: ('jr' | 'create' | 'camp' | 'ai' | 'robotics' | 'clubs' | 'birthday_party' | 'pno' | 'academy')[]
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
      interactions: {
        Row: {
          id: string
          lead_id: string
          type: 'call' | 'sms' | 'email'
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          type: 'call' | 'sms' | 'email'
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          type?: 'call' | 'sms' | 'email'
          content?: string | null
          created_at?: string
        }
      }
      automations: {
        Row: {
          id: string
          franchise_id: string
          name: string
          trigger: 'lead_created' | 'status_changed' | 'tour_booked' | 'tour_completed'
          conditions: Json
          actions: Json
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          franchise_id: string
          name: string
          trigger: 'lead_created' | 'status_changed' | 'tour_booked' | 'tour_completed'
          conditions?: Json
          actions?: Json
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          franchise_id?: string
          name?: string
          trigger?: 'lead_created' | 'status_changed' | 'tour_booked' | 'tour_completed'
          conditions?: Json
          actions?: Json
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      automation_logs: {
        Row: {
          id: string
          franchise_id: string
          automation_id: string | null
          lead_id: string | null
          status: string
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          franchise_id: string
          automation_id?: string | null
          lead_id?: string | null
          status: string
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          franchise_id?: string
          automation_id?: string | null
          lead_id?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
        }
      }
    }
    Enums: {
      program_interest: 'jr' | 'create' | 'camp' | 'ai' | 'robotics' | 'clubs' | 'birthday_party' | 'pno' | 'academy'
      app_role: 'franchisee' | 'center_director' | 'sensei'
      automation_trigger: 'lead_created' | 'status_changed' | 'tour_booked' | 'tour_completed'
      automation_action_type: 'send_email' | 'send_sms' | 'create_task'
      interaction_type: 'call' | 'sms' | 'email'
    }
  }
}
