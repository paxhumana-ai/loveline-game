export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      drizzle_migrations: {
        Row: {
          created_at: number | null
          hash: string
          id: number
        }
        Insert: {
          created_at?: number | null
          hash: string
          id?: number
        }
        Update: {
          created_at?: number | null
          hash?: string
          id?: number
        }
        Relationships: []
      }
      game_rooms: {
        Row: {
          code: string
          created_at: string
          host_id: string | null
          id: string
          max_participants: number
          status: Database["public"]["Enums"]["game_room_status"]
          total_rounds: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          host_id?: string | null
          id?: string
          max_participants?: number
          status?: Database["public"]["Enums"]["game_room_status"]
          total_rounds?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          host_id?: string | null
          id?: string
          max_participants?: number
          status?: Database["public"]["Enums"]["game_room_status"]
          total_rounds?: number
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          game_room_id: string
          id: string
          participant1_id: string
          participant2_id: string
        }
        Insert: {
          created_at?: string
          game_room_id: string
          id?: string
          participant1_id: string
          participant2_id: string
        }
        Update: {
          created_at?: string
          game_room_id?: string
          id?: string
          participant1_id?: string
          participant2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_game_room_id_game_rooms_id_fk"
            columns: ["game_room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_participant1_id_participants_id_fk"
            columns: ["participant1_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_participant2_id_participants_id_fk"
            columns: ["participant2_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          character: string
          created_at: string
          game_room_id: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          mbti: Database["public"]["Enums"]["mbti"]
          nickname: string
          status: Database["public"]["Enums"]["participant_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          character: string
          created_at?: string
          game_room_id: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          mbti: Database["public"]["Enums"]["mbti"]
          nickname: string
          status?: Database["public"]["Enums"]["participant_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          character?: string
          created_at?: string
          game_room_id?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          mbti?: Database["public"]["Enums"]["mbti"]
          nickname?: string
          status?: Database["public"]["Enums"]["participant_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_game_room_id_game_rooms_id_fk"
            columns: ["game_room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          marketing_data: Json | null
          name: string | null
          onboarding_completed_at: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          marketing_data?: Json | null
          name?: string | null
          onboarding_completed_at?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          marketing_data?: Json | null
          name?: string | null
          onboarding_completed_at?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: Database["public"]["Enums"]["question_category"]
          content: string
          created_at: string
          difficulty: number
          id: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["question_category"]
          content: string
          created_at?: string
          difficulty?: number
          id?: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["question_category"]
          content?: string
          created_at?: string
          difficulty?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rounds: {
        Row: {
          created_at: string
          ended_at: string | null
          game_room_id: string
          id: string
          question_id: string
          round_number: number
          started_at: string | null
          status: Database["public"]["Enums"]["round_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          game_room_id: string
          id?: string
          question_id: string
          round_number: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["round_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          game_room_id?: string
          id?: string
          question_id?: string
          round_number?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["round_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_game_room_id_game_rooms_id_fk"
            columns: ["game_room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_question_id_questions_id_fk"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      selections: {
        Row: {
          created_at: string
          id: string
          round_id: string
          selected_participant_id: string
          selector_participant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          round_id: string
          selected_participant_id: string
          selector_participant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          round_id?: string
          selected_participant_id?: string
          selector_participant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "selections_round_id_rounds_id_fk"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "selections_selected_participant_id_participants_id_fk"
            columns: ["selected_participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "selections_selector_participant_id_participants_id_fk"
            columns: ["selector_participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_room_status: "waiting" | "in_progress" | "completed" | "cancelled"
      gender: "male" | "female" | "other"
      mbti:
        | "INTJ"
        | "INTP"
        | "ENTJ"
        | "ENTP"
        | "INFJ"
        | "INFP"
        | "ENFJ"
        | "ENFP"
        | "ISTJ"
        | "ISFJ"
        | "ESTJ"
        | "ESFJ"
        | "ISTP"
        | "ISFP"
        | "ESTP"
        | "ESFP"
      participant_status: "joined" | "ready" | "playing" | "finished"
      question_category:
        | "romance"
        | "friendship"
        | "personality"
        | "lifestyle"
        | "preferences"
        | "hypothetical"
      round_status: "pending" | "active" | "completed"
      user_type: "ADMIN" | "GENERAL"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_room_status: ["waiting", "in_progress", "completed", "cancelled"],
      gender: ["male", "female", "other"],
      mbti: [
        "INTJ",
        "INTP",
        "ENTJ",
        "ENTP",
        "INFJ",
        "INFP",
        "ENFJ",
        "ENFP",
        "ISTJ",
        "ISFJ",
        "ESTJ",
        "ESFJ",
        "ISTP",
        "ISFP",
        "ESTP",
        "ESFP",
      ],
      participant_status: ["joined", "ready", "playing", "finished"],
      question_category: [
        "romance",
        "friendship",
        "personality",
        "lifestyle",
        "preferences",
        "hypothetical",
      ],
      round_status: ["pending", "active", "completed"],
      user_type: ["ADMIN", "GENERAL"],
    },
  },
} as const
