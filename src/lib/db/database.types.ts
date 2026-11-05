
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "attendance": {
                  Row: {
                    "created_at": string,"entry_id": string,"festival_id": string,"id": string,"marked_at": string,"marked_by": string | null,"status": Database["public"]['Enums']["attendance_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"entry_id": string,"festival_id": string,"id"?: string,"marked_at"?: string,"marked_by"?: string | null,"status": Database["public"]['Enums']["attendance_status"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"entry_id"?: string,"festival_id"?: string,"id"?: string,"marked_at"?: string,"marked_by"?: string | null,"status"?: Database["public"]['Enums']["attendance_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attendance_entry_id_festival_id_fkey"
      columns: ["entry_id","festival_id"]
isOneToOne: false
      referencedRelation: "entries"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "attendance_entry_id_festival_id_fkey"
      columns: ["entry_id","festival_id"]
isOneToOne: false
      referencedRelation: "steward_competitors"
      referencedColumns: ["entry_id","festival_id"]
    },{
      foreignKeyName: "attendance_marked_by_fkey"
      columns: ["marked_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"actor_profile_id": string | null,"created_at": string,"entity_id": string | null,"entity_type": string,"festival_id": string | null,"id": string,"metadata": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_profile_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type": string,"festival_id"?: string | null,"id"?: string,"metadata"?: NonNullable<Json>
                  }
                  Update: {
                    "action"?: string,"actor_profile_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string,"festival_id"?: string | null,"id"?: string,"metadata"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_actor_profile_id_fkey"
      columns: ["actor_profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "audit_log_festival_id_fkey"
      columns: ["festival_id"]
isOneToOne: false
      referencedRelation: "festivals"
      referencedColumns: ["id"]
    }
                  ]
                },"classes": {
                  Row: {
                    "accompanist": Database["public"]['Enums']["accompanist_requirement"],"age_max": number | null,"age_min": number | null,"code": string,"created_at": string,"description": string | null,"discipline_id": string,"edition_id": string,"fee_pence": number,"festival_id": string,"id": string,"is_group": boolean,"max_entries": number | null,"set_piece_composer": string | null,"set_piece_title": string | null,"status": Database["public"]['Enums']["class_status"],"time_limit_seconds": number | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accompanist"?: Database["public"]['Enums']["accompanist_requirement"],"age_max"?: number | null,"age_min"?: number | null,"code": string,"created_at"?: string,"description"?: string | null,"discipline_id": string,"edition_id": string,"fee_pence": number,"festival_id": string,"id"?: string,"is_group"?: boolean,"max_entries"?: number | null,"set_piece_composer"?: string | null,"set_piece_title"?: string | null,"status"?: Database["public"]['Enums']["class_status"],"time_limit_seconds"?: number | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "accompanist"?: Database["public"]['Enums']["accompanist_requirement"],"age_max"?: number | null,"age_min"?: number | null,"code"?: string,"created_at"?: string,"description"?: string | null,"discipline_id"?: string,"edition_id"?: string,"fee_pence"?: number,"festival_id"?: string,"id"?: string,"is_group"?: boolean,"max_entries"?: number | null,"set_piece_composer"?: string | null,"set_piece_title"?: string | null,"status"?: Database["public"]['Enums']["class_status"],"time_limit_seconds"?: number | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "classes_discipline_id_fkey"
      columns: ["discipline_id"]
isOneToOne: false
      referencedRelation: "disciplines"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "classes_edition_id_festival_id_fkey"
      columns: ["edition_id","festival_id"]
isOneToOne: false
      referencedRelation: "festival_editions"
      referencedColumns: ["id","festival_id"]
    }
                  ]
                },"competitor_edition_consents": {
                  Row: {
                    "competitor_id": string,"edition_id": string,"festival_id": string,"given_at": string,"given_by": string | null,"id": string,"media_consent": string,"results_name_consent": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "competitor_id": string,"edition_id": string,"festival_id": string,"given_at"?: string,"given_by"?: string | null,"id"?: string,"media_consent": string,"results_name_consent"?: boolean
                  }
                  Update: {
                    "competitor_id"?: string,"edition_id"?: string,"festival_id"?: string,"given_at"?: string,"given_by"?: string | null,"id"?: string,"media_consent"?: string,"results_name_consent"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "competitor_edition_consents_competitor_id_fkey"
      columns: ["competitor_id"]
isOneToOne: false
      referencedRelation: "competitors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "competitor_edition_consents_competitor_id_fkey"
      columns: ["competitor_id"]
isOneToOne: false
      referencedRelation: "steward_competitors"
      referencedColumns: ["competitor_id"]
    },{
      foreignKeyName: "competitor_edition_consents_edition_id_festival_id_fkey"
      columns: ["edition_id","festival_id"]
isOneToOne: false
      referencedRelation: "festival_editions"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "competitor_edition_consents_given_by_fkey"
      columns: ["given_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"competitors": {
                  Row: {
                    "created_at": string,"date_of_birth": string,"first_name": string,"id": string,"last_name": string,"owner_profile_id": string,"results_name_consent": boolean,"teacher_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"date_of_birth": string,"first_name": string,"id"?: string,"last_name": string,"owner_profile_id": string,"results_name_consent"?: boolean,"teacher_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"date_of_birth"?: string,"first_name"?: string,"id"?: string,"last_name"?: string,"owner_profile_id"?: string,"results_name_consent"?: boolean,"teacher_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "competitors_owner_profile_id_fkey"
      columns: ["owner_profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "competitors_teacher_id_fkey"
      columns: ["teacher_id"]
isOneToOne: false
      referencedRelation: "teachers"
      referencedColumns: ["id"]
    }
                  ]
                },"disciplines": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"documents": {
                  Row: {
                    "class_id": string | null,"created_at": string,"edition_id": string,"festival_id": string,"generated_at": string,"generated_by": string | null,"id": string,"storage_path": string,"type": Database["public"]['Enums']["document_type"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "class_id"?: string | null,"created_at"?: string,"edition_id": string,"festival_id": string,"generated_at"?: string,"generated_by"?: string | null,"id"?: string,"storage_path": string,"type": Database["public"]['Enums']["document_type"],"updated_at"?: string
                  }
                  Update: {
                    "class_id"?: string | null,"created_at"?: string,"edition_id"?: string,"festival_id"?: string,"generated_at"?: string,"generated_by"?: string | null,"id"?: string,"storage_path"?: string,"type"?: Database["public"]['Enums']["document_type"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "documents_class_id_festival_id_fkey"
      columns: ["class_id","festival_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "documents_edition_id_festival_id_fkey"
      columns: ["edition_id","festival_id"]
isOneToOne: false
      referencedRelation: "festival_editions"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "documents_generated_by_fkey"
      columns: ["generated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"entries": {
                  Row: {
                    "accompanist_choice": string | null,"class_id": string,"competitor_id": string,"created_at": string,"created_by": string,"festival_id": string,"id": string,"payer": Database["public"]['Enums']["entry_payer"],"piece_composer": string | null,"piece_title": string | null,"running_order_position": number | null,"scheduled_time": string | null,"status": Database["public"]['Enums']["entry_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accompanist_choice"?: string | null,"class_id": string,"competitor_id": string,"created_at"?: string,"created_by": string,"festival_id": string,"id"?: string,"payer"?: Database["public"]['Enums']["entry_payer"],"piece_composer"?: string | null,"piece_title"?: string | null,"running_order_position"?: number | null,"scheduled_time"?: string | null,"status"?: Database["public"]['Enums']["entry_status"],"updated_at"?: string
                  }
                  Update: {
                    "accompanist_choice"?: string | null,"class_id"?: string,"competitor_id"?: string,"created_at"?: string,"created_by"?: string,"festival_id"?: string,"id"?: string,"payer"?: Database["public"]['Enums']["entry_payer"],"piece_composer"?: string | null,"piece_title"?: string | null,"running_order_position"?: number | null,"scheduled_time"?: string | null,"status"?: Database["public"]['Enums']["entry_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "entries_class_id_festival_id_fkey"
      columns: ["class_id","festival_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "entries_competitor_id_fkey"
      columns: ["competitor_id"]
isOneToOne: false
      referencedRelation: "competitors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "entries_competitor_id_fkey"
      columns: ["competitor_id"]
isOneToOne: false
      referencedRelation: "steward_competitors"
      referencedColumns: ["competitor_id"]
    },{
      foreignKeyName: "entries_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"festival_editions": {
                  Row: {
                    "age_cutoff_date": string,"created_at": string,"ends_on": string | null,"entries_close_at": string | null,"entries_open_at": string | null,"festival_id": string,"id": string,"starts_on": string | null,"status": Database["public"]['Enums']["edition_status"],"timezone": string,"title": string,"updated_at": string,"year": number
                  }
                  ComputedFields: never
                  Insert: {
                    "age_cutoff_date": string,"created_at"?: string,"ends_on"?: string | null,"entries_close_at"?: string | null,"entries_open_at"?: string | null,"festival_id": string,"id"?: string,"starts_on"?: string | null,"status"?: Database["public"]['Enums']["edition_status"],"timezone"?: string,"title": string,"updated_at"?: string,"year": number
                  }
                  Update: {
                    "age_cutoff_date"?: string,"created_at"?: string,"ends_on"?: string | null,"entries_close_at"?: string | null,"entries_open_at"?: string | null,"festival_id"?: string,"id"?: string,"starts_on"?: string | null,"status"?: Database["public"]['Enums']["edition_status"],"timezone"?: string,"title"?: string,"updated_at"?: string,"year"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "festival_editions_festival_id_fkey"
      columns: ["festival_id"]
isOneToOne: false
      referencedRelation: "festivals"
      referencedColumns: ["id"]
    }
                  ]
                },"festival_integrations": {
                  Row: {
                    "created_at": string,"festival_id": string,"stripe_connect_account_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"festival_id": string,"stripe_connect_account_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"festival_id"?: string,"stripe_connect_account_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "festival_integrations_festival_id_fkey"
      columns: ["festival_id"]
isOneToOne: true
      referencedRelation: "festivals"
      referencedColumns: ["id"]
    }
                  ]
                },"festival_members": {
                  Row: {
                    "created_at": string,"festival_id": string,"id": string,"profile_id": string,"role": Database["public"]['Enums']["member_role"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"festival_id": string,"id"?: string,"profile_id": string,"role": Database["public"]['Enums']["member_role"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"festival_id"?: string,"id"?: string,"profile_id"?: string,"role"?: Database["public"]['Enums']["member_role"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "festival_members_festival_id_fkey"
      columns: ["festival_id"]
isOneToOne: false
      referencedRelation: "festivals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "festival_members_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"festivals": {
                  Row: {
                    "contact_email": string | null,"created_at": string,"id": string,"logo_path": string | null,"name": string,"photo_policy": string | null,"slug": string,"theme": NonNullable<Json>,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "contact_email"?: string | null,"created_at"?: string,"id"?: string,"logo_path"?: string | null,"name": string,"photo_policy"?: string | null,"slug": string,"theme"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "contact_email"?: string | null,"created_at"?: string,"id"?: string,"logo_path"?: string | null,"name"?: string,"photo_policy"?: string | null,"slug"?: string,"theme"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"order_items": {
                  Row: {
                    "amount_pence": number,"created_at": string,"entry_id": string,"id": string,"order_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_pence": number,"created_at"?: string,"entry_id": string,"id"?: string,"order_id": string,"updated_at"?: string
                  }
                  Update: {
                    "amount_pence"?: number,"created_at"?: string,"entry_id"?: string,"id"?: string,"order_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_entry_id_fkey"
      columns: ["entry_id"]
isOneToOne: false
      referencedRelation: "entries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_entry_id_fkey"
      columns: ["entry_id"]
isOneToOne: false
      referencedRelation: "steward_competitors"
      referencedColumns: ["entry_id"]
    },{
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "created_at": string,"edition_id": string,"festival_id": string,"id": string,"profile_id": string,"reference": string,"status": Database["public"]['Enums']["order_status"],"stripe_checkout_session_id": string | null,"stripe_payment_intent_id": string | null,"total_pence": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"edition_id": string,"festival_id": string,"id"?: string,"profile_id": string,"reference": string,"status"?: Database["public"]['Enums']["order_status"],"stripe_checkout_session_id"?: string | null,"stripe_payment_intent_id"?: string | null,"total_pence"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"edition_id"?: string,"festival_id"?: string,"id"?: string,"profile_id"?: string,"reference"?: string,"status"?: Database["public"]['Enums']["order_status"],"stripe_checkout_session_id"?: string | null,"stripe_payment_intent_id"?: string | null,"total_pence"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_edition_id_festival_id_fkey"
      columns: ["edition_id","festival_id"]
isOneToOne: false
      referencedRelation: "festival_editions"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "orders_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"payment_links": {
                  Row: {
                    "created_at": string,"created_by": string,"edition_id": string,"entry_ids": (string)[],"expires_at": string,"festival_id": string,"id": string,"order_id": string | null,"recipient_email": string,"status": Database["public"]['Enums']["payment_link_status"],"token_hash": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by": string,"edition_id": string,"entry_ids": (string)[],"expires_at": string,"festival_id": string,"id"?: string,"order_id"?: string | null,"recipient_email": string,"status"?: Database["public"]['Enums']["payment_link_status"],"token_hash": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string,"edition_id"?: string,"entry_ids"?: (string)[],"expires_at"?: string,"festival_id"?: string,"id"?: string,"order_id"?: string | null,"recipient_email"?: string,"status"?: Database["public"]['Enums']["payment_link_status"],"token_hash"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payment_links_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payment_links_edition_id_festival_id_fkey"
      columns: ["edition_id","festival_id"]
isOneToOne: false
      referencedRelation: "festival_editions"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "payment_links_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"email": string,"full_name": string | null,"id": string,"phone": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"full_name"?: string | null,"id": string,"phone"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"full_name"?: string | null,"id"?: string,"phone"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"results": {
                  Row: {
                    "approved_by": string | null,"award": string | null,"created_at": string,"entry_id": string,"festival_id": string,"id": string,"mark": number | null,"place": number | null,"published_at": string | null,"status": Database["public"]['Enums']["result_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "approved_by"?: string | null,"award"?: string | null,"created_at"?: string,"entry_id": string,"festival_id": string,"id"?: string,"mark"?: number | null,"place"?: number | null,"published_at"?: string | null,"status"?: Database["public"]['Enums']["result_status"],"updated_at"?: string
                  }
                  Update: {
                    "approved_by"?: string | null,"award"?: string | null,"created_at"?: string,"entry_id"?: string,"festival_id"?: string,"id"?: string,"mark"?: number | null,"place"?: number | null,"published_at"?: string | null,"status"?: Database["public"]['Enums']["result_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "results_approved_by_fkey"
      columns: ["approved_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "results_entry_id_festival_id_fkey"
      columns: ["entry_id","festival_id"]
isOneToOne: false
      referencedRelation: "entries"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "results_entry_id_festival_id_fkey"
      columns: ["entry_id","festival_id"]
isOneToOne: false
      referencedRelation: "steward_competitors"
      referencedColumns: ["entry_id","festival_id"]
    }
                  ]
                },"rooms": {
                  Row: {
                    "created_at": string,"festival_id": string,"id": string,"name": string,"updated_at": string,"venue_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"festival_id": string,"id"?: string,"name": string,"updated_at"?: string,"venue_id": string
                  }
                  Update: {
                    "created_at"?: string,"festival_id"?: string,"id"?: string,"name"?: string,"updated_at"?: string,"venue_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rooms_venue_id_festival_id_fkey"
      columns: ["venue_id","festival_id"]
isOneToOne: false
      referencedRelation: "venues"
      referencedColumns: ["id","festival_id"]
    }
                  ]
                },"scheduled_classes": {
                  Row: {
                    "adjudicator": string | null,"class_id": string,"created_at": string,"festival_id": string,"id": string,"session_id": string,"starts_at": string,"steward_profile_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "adjudicator"?: string | null,"class_id": string,"created_at"?: string,"festival_id": string,"id"?: string,"session_id": string,"starts_at": string,"steward_profile_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "adjudicator"?: string | null,"class_id"?: string,"created_at"?: string,"festival_id"?: string,"id"?: string,"session_id"?: string,"starts_at"?: string,"steward_profile_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "scheduled_classes_class_id_festival_id_fkey"
      columns: ["class_id","festival_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "scheduled_classes_session_id_festival_id_fkey"
      columns: ["session_id","festival_id"]
isOneToOne: false
      referencedRelation: "sessions"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "scheduled_classes_steward_profile_id_fkey"
      columns: ["steward_profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"sessions": {
                  Row: {
                    "created_at": string,"edition_id": string,"ends_at": string,"festival_id": string,"id": string,"room_id": string,"starts_at": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"edition_id": string,"ends_at": string,"festival_id": string,"id"?: string,"room_id": string,"starts_at": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"edition_id"?: string,"ends_at"?: string,"festival_id"?: string,"id"?: string,"room_id"?: string,"starts_at"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sessions_edition_id_festival_id_fkey"
      columns: ["edition_id","festival_id"]
isOneToOne: false
      referencedRelation: "festival_editions"
      referencedColumns: ["id","festival_id"]
    },{
      foreignKeyName: "sessions_room_id_festival_id_fkey"
      columns: ["room_id","festival_id"]
isOneToOne: false
      referencedRelation: "rooms"
      referencedColumns: ["id","festival_id"]
    }
                  ]
                },"stripe_events": {
                  Row: {
                    "id": string,"received_at": string,"type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id": string,"received_at"?: string,"type": string
                  }
                  Update: {
                    "id"?: string,"received_at"?: string,"type"?: string
                  }
                  Relationships: [
                    
                  ]
                },"teachers": {
                  Row: {
                    "created_at": string,"created_by": string,"display_name": string,"email": string | null,"id": string,"profile_id": string | null,"studio": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by": string,"display_name": string,"email"?: string | null,"id"?: string,"profile_id"?: string | null,"studio"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string,"display_name"?: string,"email"?: string | null,"id"?: string,"profile_id"?: string | null,"studio"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "teachers_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "teachers_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"venues": {
                  Row: {
                    "created_at": string,"edition_id": string,"festival_id": string,"id": string,"name": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"edition_id": string,"festival_id": string,"id"?: string,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"edition_id"?: string,"festival_id"?: string,"id"?: string,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "venues_edition_id_festival_id_fkey"
      columns: ["edition_id","festival_id"]
isOneToOne: false
      referencedRelation: "festival_editions"
      referencedColumns: ["id","festival_id"]
    }
                  ]
                }
          }
          Views: {
            "steward_competitors": {
                  Row: {
                    "class_id": string,"competitor_id": string,"entry_id": string,"festival_id": string,"first_name": string,"last_name": string,"running_order_position": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "entries_class_id_festival_id_fkey"
      columns: ["class_id","festival_id"]
isOneToOne: false
      referencedRelation: "classes"
      referencedColumns: ["id","festival_id"]
    }
                  ]
                }
          }
          Functions: {
            "age_on":
{ Args: { "cutoff": string,"dob": string }; Returns: number
                           },
"has_festival_role":
{ Args: { "p_festival_id": string,"p_roles": (Database["public"]['Enums']["member_role"])[] }; Returns: boolean
                           },
"is_festival_member":
{ Args: { "p_festival_id": string }; Returns: boolean
                           }
          }
          Enums: {
            "accompanist_requirement": "not_required"|"optional"|"required","attendance_status": "present"|"absent"|"withdrawn_on_day","class_status": "draft"|"published"|"closed"|"cancelled","document_type": "running_order"|"mark_sheet"|"steward_sheet"|"certificate"|"timetable"|"receipt","edition_status": "draft"|"entries_open"|"entries_closed"|"scheduling"|"timetable_published"|"running"|"complete","entry_payer": "account_holder"|"parent_link","entry_status": "basket"|"pending_payment"|"confirmed"|"withdrawn"|"refunded","member_role": "owner"|"secretary"|"steward"|"adjudicator"|"viewer","order_status": "open"|"pending"|"paid"|"failed"|"refunded","payment_link_status": "active"|"used"|"expired"|"cancelled","result_status": "draft"|"approved"|"published"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "accompanist_requirement": ["not_required", "optional", "required"],"attendance_status": ["present", "absent", "withdrawn_on_day"],"class_status": ["draft", "published", "closed", "cancelled"],"document_type": ["running_order", "mark_sheet", "steward_sheet", "certificate", "timetable", "receipt"],"edition_status": ["draft", "entries_open", "entries_closed", "scheduling", "timetable_published", "running", "complete"],"entry_payer": ["account_holder", "parent_link"],"entry_status": ["basket", "pending_payment", "confirmed", "withdrawn", "refunded"],"member_role": ["owner", "secretary", "steward", "adjudicator", "viewer"],"order_status": ["open", "pending", "paid", "failed", "refunded"],"payment_link_status": ["active", "used", "expired", "cancelled"],"result_status": ["draft", "approved", "published"]
          }
        }
} as const
