import type { MeetingType } from "@/types/assignment";

type AssignmentRow = {
  id: string;
  meeting_date: string;
  meeting_type: MeetingType;
  section: string;
  title: string;
  participant_name: string;
  assistant_name: string | null;
  congregation_name: string | null;
  notes: string | null;
  start_time: string | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
};

type AssignmentWrite = {
  id?: string;
  meeting_date: string;
  meeting_type: MeetingType;
  section: string;
  title: string;
  participant_name: string;
  assistant_name?: string | null;
  congregation_name?: string | null;
  notes?: string | null;
  start_time?: string | null;
  duration_minutes?: number | null;
};

export type Database = {
  public: {
    Tables: {
      assignments: {
        Row: AssignmentRow;
        Insert: AssignmentWrite;
        Update: Partial<AssignmentWrite>;
        Relationships: [];
      };
      participants: {
        Row: {
          name: string;
        };
        Insert: {
          name: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      assignment_admins: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      add_assignment_admin_by_email: {
        Args: {
          target_email: string;
        };
        Returns: {
          user_id: string;
          email: string;
          added: boolean;
        }[];
      };
      is_assignment_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      list_assignment_admins: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          email: string;
        }[];
      };
      remove_assignment_admin: {
        Args: {
          target_user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
