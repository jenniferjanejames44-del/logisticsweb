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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      country_pricing_rules: {
        Row: {
          country: string
          created_at: string
          currency: string
          flat_price: number
          flat_weight_threshold_kg: number
          handling_fee: number
          id: string
          insurance_percent: number
          is_active: boolean
          price_per_kg: number
          updated_at: string
          vat_percent: number
        }
        Insert: {
          country: string
          created_at?: string
          currency?: string
          flat_price?: number
          flat_weight_threshold_kg?: number
          handling_fee?: number
          id?: string
          insurance_percent?: number
          is_active?: boolean
          price_per_kg?: number
          updated_at?: string
          vat_percent?: number
        }
        Update: {
          country?: string
          created_at?: string
          currency?: string
          flat_price?: number
          flat_weight_threshold_kg?: number
          handling_fee?: number
          id?: string
          insurance_percent?: number
          is_active?: boolean
          price_per_kg?: number
          updated_at?: string
          vat_percent?: number
        }
        Relationships: []
      }
      delivery_methods: {
        Row: {
          created_at: string
          description: string | null
          fee: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fee?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fee?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_automation_rules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          template_slug: string
          trigger_event: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          template_slug: string
          trigger_event: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          template_slug?: string
          trigger_event?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_campaign_recipients: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          created_at: string
          email: string
          error_message: string | null
          id: string
          opened_at: string | null
          resend_message_id: string | null
          sent_at: string | null
          status: string
          subscriber_id: string | null
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string
          subscriber_id?: string | null
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          resend_message_id?: string | null
          sent_at?: string | null
          status?: string
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_recipients_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "email_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          audience_filter: Json
          banner_url: string | null
          body_html: string | null
          clicked_count: number
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          failed_count: number
          footer_text: string | null
          heading: string | null
          id: string
          name: string
          opened_count: number
          preheader: string | null
          scheduled_at: string | null
          secondary_cta_label: string | null
          secondary_cta_url: string | null
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
          template_id: string | null
          total_recipients: number
          updated_at: string
        }
        Insert: {
          audience_filter?: Json
          banner_url?: string | null
          body_html?: string | null
          clicked_count?: number
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          failed_count?: number
          footer_text?: string | null
          heading?: string | null
          id?: string
          name: string
          opened_count?: number
          preheader?: string | null
          scheduled_at?: string | null
          secondary_cta_label?: string | null
          secondary_cta_url?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject: string
          template_id?: string | null
          total_recipients?: number
          updated_at?: string
        }
        Update: {
          audience_filter?: Json
          banner_url?: string | null
          body_html?: string | null
          clicked_count?: number
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          failed_count?: number
          footer_text?: string | null
          heading?: string | null
          id?: string
          name?: string
          opened_count?: number
          preheader?: string | null
          scheduled_at?: string | null
          secondary_cta_label?: string | null
          secondary_cta_url?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
          template_id?: string | null
          total_recipients?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          account_type: string
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          last_activity_at: string | null
          marketing_opt_in: boolean
          metadata: Json | null
          phone: string | null
          source: string
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_type?: string
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          last_activity_at?: string | null
          marketing_opt_in?: boolean
          metadata?: Json | null
          phone?: string | null
          source?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_type?: string
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          last_activity_at?: string | null
          marketing_opt_in?: boolean
          metadata?: Json | null
          phone?: string | null
          source?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          banner_url: string | null
          body_html: string | null
          body_text: string | null
          category: string
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          footer_text: string | null
          heading: string | null
          id: string
          is_system: boolean
          name: string
          preheader: string | null
          secondary_cta_label: string | null
          secondary_cta_url: string | null
          slug: string
          subject: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          body_html?: string | null
          body_text?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          footer_text?: string | null
          heading?: string | null
          id?: string
          is_system?: boolean
          name: string
          preheader?: string | null
          secondary_cta_label?: string | null
          secondary_cta_url?: string | null
          slug: string
          subject: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          body_html?: string | null
          body_text?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          footer_text?: string | null
          heading?: string | null
          id?: string
          is_system?: boolean
          name?: string
          preheader?: string | null
          secondary_cta_label?: string | null
          secondary_cta_url?: string | null
          slug?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          created_at: string
          from_currency: string
          id: string
          is_active: boolean
          rate: number
          to_currency: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          from_currency: string
          id?: string
          is_active?: boolean
          rate: number
          to_currency: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          from_currency?: string
          id?: string
          is_active?: boolean
          rate?: number
          to_currency?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          additional_charges: number | null
          amount: number
          clearing_rate: number | null
          created_at: string
          currency: string | null
          delivery_rate: number | null
          dimensions: string | null
          due_date: string | null
          id: string
          insurance_charges: number | null
          invoice_number: string
          paid_at: string | null
          payment_channel: string | null
          payment_reference: string | null
          paystack_reference: string | null
          pdf_url: string | null
          pickup_charges: number | null
          shipment_id: string
          shipping_rate: number | null
          status: string
          storage_charges: number | null
          subtotal: number | null
          updated_at: string
          user_id: string
          weight_value: number | null
        }
        Insert: {
          additional_charges?: number | null
          amount?: number
          clearing_rate?: number | null
          created_at?: string
          currency?: string | null
          delivery_rate?: number | null
          dimensions?: string | null
          due_date?: string | null
          id?: string
          insurance_charges?: number | null
          invoice_number: string
          paid_at?: string | null
          payment_channel?: string | null
          payment_reference?: string | null
          paystack_reference?: string | null
          pdf_url?: string | null
          pickup_charges?: number | null
          shipment_id: string
          shipping_rate?: number | null
          status?: string
          storage_charges?: number | null
          subtotal?: number | null
          updated_at?: string
          user_id: string
          weight_value?: number | null
        }
        Update: {
          additional_charges?: number | null
          amount?: number
          clearing_rate?: number | null
          created_at?: string
          currency?: string | null
          delivery_rate?: number | null
          dimensions?: string | null
          due_date?: string | null
          id?: string
          insurance_charges?: number | null
          invoice_number?: string
          paid_at?: string | null
          payment_channel?: string | null
          payment_reference?: string | null
          paystack_reference?: string | null
          pdf_url?: string | null
          pickup_charges?: number | null
          shipment_id?: string
          shipping_rate?: number | null
          status?: string
          storage_charges?: number | null
          subtotal?: number | null
          updated_at?: string
          user_id?: string
          weight_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      login_history: {
        Row: {
          browser: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          location: string | null
          logged_in_at: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          logged_in_at?: string
          user_id: string
        }
        Update: {
          browser?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          logged_in_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          shipment_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          shipment_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          shipment_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging_materials: {
        Row: {
          created_at: string
          description: string | null
          height_cm: number | null
          icon_key: string | null
          id: string
          is_active: boolean
          is_custom: boolean
          length_cm: number | null
          name: string
          price: number
          updated_at: string
          width_cm: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          height_cm?: number | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          is_custom?: boolean
          length_cm?: number | null
          name: string
          price?: number
          updated_at?: string
          width_cm?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          height_cm?: number | null
          icon_key?: string | null
          id?: string
          is_active?: boolean
          is_custom?: boolean
          length_cm?: number | null
          name?: string
          price?: number
          updated_at?: string
          width_cm?: number | null
        }
        Relationships: []
      }
      partner_settings: {
        Row: {
          default_commission_percentage: number
          id: number
          minimum_payout_threshold: number
          updated_at: string
        }
        Insert: {
          default_commission_percentage?: number
          id?: number
          minimum_payout_threshold?: number
          updated_at?: string
        }
        Update: {
          default_commission_percentage?: number
          id?: number
          minimum_payout_threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          address: string | null
          approved_at: string | null
          business_name: string | null
          city: string | null
          commission_percentage: number
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          referral_code: string | null
          referral_plan: string | null
          rejected_at: string | null
          social_link: string | null
          state: string | null
          status: string
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          business_name?: string | null
          city?: string | null
          commission_percentage?: number
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          referral_code?: string | null
          referral_plan?: string | null
          rejected_at?: string | null
          social_link?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          business_name?: string | null
          city?: string | null
          commission_percentage?: number
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          referral_code?: string | null
          referral_plan?: string | null
          rejected_at?: string | null
          social_link?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          payment_method: string | null
          shipment_id: string | null
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          shipment_id?: string | null
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          shipment_id?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_per_kg: number
          service_type: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_per_kg?: number
          service_type: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_per_kg?: number
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          customs_fee: number
          destination_country: string
          estimated_days_max: number | null
          estimated_days_min: number | null
          flat_price: number
          flat_weight_threshold_kg: number
          handling_fee: number
          id: string
          insurance_percent: number
          is_active: boolean
          max_weight_kg: number | null
          min_weight_kg: number | null
          name: string
          notes: string | null
          origin_country: string
          price_per_kg: number
          priority: number
          service_type: string | null
          shipment_type: string
          shipping_method: string
          updated_at: string
          vat_percent: number
          warehouse_country: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customs_fee?: number
          destination_country: string
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          flat_price?: number
          flat_weight_threshold_kg?: number
          handling_fee?: number
          id?: string
          insurance_percent?: number
          is_active?: boolean
          max_weight_kg?: number | null
          min_weight_kg?: number | null
          name: string
          notes?: string | null
          origin_country: string
          price_per_kg?: number
          priority?: number
          service_type?: string | null
          shipment_type: string
          shipping_method: string
          updated_at?: string
          vat_percent?: number
          warehouse_country?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customs_fee?: number
          destination_country?: string
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          flat_price?: number
          flat_weight_threshold_kg?: number
          handling_fee?: number
          id?: string
          insurance_percent?: number
          is_active?: boolean
          max_weight_kg?: number | null
          min_weight_kg?: number | null
          name?: string
          notes?: string | null
          origin_country?: string
          price_per_kg?: number
          priority?: number
          service_type?: string | null
          shipment_type?: string
          shipping_method?: string
          updated_at?: string
          vat_percent?: number
          warehouse_country?: string | null
        }
        Relationships: []
      }
      processing_fees: {
        Row: {
          created_at: string
          fee_type: string
          fee_value: number
          id: string
          max_value: number
          min_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          fee_type?: string
          fee_value?: number
          id?: string
          max_value: number
          min_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          fee_type?: string
          fee_value?: number
          id?: string
          max_value?: number
          min_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          referred_by_partner_id: string | null
          signup_referral_code: string | null
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referred_by_partner_id?: string | null
          signup_referral_code?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referred_by_partner_id?: string | null
          signup_referral_code?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_amount: number
          commission_status: string
          created_at: string
          first_paid_invoice_id: string | null
          first_paid_shipment_id: string | null
          id: string
          is_converted: boolean
          paid_at: string | null
          partner_id: string
          referral_code: string
          referred_user_id: string
          updated_at: string
        }
        Insert: {
          commission_amount?: number
          commission_status?: string
          created_at?: string
          first_paid_invoice_id?: string | null
          first_paid_shipment_id?: string | null
          id?: string
          is_converted?: boolean
          paid_at?: string | null
          partner_id: string
          referral_code: string
          referred_user_id: string
          updated_at?: string
        }
        Update: {
          commission_amount?: number
          commission_status?: string
          created_at?: string
          first_paid_invoice_id?: string | null
          first_paid_shipment_id?: string | null
          id?: string
          is_converted?: boolean
          paid_at?: string | null
          partner_id?: string
          referral_code?: string
          referred_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipment_notifications: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          tracking_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          tracking_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          tracking_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          actual_delivery: string | null
          actual_weight: number | null
          chargeable_weight: number | null
          created_at: string
          description: string | null
          destination_city: string
          destination_country: string
          estimated_delivery: string | null
          height_cm: number | null
          id: string
          items_json: Json | null
          length_cm: number | null
          origin_city: string
          origin_country: string
          package_id: string | null
          package_name: string | null
          package_price: number
          payment_status: string
          pickup_prepaid: boolean
          price: number | null
          receiver_address: string | null
          receiver_alt_phone: string | null
          receiver_name: string | null
          receiver_phone: string | null
          sender_address: string | null
          sender_alt_phone: string | null
          sender_name: string | null
          sender_phone: string | null
          service_type: string
          status: string
          tracking_number: string
          updated_at: string
          user_id: string
          volumetric_divisor: number
          volumetric_weight: number | null
          warehouse_location: string | null
          weight: number
          width_cm: number | null
        }
        Insert: {
          actual_delivery?: string | null
          actual_weight?: number | null
          chargeable_weight?: number | null
          created_at?: string
          description?: string | null
          destination_city: string
          destination_country: string
          estimated_delivery?: string | null
          height_cm?: number | null
          id?: string
          items_json?: Json | null
          length_cm?: number | null
          origin_city: string
          origin_country: string
          package_id?: string | null
          package_name?: string | null
          package_price?: number
          payment_status?: string
          pickup_prepaid?: boolean
          price?: number | null
          receiver_address?: string | null
          receiver_alt_phone?: string | null
          receiver_name?: string | null
          receiver_phone?: string | null
          sender_address?: string | null
          sender_alt_phone?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          service_type: string
          status?: string
          tracking_number: string
          updated_at?: string
          user_id: string
          volumetric_divisor?: number
          volumetric_weight?: number | null
          warehouse_location?: string | null
          weight: number
          width_cm?: number | null
        }
        Update: {
          actual_delivery?: string | null
          actual_weight?: number | null
          chargeable_weight?: number | null
          created_at?: string
          description?: string | null
          destination_city?: string
          destination_country?: string
          estimated_delivery?: string | null
          height_cm?: number | null
          id?: string
          items_json?: Json | null
          length_cm?: number | null
          origin_city?: string
          origin_country?: string
          package_id?: string | null
          package_name?: string | null
          package_price?: number
          payment_status?: string
          pickup_prepaid?: boolean
          price?: number | null
          receiver_address?: string | null
          receiver_alt_phone?: string | null
          receiver_name?: string | null
          receiver_phone?: string | null
          sender_address?: string | null
          sender_alt_phone?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          service_type?: string
          status?: string
          tracking_number?: string
          updated_at?: string
          user_id?: string
          volumetric_divisor?: number
          volumetric_weight?: number | null
          warehouse_location?: string | null
          weight?: number
          width_cm?: number | null
        }
        Relationships: []
      }
      shipping_routes: {
        Row: {
          created_at: string
          destination_country: string
          id: string
          is_active: boolean
          origin_country: string
          price_per_kg: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination_country: string
          id?: string
          is_active?: boolean
          origin_country: string
          price_per_kg?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination_country?: string
          id?: string
          is_active?: boolean
          origin_country?: string
          price_per_kg?: number
          updated_at?: string
        }
        Relationships: []
      }
      shopping_orders: {
        Row: {
          additional_notes: string | null
          created_at: string
          id: string
          item_description: string
          item_value: number
          order_number: string
          payment_status: string
          processing_fee: number
          product_image_url: string | null
          product_link: string | null
          product_name: string
          quantity: number
          status: string
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string
          id?: string
          item_description: string
          item_value: number
          order_number: string
          payment_status?: string
          processing_fee?: number
          product_image_url?: string | null
          product_link?: string | null
          product_name: string
          quantity?: number
          status?: string
          total_cost?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          created_at?: string
          id?: string
          item_description?: string
          item_value?: number
          order_number?: string
          payment_status?: string
          processing_fee?: number
          product_image_url?: string | null
          product_link?: string | null
          product_name?: string
          quantity?: number
          status?: string
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_ticket_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          priority: string
          shipment_id: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          priority?: string
          shipment_id?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          priority?: string
          shipment_id?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string
          city: string | null
          country: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address: string
          city?: string | null
          country: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_balances: {
        Row: {
          balance: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      track_shipment_public: {
        Args: { tracking_num: string }
        Returns: {
          actual_delivery: string
          created_at: string
          destination_city: string
          destination_country: string
          estimated_delivery: string
          origin_city: string
          origin_country: string
          service_type: string
          status: string
          tracking_number: string
          updated_at: string
        }[]
      }
      upsert_email_subscriber: {
        Args: {
          p_account_type: string
          p_country: string
          p_email: string
          p_full_name: string
          p_phone: string
          p_source: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "customer"
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
      app_role: ["admin", "customer"],
    },
  },
} as const
