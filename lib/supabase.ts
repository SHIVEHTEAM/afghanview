import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  owner_email: string;
  package_type: "starter" | "professional" | "unlimited";
  slide_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Slide {
  id: string;
  restaurant_id: string;
  type: "image" | "menu" | "promo" | "quote" | "hours";
  title: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  duration: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  created_at: string;
}

// Database functions
export const db = {
  // Restaurant functions
  async getRestaurants() {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Restaurant[];
  },

  async getRestaurant(id: string) {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Restaurant;
  },

  async createRestaurant(
    restaurant: Omit<Restaurant, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("restaurants")
      .insert([restaurant])
      .select()
      .single();

    if (error) throw error;
    return data as Restaurant;
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>) {
    const { data, error } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Restaurant;
  },

  async deleteRestaurant(id: string) {
    const { error } = await supabase.from("restaurants").delete().eq("id", id);

    if (error) throw error;
  },

  // Slide functions
  async getSlides(restaurantId: string) {
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data as Slide[];
  },

  async createSlide(slide: Omit<Slide, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("slides")
      .insert([slide])
      .select()
      .single();

    if (error) throw error;
    return data as Slide;
  },

  async updateSlide(id: string, updates: Partial<Slide>) {
    const { data, error } = await supabase
      .from("slides")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Slide;
  },

  async deleteSlide(id: string) {
    const { error } = await supabase.from("slides").delete().eq("id", id);

    if (error) throw error;
  },

  // Admin functions
  async getAdmins() {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Admin[];
  },

  async getAdminByEmail(email: string) {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    return data as Admin;
  },
};
