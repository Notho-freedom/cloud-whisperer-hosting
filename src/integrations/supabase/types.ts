export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          audience: string | null
          body: string | null
          created_at: string
          id: string
          scheduled_at: string | null
          status: string | null
          title: string
        }
        Insert: {
          audience?: string | null
          body?: string | null
          created_at?: string
          id?: string
          scheduled_at?: string | null
          status?: string | null
          title: string
        }
        Update: {
          audience?: string | null
          body?: string | null
          created_at?: string
          id?: string
          scheduled_at?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      api_call_logs: {
        Row: {
          created_at: string
          endpoint: string
          error: string | null
          id: string
          latency_ms: number | null
          method: string | null
          provider: string
          status: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error?: string | null
          id?: string
          latency_ms?: number | null
          method?: string | null
          provider: string
          status?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error?: string | null
          id?: string
          latency_ms?: number | null
          method?: string | null
          provider?: string
          status?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          hashed_key: string
          id: string
          last_used_at: string | null
          name: string
          org_id: string
          prefix: string
          scopes: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          hashed_key: string
          id?: string
          last_used_at?: string | null
          name: string
          org_id: string
          prefix: string
          scopes?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          hashed_key?: string
          id?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          prefix?: string
          scopes?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          id: string
          ip: string | null
          metadata: Json | null
          target: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          target?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          metadata?: Json | null
          target?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          body: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean | null
          published_at: string | null
          read_time: number | null
          slug: string
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      deployments: {
        Row: {
          author: string | null
          branch: string | null
          commit_msg: string | null
          commit_sha: string | null
          created_at: string
          duration: number | null
          id: string
          site_id: string
          status: string
          target: string | null
          url: string | null
          vercel_deployment_id: string | null
        }
        Insert: {
          author?: string | null
          branch?: string | null
          commit_msg?: string | null
          commit_sha?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          site_id: string
          status?: string
          target?: string | null
          url?: string | null
          vercel_deployment_id?: string | null
        }
        Update: {
          author?: string | null
          branch?: string | null
          commit_msg?: string | null
          commit_sha?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          site_id?: string
          status?: string
          target?: string | null
          url?: string | null
          vercel_deployment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      dns_records: {
        Row: {
          created_at: string
          domain_id: string
          id: string
          name: string
          priority: number | null
          ttl: number
          type: string
          value: string
        }
        Insert: {
          created_at?: string
          domain_id: string
          id?: string
          name: string
          priority?: number | null
          ttl?: number
          type: string
          value: string
        }
        Update: {
          created_at?: string
          domain_id?: string
          id?: string
          name?: string
          priority?: number | null
          ttl?: number
          type?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "dns_records_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          expires_at: string | null
          id: string
          locked: boolean | null
          name: string
          nameservers: string[] | null
          org_id: string
          planethoster_id: string | null
          price_per_year: number | null
          privacy: boolean | null
          registered_at: string | null
          registrar: string | null
          status: string
          tld: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          expires_at?: string | null
          id?: string
          locked?: boolean | null
          name: string
          nameservers?: string[] | null
          org_id: string
          planethoster_id?: string | null
          price_per_year?: number | null
          privacy?: boolean | null
          registered_at?: string | null
          registrar?: string | null
          status?: string
          tld: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          expires_at?: string | null
          id?: string
          locked?: boolean | null
          name?: string
          nameservers?: string[] | null
          org_id?: string
          planethoster_id?: string | null
          price_per_year?: number | null
          privacy?: boolean | null
          registered_at?: string | null
          registrar?: string | null
          status?: string
          tld?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "domains_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_aliases: {
        Row: {
          alias: string
          created_at: string
          id: string
          mailbox_id: string
        }
        Insert: {
          alias: string
          created_at?: string
          id?: string
          mailbox_id: string
        }
        Update: {
          alias?: string
          created_at?: string
          id?: string
          mailbox_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_aliases_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      email_forwards: {
        Row: {
          created_at: string
          forward_to: string
          id: string
          mailbox_id: string
        }
        Insert: {
          created_at?: string
          forward_to: string
          id?: string
          mailbox_id: string
        }
        Update: {
          created_at?: string
          forward_to?: string
          id?: string
          mailbox_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_forwards_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      env_vars: {
        Row: {
          id: string
          key: string
          site_id: string
          target: string[]
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          site_id: string
          target?: string[]
          type?: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          site_id?: string
          target?: string[]
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "env_vars_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          id: string
          resolved_at: string | null
          severity: string | null
          started_at: string
          status: string | null
          title: string
          updates: Json | null
        }
        Insert: {
          id?: string
          resolved_at?: string | null
          severity?: string | null
          started_at?: string
          status?: string | null
          title: string
          updates?: Json | null
        }
        Update: {
          id?: string
          resolved_at?: string | null
          severity?: string | null
          started_at?: string
          status?: string | null
          title?: string
          updates?: Json | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          currency: string | null
          date: string
          due_date: string | null
          id: string
          items: Json | null
          number: string | null
          org_id: string
          pdf_url: string | null
          status: string
          stripe_invoice_id: string | null
        }
        Insert: {
          amount: number
          currency?: string | null
          date?: string
          due_date?: string | null
          id?: string
          items?: Json | null
          number?: string | null
          org_id: string
          pdf_url?: string | null
          status?: string
          stripe_invoice_id?: string | null
        }
        Update: {
          amount?: number
          currency?: string | null
          date?: string
          due_date?: string | null
          id?: string
          items?: Json | null
          number?: string | null
          org_id?: string
          pdf_url?: string | null
          status?: string
          stripe_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mailboxes: {
        Row: {
          address: string
          created_at: string
          domain: string
          id: string
          org_id: string
          plan: string | null
          provider: string
          provider_account_id: string | null
          quota_gb: number | null
          used_gb: number | null
        }
        Insert: {
          address: string
          created_at?: string
          domain: string
          id?: string
          org_id: string
          plan?: string | null
          provider: string
          provider_account_id?: string | null
          quota_gb?: number | null
          used_gb?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          domain?: string
          id?: string
          org_id?: string
          plan?: string | null
          provider?: string
          provider_account_id?: string | null
          quota_gb?: number | null
          used_gb?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mailboxes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          plan_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          plan_id?: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          plan_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean | null
          last4: string | null
          org_id: string
          stripe_pm_id: string | null
          type: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          org_id: string
          stripe_pm_id?: string | null
          type?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean | null
          last4?: string | null
          org_id?: string
          stripe_pm_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          locale: string | null
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          locale?: string | null
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          locale?: string | null
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          created_at: string
          domains: string[] | null
          framework: string | null
          git_branch: string | null
          git_repo: string | null
          id: string
          last_deploy_at: string | null
          name: string
          org_id: string
          prod_url: string | null
          region: string | null
          vercel_project_id: string | null
        }
        Insert: {
          created_at?: string
          domains?: string[] | null
          framework?: string | null
          git_branch?: string | null
          git_repo?: string | null
          id?: string
          last_deploy_at?: string | null
          name: string
          org_id: string
          prod_url?: string | null
          region?: string | null
          vercel_project_id?: string | null
        }
        Update: {
          created_at?: string
          domains?: string[] | null
          framework?: string | null
          git_branch?: string | null
          git_repo?: string | null
          id?: string
          last_deploy_at?: string | null
          name?: string
          org_id?: string
          prod_url?: string | null
          region?: string | null
          vercel_project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          org_id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          org_id: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          org_id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          author_id: string | null
          author_name: string | null
          body: string
          id: string
          is_staff: boolean | null
          sent_at: string
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body: string
          id?: string
          is_staff?: boolean | null
          sent_at?: string
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string
          id?: string
          is_staff?: boolean | null
          sent_at?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          org_id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          org_id: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          org_id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_metrics: {
        Row: {
          bandwidth_gb: number | null
          build_minutes: number | null
          id: string
          org_id: string
          period: string
          recorded_at: string
        }
        Insert: {
          bandwidth_gb?: number | null
          build_minutes?: number | null
          id?: string
          org_id: string
          period: string
          recorded_at?: string
        }
        Update: {
          bandwidth_gb?: number | null
          build_minutes?: number | null
          id?: string
          org_id?: string
          period?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: { Args: { _org: string; _user: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "admin" | "support"
      org_role: "owner" | "admin" | "member" | "billing" | "viewer"
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
      app_role: ["user", "admin", "support"],
      org_role: ["owner", "admin", "member", "billing", "viewer"],
    },
  },
} as const
