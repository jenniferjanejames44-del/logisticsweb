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
      extra_charges: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      heavy_weight_pricing: {
        Row: {
          created_at: string
          id: string
          max_weight: number
          min_weight: number
          price_per_kg: number
          updated_at: string
          zone_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_weight: number
          min_weight: number
          price_per_kg?: number
          updated_at?: string
          zone_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_weight?: number
          min_weight?: number
          price_per_kg?: number
          updated_at?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "heavy_weight_pricing_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
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
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
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
          created_at: string
          description: string | null
          destination_city: string
          destination_country: string
          estimated_delivery: string | null
          height_cm: number | null
          id: string
          length_cm: number | null
          origin_city: string
          origin_country: string
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
          warehouse_location: string | null
          weight: number
          width_cm: number | null
        }
        Insert: {
          actual_delivery?: string | null
          created_at?: string
          description?: string | null
          destination_city: string
          destination_country: string
          estimated_delivery?: string | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          origin_city: string
          origin_country: string
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
          warehouse_location?: string | null
          weight: number
          width_cm?: number | null
        }
        Update: {
          actual_delivery?: string | null
          created_at?: string
          description?: string | null
          destination_city?: string
          destination_country?: string
          estimated_delivery?: string | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          origin_city?: string
          origin_country?: string
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
      tax_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          rate: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          rate?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          rate?: number
          updated_at?: string
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
      weight_pricing: {
        Row: {
          created_at: string
          id: string
          max_weight: number
          min_weight: number
          price: number
          updated_at: string
          zone_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_weight: number
          min_weight: number
          price?: number
          updated_at?: string
          zone_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_weight?: number
          min_weight?: number
          price?: number
          updated_at?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weight_pricing_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_countries: {
        Row: {
          country: string
          created_at: string
          id: string
          zone_id: string
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          zone_id: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_countries_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
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
