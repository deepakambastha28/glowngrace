export interface Product {
  id: string;
  slug: string;
  emoji: string;
  brand: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviewsCount: number;
  tag?: string;
  isNew?: boolean;
  description: string;
  features: string[];
  inStock: boolean;
  imageData?: string | null;
  gallery?: string[];
}

export interface Job {
  id: string;
  slug: string;
  type: "Full Time" | "Part Time";
  title: string;
  salon: string;
  location: string;
  salary: string;
  salaryUnit: string;
  experience: string;
  openings: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  occasions?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  initial: string;
  rating: number;
  date: string;
  comment: string;
}

export const localityPos: Record<string, { x: number; y: number }> = {
  Hazratganj: { x: 48, y: 52 },
  "Gomti Nagar": { x: 72, y: 32 },
  Aliganj: { x: 34, y: 18 },
  "Indira Nagar": { x: 78, y: 20 },
  "Vibhuti Khand": { x: 66, y: 48 },
  Mahanagar: { x: 44, y: 30 },
};

export interface PartnerPhoto {
  emoji: string;
  gradient: string;
  caption: string;
}

export interface PartnerService {
  name: string;
  price: string;
}

export interface Partner {
  id: string;
  slug: string;
  name: string;
  type: string;
  loc: string;
  emoji: string;
  gradient: string;
  rating: number;
  reviews: number;
  estd: number;
  staff: number;
  services: number;
  description: string;
  tags: string[];
  gallery: PartnerPhoto[];
  menu: PartnerService[];
}

export const categories = [
  { name: "Makeup", emoji: "💄", description: "Lipsticks, foundation & more" },
  { name: "Skincare", emoji: "🧴", description: "Serums, creams & masks" },
  { name: "Nail Care", emoji: "💅", description: "Polishes & nail art kits" },
  { name: "Fragrances", emoji: "🌸", description: "Perfumes & body mists" },
] as const;

export const testimonials = [
  {
    id: "1",
    name: "Priya Sharma",
    initial: "P",
    location: "Gomti Nagar",
    text: "The cosmetics are 100% authentic and delivery was super fast. My go-to store!",
    rating: 5,
  },
  {
    id: "2",
    name: "Anjali Verma",
    initial: "A",
    location: "Aliganj",
    text: "Thanks to their placement service, I got a beautician job at a top salon within two weeks!",
    rating: 5,
  },
  {
    id: "3",
    name: "Sneha Gupta",
    initial: "S",
    location: "Hazratganj",
    text: "Beautiful products and genuine career support. Glow & Grace truly cares about women's growth.",
    rating: 5,
  },
];

export const stats = [
  { value: "5000+", label: "Happy Customers" },
  { value: "200+", label: "Beauty Placements" },
  { value: "150+", label: "Partner Parlours" },
];

export const trustItems = [
  { emoji: "🚚", text: "Free Delivery in Lucknow" },
  { emoji: "✅", text: "100% Authentic Products" },
  { emoji: "💳", text: "Secure Payments" },
  { emoji: "🤝", text: "Verified Job Placements" },
];

export interface EventPhoto {
  emoji: string;
  gradient: string;
  caption: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  emoji: string;
  gradient: string;
  date: string;
  time: string;
  loc: string;
  venue: string;
  price: string;
  capacity: number;
  spotsLeft: number;
  description: string;
  agenda: string[];
  tags: string[];
  gallery: EventPhoto[];
}