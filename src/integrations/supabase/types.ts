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
      blueprint_syncs: {
        Row: {
          blueprint_id: string
          created_at: string
          details: Json
          id: string
          status: string
        }
        Insert: {
          blueprint_id: string
          created_at?: string
          details?: Json
          id?: string
          status: string
        }
        Update: {
          blueprint_id?: string
          created_at?: string
          details?: Json
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "blueprint_syncs_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      blueprints: {
        Row: {
          created_at: string
          id: string
          last_sync_at: string | null
          last_sync_status: string | null
          name: string
          org_id: string
          render_blueprint_id: string | null
          yaml: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string | null
          name: string
          org_id: string
          render_blueprint_id?: string | null
          yaml: string
        }
        Update: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string | null
          name?: string
          org_id?: string
          render_blueprint_id?: string | null
          yaml?: string
        }
        Relationships: []
      }
      dedicated_ips: {
        Row: {
          created_at: string
          environment_ids: Json
          id: string
          ips: Json
          name: string
          org_id: string
          region: string
          render_ip_set_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          environment_ids?: Json
          id?: string
          ips?: Json
          name: string
          org_id: string
          region: string
          render_ip_set_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          environment_ids?: Json
          id?: string
          ips?: Json
          name?: string
          org_id?: string
          region?: string
          render_ip_set_id?: string | null
          status?: string
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
      disk_snapshots: {
        Row: {
          disk_id: string
          id: string
          key_expires_at: string | null
          render_snapshot_key: string | null
          taken_at: string
        }
        Insert: {
          disk_id: string
          id?: string
          key_expires_at?: string | null
          render_snapshot_key?: string | null
          taken_at?: string
        }
        Update: {
          disk_id?: string
          id?: string
          key_expires_at?: string | null
          render_snapshot_key?: string | null
          taken_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disk_snapshots_disk_id_fkey"
            columns: ["disk_id"]
            isOneToOne: false
            referencedRelation: "service_disks"
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
      domain_orders: {
        Row: {
          completed_at: string | null
          created_at: string
          currency_code: string
          domain_name: string
          error_message: string | null
          id: string
          org_id: string
          provider_snapshot: Json
          quote_expires_at: string
          quoted_register_price: number
          quoted_renew_price: number | null
          registrant: Json
          registrar_order_id: string | null
          registrar_purchase_status: string | null
          sld: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_status: string | null
          term_years: number
          tld: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          currency_code: string
          domain_name: string
          error_message?: string | null
          id?: string
          org_id: string
          provider_snapshot?: Json
          quote_expires_at: string
          quoted_register_price: number
          quoted_renew_price?: number | null
          registrant?: Json
          registrar_order_id?: string | null
          registrar_purchase_status?: string | null
          sld: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_status?: string | null
          term_years: number
          tld: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          currency_code?: string
          domain_name?: string
          error_message?: string | null
          id?: string
          org_id?: string
          provider_snapshot?: Json
          quote_expires_at?: string
          quoted_register_price?: number
          quoted_renew_price?: number | null
          registrant?: Json
          registrar_order_id?: string | null
          registrar_purchase_status?: string | null
          sld?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_status?: string | null
          term_years?: number
          tld?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_orders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      env_group_links: {
        Row: {
          env_group_id: string
          id: string
          service_id: string
        }
        Insert: {
          env_group_id: string
          id?: string
          service_id: string
        }
        Update: {
          env_group_id?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "env_group_links_env_group_id_fkey"
            columns: ["env_group_id"]
            isOneToOne: false
            referencedRelation: "env_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "env_group_links_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      env_group_vars: {
        Row: {
          env_group_id: string
          id: string
          is_secret_file: boolean
          key: string
          value: string
        }
        Insert: {
          env_group_id: string
          id?: string
          is_secret_file?: boolean
          key: string
          value: string
        }
        Update: {
          env_group_id?: string
          id?: string
          is_secret_file?: boolean
          key?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "env_group_vars_env_group_id_fkey"
            columns: ["env_group_id"]
            isOneToOne: false
            referencedRelation: "env_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      env_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
          render_env_group_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
          render_env_group_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          render_env_group_id?: string | null
        }
        Relationships: []
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
      github_connections: {
        Row: {
          access_token: string
          avatar_url: string | null
          created_at: string
          github_user_id: string
          id: string
          scopes: string[] | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          access_token: string
          avatar_url?: string | null
          created_at?: string
          github_user_id: string
          id?: string
          scopes?: string[] | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          access_token?: string
          avatar_url?: string | null
          created_at?: string
          github_user_id?: string
          id?: string
          scopes?: string[] | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      header_rules: {
        Row: {
          id: string
          name: string
          path: string
          priority: number
          render_rule_id: string | null
          service_id: string
          value: string
        }
        Insert: {
          id?: string
          name: string
          path?: string
          priority?: number
          render_rule_id?: string | null
          service_id: string
          value: string
        }
        Update: {
          id?: string
          name?: string
          path?: string
          priority?: number
          render_rule_id?: string | null
          service_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "header_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
      key_value_instances: {
        Row: {
          created_at: string
          environment_id: string | null
          id: string
          ip_allow_list: Json
          maxmemory_policy: string | null
          name: string
          org_id: string
          persistence: string | null
          plan: string | null
          project_id: string | null
          region: string | null
          render_kv_id: string | null
          status: string | null
          suspended: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          environment_id?: string | null
          id?: string
          ip_allow_list?: Json
          maxmemory_policy?: string | null
          name: string
          org_id: string
          persistence?: string | null
          plan?: string | null
          project_id?: string | null
          region?: string | null
          render_kv_id?: string | null
          status?: string | null
          suspended?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          environment_id?: string | null
          id?: string
          ip_allow_list?: Json
          maxmemory_policy?: string | null
          name?: string
          org_id?: string
          persistence?: string | null
          plan?: string | null
          project_id?: string | null
          region?: string | null
          render_kv_id?: string | null
          status?: string | null
          suspended?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_value_instances_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "render_environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_value_instances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "render_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      log_streams: {
        Row: {
          created_at: string
          enabled: boolean
          endpoint: string
          id: string
          org_id: string
          token: string | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          endpoint: string
          id?: string
          org_id: string
          token?: string | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          endpoint?: string
          id?: string
          org_id?: string
          token?: string | null
        }
        Relationships: []
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
      metrics_streams: {
        Row: {
          created_at: string
          enabled: boolean
          endpoint: string
          id: string
          org_id: string
          token: string | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          endpoint: string
          id?: string
          org_id: string
          token?: string | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          endpoint?: string
          id?: string
          org_id?: string
          token?: string | null
        }
        Relationships: []
      }
      notification_overrides: {
        Row: {
          event_type: string
          id: string
          notify_via: Json
          service_id: string
        }
        Insert: {
          event_type: string
          id?: string
          notify_via?: Json
          service_id: string
        }
        Update: {
          event_type?: string
          id?: string
          notify_via?: Json
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_overrides_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
      plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          features: Json
          id: string
          name: string
          popular: boolean | null
          price_cents: number
          sort_order: number | null
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id: string
          name: string
          popular?: boolean | null
          price_cents?: number
          sort_order?: number | null
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          name?: string
          popular?: boolean | null
          price_cents?: number
          sort_order?: number | null
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      postgres_exports: {
        Row: {
          created_at: string
          download_url: string | null
          expires_at: string | null
          id: string
          instance_id: string
          status: string
        }
        Insert: {
          created_at?: string
          download_url?: string | null
          expires_at?: string | null
          id?: string
          instance_id: string
          status?: string
        }
        Update: {
          created_at?: string
          download_url?: string | null
          expires_at?: string | null
          id?: string
          instance_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "postgres_exports_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "postgres_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      postgres_instances: {
        Row: {
          created_at: string
          database_name: string | null
          environment_id: string | null
          ha_enabled: boolean
          id: string
          ip_allow_list: Json
          name: string
          org_id: string
          pitr_enabled: boolean
          plan: string | null
          project_id: string | null
          region: string | null
          render_postgres_id: string | null
          status: string | null
          suspended: boolean
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          database_name?: string | null
          environment_id?: string | null
          ha_enabled?: boolean
          id?: string
          ip_allow_list?: Json
          name: string
          org_id: string
          pitr_enabled?: boolean
          plan?: string | null
          project_id?: string | null
          region?: string | null
          render_postgres_id?: string | null
          status?: string | null
          suspended?: boolean
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          database_name?: string | null
          environment_id?: string | null
          ha_enabled?: boolean
          id?: string
          ip_allow_list?: Json
          name?: string
          org_id?: string
          pitr_enabled?: boolean
          plan?: string | null
          project_id?: string | null
          region?: string | null
          render_postgres_id?: string | null
          status?: string | null
          suspended?: boolean
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "postgres_instances_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "render_environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postgres_instances_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "render_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      postgres_recoveries: {
        Row: {
          created_at: string
          id: string
          instance_id: string
          status: string
          target_time: string
        }
        Insert: {
          created_at?: string
          id?: string
          instance_id: string
          status?: string
          target_time: string
        }
        Update: {
          created_at?: string
          id?: string
          instance_id?: string
          status?: string
          target_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "postgres_recoveries_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "postgres_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      postgres_users: {
        Row: {
          created_at: string
          id: string
          instance_id: string
          is_default: boolean
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          instance_id: string
          is_default?: boolean
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          instance_id?: string
          is_default?: boolean
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "postgres_users_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "postgres_instances"
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
      registry_credentials: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
          registry: string
          render_credential_id: string | null
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
          registry: string
          render_credential_id?: string | null
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          registry?: string
          render_credential_id?: string | null
          username?: string
        }
        Relationships: []
      }
      render_audit_log: {
        Row: {
          action: string | null
          actor: string | null
          details: Json
          id: string
          occurred_at: string
          org_id: string
          render_event_id: string | null
          resource: string | null
        }
        Insert: {
          action?: string | null
          actor?: string | null
          details?: Json
          id?: string
          occurred_at?: string
          org_id: string
          render_event_id?: string | null
          resource?: string | null
        }
        Update: {
          action?: string | null
          actor?: string | null
          details?: Json
          id?: string
          occurred_at?: string
          org_id?: string
          render_event_id?: string | null
          resource?: string | null
        }
        Relationships: []
      }
      render_environments: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          protected: boolean
          render_environment_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          protected?: boolean
          render_environment_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          protected?: boolean
          render_environment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "render_environments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "render_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      render_projects: {
        Row: {
          created_at: string
          id: string
          name: string
          org_id: string
          render_project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
          render_project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          render_project_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      route_rules: {
        Row: {
          destination: string
          id: string
          priority: number
          render_rule_id: string | null
          service_id: string
          source: string
          type: string
        }
        Insert: {
          destination: string
          id?: string
          priority?: number
          render_rule_id?: string | null
          service_id: string
          source: string
          type: string
        }
        Update: {
          destination?: string
          id?: string
          priority?: number
          render_rule_id?: string | null
          service_id?: string
          source?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_cron_runs: {
        Row: {
          finished_at: string | null
          id: string
          service_id: string
          started_at: string
          status: string
        }
        Insert: {
          finished_at?: string | null
          id?: string
          service_id: string
          started_at?: string
          status?: string
        }
        Update: {
          finished_at?: string | null
          id?: string
          service_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_cron_runs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_deploys: {
        Row: {
          commit_msg: string | null
          commit_sha: string | null
          created_at: string
          finished_at: string | null
          id: string
          image_sha: string | null
          render_deploy_id: string | null
          service_id: string
          status: string
          trigger: string | null
        }
        Insert: {
          commit_msg?: string | null
          commit_sha?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          image_sha?: string | null
          render_deploy_id?: string | null
          service_id: string
          status?: string
          trigger?: string | null
        }
        Update: {
          commit_msg?: string | null
          commit_sha?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          image_sha?: string | null
          render_deploy_id?: string | null
          service_id?: string
          status?: string
          trigger?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_deploys_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_disks: {
        Row: {
          created_at: string
          id: string
          mount_path: string
          name: string
          render_disk_id: string | null
          service_id: string
          size_gb: number
        }
        Insert: {
          created_at?: string
          id?: string
          mount_path: string
          name: string
          render_disk_id?: string | null
          service_id: string
          size_gb: number
        }
        Update: {
          created_at?: string
          id?: string
          mount_path?: string
          name?: string
          render_disk_id?: string | null
          service_id?: string
          size_gb?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_disks_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_env_vars: {
        Row: {
          generate_value: boolean
          id: string
          is_secret_file: boolean
          key: string
          service_id: string
          updated_at: string
          value: string
        }
        Insert: {
          generate_value?: boolean
          id?: string
          is_secret_file?: boolean
          key: string
          service_id: string
          updated_at?: string
          value: string
        }
        Update: {
          generate_value?: boolean
          id?: string
          is_secret_file?: boolean
          key?: string
          service_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_env_vars_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_events: {
        Row: {
          details: Json
          id: string
          occurred_at: string
          render_event_id: string | null
          service_id: string
          type: string
        }
        Insert: {
          details?: Json
          id?: string
          occurred_at?: string
          render_event_id?: string | null
          service_id: string
          type: string
        }
        Update: {
          details?: Json
          id?: string
          occurred_at?: string
          render_event_id?: string | null
          service_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_events_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_jobs: {
        Row: {
          created_at: string
          finished_at: string | null
          id: string
          plan_id: string | null
          render_job_id: string | null
          service_id: string
          start_command: string
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          id?: string
          plan_id?: string | null
          render_job_id?: string | null
          service_id: string
          start_command: string
          started_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          id?: string
          plan_id?: string | null
          render_job_id?: string | null
          service_id?: string
          start_command?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_jobs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          auto_deploy: boolean
          branch: string | null
          build_command: string | null
          created_at: string
          environment_id: string | null
          health_check_path: string | null
          id: string
          image_url: string | null
          is_favorite: boolean
          last_deploy_at: string | null
          metadata: Json
          name: string
          org_id: string
          plan: string | null
          prod_url: string | null
          project_id: string | null
          region: string | null
          registry_credential_id: string | null
          render_service_id: string | null
          repo: string | null
          root_dir: string | null
          runtime: string | null
          schedule_cron: string | null
          start_command: string | null
          status: string | null
          suspended: boolean
          type: string
          updated_at: string
        }
        Insert: {
          auto_deploy?: boolean
          branch?: string | null
          build_command?: string | null
          created_at?: string
          environment_id?: string | null
          health_check_path?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean
          last_deploy_at?: string | null
          metadata?: Json
          name: string
          org_id: string
          plan?: string | null
          prod_url?: string | null
          project_id?: string | null
          region?: string | null
          registry_credential_id?: string | null
          render_service_id?: string | null
          repo?: string | null
          root_dir?: string | null
          runtime?: string | null
          schedule_cron?: string | null
          start_command?: string | null
          status?: string | null
          suspended?: boolean
          type: string
          updated_at?: string
        }
        Update: {
          auto_deploy?: boolean
          branch?: string | null
          build_command?: string | null
          created_at?: string
          environment_id?: string | null
          health_check_path?: string | null
          id?: string
          image_url?: string | null
          is_favorite?: boolean
          last_deploy_at?: string | null
          metadata?: Json
          name?: string
          org_id?: string
          plan?: string | null
          prod_url?: string | null
          project_id?: string | null
          region?: string | null
          registry_credential_id?: string | null
          render_service_id?: string | null
          repo?: string | null
          root_dir?: string | null
          runtime?: string | null
          schedule_cron?: string | null
          start_command?: string | null
          status?: string | null
          suspended?: boolean
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "render_environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "render_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_registry_credential_id_fkey"
            columns: ["registry_credential_id"]
            isOneToOne: false
            referencedRelation: "registry_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      site_uploads: {
        Row: {
          created_at: string
          deployment_id: string | null
          id: string
          manifest: Json
          site_id: string
          total_bytes: number
        }
        Insert: {
          created_at?: string
          deployment_id?: string | null
          id?: string
          manifest?: Json
          site_id: string
          total_bytes?: number
        }
        Update: {
          created_at?: string
          deployment_id?: string | null
          id?: string
          manifest?: Json
          site_id?: string
          total_bytes?: number
        }
        Relationships: [
          {
            foreignKeyName: "site_uploads_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "deployments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_uploads_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
      webhooks_render: {
        Row: {
          created_at: string
          endpoint: string
          events: Json
          id: string
          org_id: string
          render_webhook_id: string | null
          signing_secret: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          events?: Json
          id?: string
          org_id: string
          render_webhook_id?: string | null
          signing_secret?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          events?: Json
          id?: string
          org_id?: string
          render_webhook_id?: string | null
          signing_secret?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_org: { Args: { _user: string }; Returns: string }
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
