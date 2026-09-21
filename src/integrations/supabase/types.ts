export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
 // Allows to automatically instantiate createClient with right options
 // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
 __InternalSupabase: {
 PostgrestVersion: "14.5";
 };
 public: {
 Tables: {
 blog_categories: {
 Row: {
 created_at: string;
 id: string;
 name: string;
 slug: string;
 };
 Insert: {
 created_at?: string;
 id?: string;
 name: string;
 slug: string;
 };
 Update: {
 created_at?: string;
 id?: string;
 name?: string;
 slug?: string;
 };
 Relationships: [];
 };
 blog_posts: {
 Row: {
 category_id: string | null;
 content: Json;
 created_at: string;
 excerpt: string;
 id: string;
 published_at: string | null;
 seo_description: string;
 seo_title: string;
 slug: string;
 status: string;
 title: string;
 updated_at: string;
 };
 Insert: {
 category_id?: string | null;
 content?: Json;
 created_at?: string;
 excerpt: string;
 id?: string;
 published_at?: string | null;
 seo_description: string;
 seo_title: string;
 slug: string;
 status?: string;
 title: string;
 updated_at?: string;
 };
 Update: {
 category_id?: string | null;
 content?: Json;
 created_at?: string;
 excerpt?: string;
 id?: string;
 published_at?: string | null;
 seo_description?: string;
 seo_title?: string;
 slug?: string;
 status?: string;
 title?: string;
 updated_at?: string;
 };
 Relationships: [
 {
 foreignKeyName: "blog_posts_category_id_fkey";
 columns: ["category_id"];
 isOneToOne: false;
 referencedRelation: "blog_categories";
 referencedColumns: ["id"];
 },
 ];
 };
 contact_submissions: {
 Row: {
 created_at: string;
 email: string;
 id: string;
 message: string;
 name: string;
 subject: string | null;
 };
 Insert: {
 created_at?: string;
 email: string;
 id?: string;
 message: string;
 name: string;
 subject?: string | null;
 };
 Update: {
 created_at?: string;
 email?: string;
 id?: string;
 message?: string;
 name?: string;
 subject?: string | null;
 };
 Relationships: [];
 };
 countries: {
 Row: {
 active: boolean;
 code: string;
 display_order: number;
 id: string;
 name: string;
 };
 Insert: {
 active?: boolean;
 code: string;
 display_order?: number;
 id?: string;
 name: string;
 };
 Update: {
 active?: boolean;
 code?: string;
 display_order?: number;
 id?: string;
 name?: string;
 };
 Relationships: [];
 };
 faqs: {
 Row: {
 answer: string;
 category: string;
 created_at: string;
 display_order: number;
 id: string;
 question: string;
 status: string;
 updated_at: string;
 };
 Insert: {
 answer: string;
 category: string;
 created_at?: string;
 display_order?: number;
 id?: string;
 question: string;
 status?: string;
 updated_at?: string;
 };
 Update: {
 answer?: string;
 category?: string;
 created_at?: string;
 display_order?: number;
 id?: string;
 question?: string;
 status?: string;
 updated_at?: string;
 };
 Relationships: [];
 };
 leads: {
 Row: {
 business_type: string;
 company_name: string | null;
 company_status: string;
 country: string;
 created_at: string;
 email: string;
 full_name: string;
 id: string;
 message: string;
 phone: string | null;
 service_requested: string;
 source: string;
 status: Database["public"]["Enums"]["lead_status"];
 updated_at: string;
 };
 Insert: {
 business_type: string;
 company_name?: string | null;
 company_status: string;
 country: string;
 created_at?: string;
 email: string;
 full_name: string;
 id?: string;
 message: string;
 phone?: string | null;
 service_requested: string;
 source?: string;
 status?: Database["public"]["Enums"]["lead_status"];
 updated_at?: string;
 };
 Update: {
 business_type?: string;
 company_name?: string | null;
 company_status?: string;
 country?: string;
 created_at?: string;
 email?: string;
 full_name?: string;
 id?: string;
 message?: string;
 phone?: string | null;
 service_requested?: string;
 source?: string;
 status?: Database["public"]["Enums"]["lead_status"];
 updated_at?: string;
 };
 Relationships: [];
 };
 profiles: {
 Row: {
 country: string | null;
 created_at: string;
 full_name: string | null;
 id: string;
 phone: string | null;
 updated_at: string;
 };
 Insert: {
 country?: string | null;
 created_at?: string;
 full_name?: string | null;
 id: string;
 phone?: string | null;
 updated_at?: string;
 };
 Update: {
 country?: string | null;
 created_at?: string;
 full_name?: string | null;
 id?: string;
 phone?: string | null;
 updated_at?: string;
 };
 Relationships: [];
 };
 projects: {
 Row: {
 created_at: string;
 customer_id: string;
 id: string;
 progress: number;
 service_id: string | null;
 status: string;
 title: string;
 updated_at: string;
 };
 Insert: {
 created_at?: string;
 customer_id: string;
 id?: string;
 progress?: number;
 service_id?: string | null;
 status?: string;
 title: string;
 updated_at?: string;
 };
 Update: {
 created_at?: string;
 customer_id?: string;
 id?: string;
 progress?: number;
 service_id?: string | null;
 status?: string;
 title?: string;
 updated_at?: string;
 };
 Relationships: [
 {
 foreignKeyName: "projects_service_id_fkey";
 columns: ["service_id"];
 isOneToOne: false;
 referencedRelation: "services";
 referencedColumns: ["id"];
 },
 ];
 };
 service_categories: {
 Row: {
 created_at: string;
 description: string;
 display_order: number;
 id: string;
 name: string;
 slug: string;
 status: string;
 updated_at: string;
 };
 Insert: {
 created_at?: string;
 description?: string;
 display_order?: number;
 id?: string;
 name: string;
 slug: string;
 status?: string;
 updated_at?: string;
 };
 Update: {
 created_at?: string;
 description?: string;
 display_order?: number;
 id?: string;
 name?: string;
 slug?: string;
 status?: string;
 updated_at?: string;
 };
 Relationships: [];
 };
 services: {
 Row: {
 category_id: string;
 created_at: string;
 description: string;
 display_order: number;
 faqs: Json;
 features: Json;
 id: string;
 process: Json;
 related_services: Json;
 requirements: Json;
 seo_description: string;
 seo_title: string;
 short_description: string;
 slug: string;
 status: string;
 title: string;
 updated_at: string;
 };
 Insert: {
 category_id: string;
 created_at?: string;
 description: string;
 display_order?: number;
 faqs?: Json;
 features?: Json;
 id?: string;
 process?: Json;
 related_services?: Json;
 requirements?: Json;
 seo_description: string;
 seo_title: string;
 short_description: string;
 slug: string;
 status?: string;
 title: string;
 updated_at?: string;
 };
 Update: {
 category_id?: string;
 created_at?: string;
 description?: string;
 display_order?: number;
 faqs?: Json;
 features?: Json;
 id?: string;
 process?: Json;
 related_services?: Json;
 requirements?: Json;
 seo_description?: string;
 seo_title?: string;
 short_description?: string;
 slug?: string;
 status?: string;
 title?: string;
 updated_at?: string;
 };
 Relationships: [
 {
 foreignKeyName: "services_category_id_fkey";
 columns: ["category_id"];
 isOneToOne: false;
 referencedRelation: "service_categories";
 referencedColumns: ["id"];
 },
 ];
 };
 site_settings: {
 Row: {
 id: string;
 is_public: boolean;
 key: string;
 updated_at: string;
 value: Json;
 };
 Insert: {
 id?: string;
 is_public?: boolean;
 key: string;
 updated_at?: string;
 value?: Json;
 };
 Update: {
 id?: string;
 is_public?: boolean;
 key?: string;
 updated_at?: string;
 value?: Json;
 };
 Relationships: [];
 };
 user_roles: {
 Row: {
 id: string;
 role: Database["public"]["Enums"]["app_role"];
 user_id: string;
 };
 Insert: {
 id?: string;
 role: Database["public"]["Enums"]["app_role"];
 user_id: string;
 };
 Update: {
 id?: string;
 role?: Database["public"]["Enums"]["app_role"];
 user_id?: string;
 };
 Relationships: [];
 };
 };
 Views: {
 [_ in never]: never;
 };
 Functions: {
 has_role: {
 Args: {
 _role: Database["public"]["Enums"]["app_role"];
 _user_id: string;
 };
 Returns: boolean;
 };
 };
 Enums: {
 app_role: "admin" | "staff" | "customer";
 lead_status:
 "New" | "Contacted" | "In Progress" | "Waiting for Client" | "Completed" | "Closed";
 };
 CompositeTypes: {
 [_ in never]: never;
 };
 };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
 DefaultSchemaTableNameOrOptions extends
 | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
 | { schema: keyof DatabaseWithoutInternals },
 TableName extends (DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals;
 }
 ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
 DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
 : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals;
}
 ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
 DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
 Row: infer R;
 }
 ? R
 : never
 : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
 ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
 Row: infer R;
 }
 ? R
 : never
 : never;

export type TablesInsert<
 DefaultSchemaTableNameOrOptions extends
 keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
 TableName extends (DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals;
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
 : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals;
}
 ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
 Insert: infer I;
 }
 ? I
 : never
 : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
 ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
 Insert: infer I;
 }
 ? I
 : never
 : never;

export type TablesUpdate<
 DefaultSchemaTableNameOrOptions extends
 keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
 TableName extends (DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals;
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
 : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals;
}
 ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
 Update: infer U;
 }
 ? U
 : never
 : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
 ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
 Update: infer U;
 }
 ? U
 : never
 : never;

export type Enums<
 DefaultSchemaEnumNameOrOptions extends
 keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
 EnumName extends (DefaultSchemaEnumNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals;
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
 : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals;
}
 ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
 : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
 ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
 : never;

export type CompositeTypes<
 PublicCompositeTypeNameOrOptions extends
 keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
 CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals;
 }
 ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
 : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals;
}
 ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
 : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
 ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
 : never;

export const Constants = {
 public: {
 Enums: {
 app_role: ["admin", "staff", "customer"],
 lead_status: ["New", "Contacted", "In Progress", "Waiting for Client", "Completed", "Closed"],
 },
 },
} as const;
