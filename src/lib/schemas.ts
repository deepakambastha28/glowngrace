import { z } from "zod";

export const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be at most 15 digits"),
  street: z.string().min(3, "Please enter your street address"),
  locality: z.string().min(2, "Please enter your locality"),
  city: z.string().default("Lucknow"),
  state: z.string().default("Uttar Pradesh"),
  pincode: z
    .string()
    .length(6, "PIN code must be 6 digits")
    .regex(/^\d{6}$/, "PIN code must be numeric"),
  landmark: z.string().optional(),
  deliveryOption: z.enum(["standard", "express", "same-day"]),
  paymentMethod: z.enum(["card", "upi", "netbanking", "cod"]),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Payload sent to the Neon-backed /api/orders endpoint.
export const orderPayloadSchema = z.object({
  orderId: z.string(),
  customer: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }),
  address: z.object({
    street: z.string(),
    locality: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    landmark: z.string().optional(),
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      emoji: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
  totals: z.object({
    subtotal: z.number(),
    gst: z.number(),
    shipping: z.number(),
    total: z.number(),
  }),
  deliveryOption: z.string(),
  paymentMethod: z.string(),
});

export type OrderPayload = z.infer<typeof orderPayloadSchema>;

export const applicationPayloadSchema = z.object({
  jobId: z.string(),
  jobSlug: z.string(),
  jobTitle: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  city: z.string(),
  experience: z.string(),
  specialization: z.string(),
  qualification: z.string(),
  coverNote: z.string(),
  resumeName: z.string().optional(),
});

export type ApplicationPayload = z.infer<typeof applicationPayloadSchema>;

export const newsletterPayloadSchema = z.object({
  email: z.string().email(),
});

export const applyJobSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be at most 15 digits"),
  email: z.string().email("Invalid email address"),
  city: z.string().min(2, "Please enter your city"),
  experience: z.string().min(1, "Please select your experience level"),
  specialization: z.string().min(1, "Please select your specialization"),
  qualification: z.string().min(1, "Please select your qualification"),
  coverNote: z
    .string()
    .min(20, "Cover note must be at least 20 characters")
    .max(500, "Cover note must be at most 500 characters"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

export type ApplyJobFormData = z.infer<typeof applyJobSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be at most 15 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// ---------------------------------------------------------------
// Admin
// ---------------------------------------------------------------

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export const adminProductSchema = z.object({
  emoji: z.string().min(1, "Please choose an icon"),
  brand: z.string().min(1, "Please enter a brand"),
  name: z.string().min(1, "Please enter a product name"),
  category: z.enum(["Makeup", "Skincare", "Nail Care", "Fragrances"]),
  price: z.coerce.number().int().positive("Enter a price"),
  oldPrice: z.coerce.number().int().nonnegative().default(0),
  stock: z.coerce.number().int().nonnegative().default(0),
  description: z.string().default(""),
  descriptionHtml: z.string().default(""),
  features: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  imageData: z.string().optional().nullable(),
  shade: z.string().default(""),
  size: z.string().default(""),
  finish: z.string().default(""),
  ingredients: z.string().default(""),
  isNew: z.boolean().default(false),
});

export type AdminProductFormData = z.infer<typeof adminProductSchema>;

export const adminJobSchema = z.object({
  title: z.string().min(1, "Please enter a position title"),
  salon: z.string().min(1, "Please enter a salon name"),
  location: z.string().min(1, "Please enter a location"),
  type: z.enum(["Full Time", "Part Time", "Contract"]),
  salaryMin: z.coerce.number().int().positive("Enter minimum salary"),
  salaryMax: z.coerce.number().int().nonnegative().default(0),
  salaryText: z.string().default(""),
  experience: z.string().default("Fresher"),
  openings: z.coerce.number().int().positive().default(1),
  description: z.string().default(""),
  requirements: z.array(z.string()).default([]),
});

export type AdminJobFormData = z.infer<typeof adminJobSchema>;

export const adminReviewSchema = z.object({
  author: z.string().min(1, "Please enter a name"),
  initial: z.string().default(""),
  product: z.string().min(1, "Please select a product"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(1, "Please enter the review text"),
  location: z.string().default(""),
  status: z.enum(["Approved", "Pending", "Hidden"]),
});

export type AdminReviewFormData = z.infer<typeof adminReviewSchema>;