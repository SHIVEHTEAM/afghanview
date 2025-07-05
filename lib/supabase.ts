import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "your_supabase_project_url" ||
  supabaseAnonKey === "your_supabase_anon_key"
) {
  console.error("❌ Supabase environment variables not configured!");
  console.error(
    "Please update your .env.local file with your actual Supabase credentials:"
  );
  console.error("1. Go to https://supabase.com/dashboard");
  console.error("2. Create a new project or select existing one");
  console.error("3. Go to Settings > API");
  console.error("4. Copy the URL and anon key to your .env.local file");
  console.error("");
  console.error("Example .env.local:");
  console.error("NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key");
  console.error("SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key");
}

// Create Supabase client with fallback for development
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

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

export interface SlideImage {
  id: string;
  slide_id: string;
  image_url: string;
  alt_text?: string;
  width?: number;
  height?: number;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Slide {
  id: string;
  restaurant_id: string;
  template_id?: string;
  name: string;
  type: "image" | "menu" | "promo" | "quote" | "hours" | "custom";
  title: string;
  subtitle?: string;
  content: any; // JSONB field that can contain various data structures
  styling?: any;
  duration: number;
  order_index: number;
  sort_order: number; // For drag & drop reordering
  is_active: boolean;
  is_locked: boolean; // Admin lock functionality
  admin_notes?: string;
  is_published?: boolean;
  published_at?: string;
  published_by?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  // Virtual fields for multiple images
  images?: SlideImage[];
}

export interface SlidePermission {
  id: string;
  slide_id: string;
  user_id: string;
  permission_type: "edit" | "view" | "delete";
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface SlideTemplate {
  id: string;
  name: string;
  description?: string;
  type: Slide["type"];
  template_data: any;
  is_public: boolean;
  created_by?: string;
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

  // Enhanced Slide functions
  async getSlides(restaurantId: string, includeImages: boolean = true) {
    let query = supabase
      .from("slides")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("sort_order", { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    if (includeImages && data) {
      // Fetch images for each slide
      const slidesWithImages = await Promise.all(
        data.map(async (slide) => {
          const { data: images } = await supabase
            .from("slide_images")
            .select("*")
            .eq("slide_id", slide.id)
            .order("sort_order", { ascending: true });

          return {
            ...slide,
            images: images || [],
          };
        })
      );

      return slidesWithImages as Slide[];
    }

    return data as Slide[];
  },

  async getSlide(id: string, includeImages: boolean = true) {
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (includeImages && data) {
      const { data: images } = await supabase
        .from("slide_images")
        .select("*")
        .eq("slide_id", id)
        .order("sort_order", { ascending: true });

      return {
        ...data,
        images: images || [],
      } as Slide;
    }

    return data as Slide;
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

  // Slide Images functions
  async addSlideImage(
    image: Omit<SlideImage, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("slide_images")
      .insert([image])
      .select()
      .single();

    if (error) throw error;
    return data as SlideImage;
  },

  async updateSlideImage(id: string, updates: Partial<SlideImage>) {
    const { data, error } = await supabase
      .from("slide_images")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as SlideImage;
  },

  async deleteSlideImage(id: string) {
    const { error } = await supabase.from("slide_images").delete().eq("id", id);

    if (error) throw error;
  },

  async reorderSlideImages(slideId: string, imageIds: string[]) {
    const updates = imageIds.map((id, index) => ({
      id,
      sort_order: index,
    }));

    const { error } = await supabase.from("slide_images").upsert(updates);

    if (error) throw error;
  },

  // Slide Permissions functions
  async checkSlidePermission(
    slideId: string,
    userId: string,
    permissionType: string
  ) {
    const { data, error } = await supabase
      .from("slide_permissions")
      .select("*")
      .eq("slide_id", slideId)
      .eq("user_id", userId)
      .eq("permission_type", permissionType)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  },

  async grantSlidePermission(
    permission: Omit<SlidePermission, "id" | "granted_at">
  ) {
    const { data, error } = await supabase
      .from("slide_permissions")
      .insert([permission])
      .select()
      .single();

    if (error) throw error;
    return data as SlidePermission;
  },

  // Slide Templates functions
  async getSlideTemplates(isPublic: boolean = true) {
    const { data, error } = await supabase
      .from("slide_templates")
      .select("*")
      .eq("is_public", isPublic)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as SlideTemplate[];
  },

  async createSlideTemplate(
    template: Omit<SlideTemplate, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("slide_templates")
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data as SlideTemplate;
  },

  // Reorder slides
  async reorderSlides(restaurantId: string, slideIds: string[]) {
    const updates = slideIds.map((id, index) => ({
      id,
      sort_order: index,
    }));

    const { error } = await supabase.from("slides").upsert(updates);

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

    if (error && error.code !== "PGRST116") throw error;
    return data as Admin | null;
  },
};
