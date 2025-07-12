import { z } from "zod";

// User validation schemas
export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Business validation schemas
export const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  type: z.string().min(1, "Business type is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

// Slideshow validation schemas
export const slideshowSchema = z.object({
  title: z.string().min(1, "Slideshow title is required"),
  description: z.string().optional(),
  business_id: z.string().uuid("Invalid business ID"),
  business_type: z.string().min(1, "Business type is required"),
  settings: z.record(z.any()).optional(),
  content: z.record(z.any()).optional(),
});

export const slideshowUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Slideshow title is required")
    .max(100, "Slideshow title must be less than 100 characters"),
  description: z.string().optional(),
  settings: z.record(z.any()).optional(),
  content: z.record(z.any()).optional(),
});

// Media validation schemas
export const mediaUploadSchema = z.object({
  file: z.instanceof(File),
  business_id: z.string().uuid("Invalid business ID"),
  media_type: z.enum(["image", "video"]),
  is_public: z.boolean().optional(),
});

// Staff validation schemas
export const staffInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "manager", "staff"]),
  permissions: z.record(z.boolean()).optional(),
});

// TV device validation schemas
export const tvDeviceSchema = z.object({
  name: z.string().min(1, "Device name is required"),
  location: z.string().optional(),
  business_id: z.string().uuid("Invalid business ID"),
});

// Subscription validation schemas
export const subscriptionSchema = z.object({
  plan_id: z.string().uuid("Invalid plan ID"),
  business_id: z.string().uuid("Invalid business ID"),
});

// AI Facts validation schemas
export const aiFactsSchema = z.object({
  category: z.string().min(1, "Category is required"),
  count: z.number().min(1).max(20, "Count must be between 1 and 20"),
  language: z.string().optional(),
});

// Menu item validation schemas
export const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  image_url: z.string().optional(),
});

// Deal validation schemas
export const dealSchema = z.object({
  title: z.string().min(1, "Deal title is required"),
  description: z.string().optional(),
  discount: z.number().min(0).max(100, "Discount must be between 0 and 100"),
  valid_until: z.date().optional(),
  image_url: z.string().optional(),
});

// Form validation helpers
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map((e) => e.message) };
    }
    return { success: false, errors: ["Validation failed"] };
  }
};

// Field validation helpers
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { valid: boolean; error?: string } => {
  try {
    schema.parse(value);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message };
    }
    return { valid: false, error: "Invalid value" };
  }
};
