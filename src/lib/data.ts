export interface Product {
  id: string;
  slug: string;
  emoji: string;
  brand: string;
  name: string;
  category: "Makeup" | "Skincare" | "Nail Care" | "Fragrances";
  price: number;
  oldPrice: number;
  rating: number;
  reviewsCount: number;
  tag?: string;
  isNew?: boolean;
  description: string;
  features: string[];
  inStock: boolean;
}

export interface Job {
  id: string;
  slug: string;
  type: "Full Time" | "Part Time";
  title: string;
  salon: string;
  location: string;
  salary: string;
  experience: string;
  openings: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
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

export const products: Product[] = [
  {
    id: "1",
    slug: "luxe-liquid-lipstick",
    emoji: "💋",
    brand: "Velvet Matte",
    name: "Luxe Liquid Lipstick",
    category: "Makeup",
    price: 599,
    oldPrice: 799,
    rating: 5,
    reviewsCount: 214,
    tag: "-25%",
    description:
      "A long-lasting, highly-pigmented liquid lipstick with a luxurious matte finish that stays put all day without drying your lips.",
    features: [
      "Long-lasting 12-hour wear",
      "Enriched with Vitamin E",
      "Cruelty-free & paraben-free",
      "Velvet matte finish",
    ],
    inStock: true,
  },
  {
    id: "2",
    slug: "vitamin-c-face-serum",
    emoji: "🧴",
    brand: "Glow Ritual",
    name: "Vitamin C Face Serum",
    category: "Skincare",
    price: 849,
    oldPrice: 0,
    rating: 5,
    reviewsCount: 189,
    tag: "NEW",
    isNew: true,
    description:
      "A brightening vitamin C serum that reduces dark spots and boosts radiance for glowing, even-toned skin.",
    features: [
      "Brightens & evens skin tone",
      "20% Vitamin C + Hyaluronic Acid",
      "Suitable for all skin types",
      "Dermatologically tested",
    ],
    inStock: true,
  },
  {
    id: "3",
    slug: "radiance-highlighter",
    emoji: "✨",
    brand: "Aura Beauty",
    name: "Radiance Highlighter",
    category: "Makeup",
    price: 449,
    oldPrice: 649,
    rating: 4,
    reviewsCount: 97,
    tag: "-30%",
    description:
      "A silky-smooth highlighter that gives a luminous, lit-from-within glow for a radiant complexion.",
    features: [
      "Buildable luminous glow",
      "Silky blendable formula",
      "Long-wearing shimmer",
      "Suits all skin tones",
    ],
    inStock: true,
  },
  {
    id: "4",
    slug: "rose-eau-de-parfum",
    emoji: "🌸",
    brand: "Bloom Essence",
    name: "Rose Eau De Parfum",
    category: "Fragrances",
    price: 1199,
    oldPrice: 0,
    rating: 5,
    reviewsCount: 156,
    tag: "NEW",
    isNew: true,
    description:
      "An elegant floral fragrance with notes of Bulgarian rose, jasmine and warm musk for a lasting impression.",
    features: [
      "Long-lasting 8-hour fragrance",
      "Notes of rose, jasmine & musk",
      "Elegant travel-friendly bottle",
      "Skin-friendly formula",
    ],
    inStock: true,
  },
  {
    id: "5",
    slug: "gel-nail-polish-set",
    emoji: "💅",
    brand: "Chic Nails",
    name: "Gel Nail Polish Set",
    category: "Nail Care",
    price: 699,
    oldPrice: 999,
    rating: 5,
    reviewsCount: 78,
    tag: "-30%",
    description:
      "A set of 6 vibrant gel nail polishes with a glossy, chip-resistant finish for salon-quality nails at home.",
    features: [
      "Set of 6 trending shades",
      "Chip-resistant glossy finish",
      "Quick-dry formula",
      "Long-lasting up to 10 days",
    ],
    inStock: true,
  },
  {
    id: "6",
    slug: "volumizing-mascara",
    emoji: "👁️",
    brand: "Dramatic Lash",
    name: "Volumizing Mascara",
    category: "Makeup",
    price: 399,
    oldPrice: 549,
    rating: 4,
    reviewsCount: 132,
    tag: "-27%",
    description:
      "A volumizing mascara that delivers dramatic length and lift without clumping, for bold, beautiful lashes.",
    features: [
      "4x volume & length",
      "Smudge-proof & waterproof",
      "Nourishing lash formula",
      "Clump-free application",
    ],
    inStock: true,
  },
  {
    id: "7",
    slug: "gentle-foaming-cleanser",
    emoji: "🧼",
    brand: "Pure Glow",
    name: "Gentle Foaming Cleanser",
    category: "Skincare",
    price: 349,
    oldPrice: 0,
    rating: 5,
    reviewsCount: 210,
    tag: "NEW",
    isNew: true,
    description:
      "A gentle foaming cleanser that removes impurities and makeup while keeping skin soft and hydrated.",
    features: [
      "Removes makeup & impurities",
      "pH-balanced gentle formula",
      "With aloe vera & green tea",
      "For daily use",
    ],
    inStock: true,
  },
  {
    id: "8",
    slug: "hydrating-face-cream",
    emoji: "💆",
    brand: "Silk Touch",
    name: "Hydrating Face Cream",
    category: "Skincare",
    price: 749,
    oldPrice: 999,
    rating: 5,
    reviewsCount: 167,
    tag: "-25%",
    description:
      "A rich, hydrating face cream that deeply moisturises and plumps skin for a smooth, youthful glow.",
    features: [
      "48-hour deep hydration",
      "With hyaluronic acid",
      "Non-greasy fast absorption",
      "Reduces fine lines",
    ],
    inStock: true,
  },
];

export const jobs: Job[] = [
  {
    id: "1",
    slug: "senior-beautician",
    type: "Full Time",
    title: "Senior Beautician",
    salon: "Blush Beauty Lounge",
    location: "Hazratganj",
    salary: "₹18k–25k",
    experience: "2+ years",
    openings: 2,
    description:
      "We are seeking an experienced and passionate Senior Beautician to join our premium salon, delivering exceptional beauty services with the highest standards of hygiene and care.",
    responsibilities: [
      "Perform facials, threading, waxing, bleaching and skincare treatments",
      "Advise clients on suitable beauty treatments and products",
      "Maintain cleanliness and hygiene of tools and workstation",
      "Build strong relationships with regular clients",
      "Stay updated with the latest beauty trends and techniques",
    ],
    requirements: [
      "Certified diploma in Beauty & Cosmetology",
      "Minimum 2 years of hands-on salon experience",
      "Excellent communication and customer service skills",
      "Knowledge of latest beauty products and treatments",
      "Positive attitude and professional appearance",
    ],
    perks: [
      "Competitive salary with performance incentives",
      "Paid training on premium brands & techniques",
      "Employee discounts on products & services",
      "Friendly, growth-oriented work environment",
    ],
  },
  {
    id: "2",
    slug: "makeup-artist",
    type: "Full Time",
    title: "Makeup Artist",
    salon: "Glamour Studio",
    location: "Gomti Nagar",
    salary: "₹20k–30k",
    experience: "1+ year",
    openings: 1,
    description:
      "Join our creative team as a Makeup Artist specialising in bridal, party and HD makeup. Bring your artistry to help clients look and feel their best.",
    responsibilities: [
      "Create bridal, party and HD makeup looks",
      "Conduct pre-event makeup consultations",
      "Collaborate with photographers for portfolio shoots",
      "Maintain and organize professional makeup kit",
      "Stay updated on trending makeup styles",
    ],
    requirements: [
      "Professional makeup certification",
      "1+ years of bridal or party makeup experience",
      "Portfolio showcasing previous work",
      "Knowledge of skin tones and color theory",
      "Excellent customer communication skills",
    ],
    perks: [
      "Competitive salary with event bonuses",
      "Premium product access",
      "Featured work on our social channels",
      "Flexible scheduling",
    ],
  },
  {
    id: "3",
    slug: "hair-stylist",
    type: "Part Time",
    title: "Hair Stylist",
    salon: "Style Hub Salon",
    location: "Aliganj",
    salary: "₹15k–22k",
    experience: "Fresher OK",
    openings: 1,
    description:
      "Looking for a creative Hair Stylist to provide cutting, colouring and styling services. Freshers with a diploma are welcome to apply.",
    responsibilities: [
      "Perform haircuts, styling and blow-drys",
      "Execute hair coloring and highlighting services",
      "Recommend hair care routines and products",
      "Conduct hair and scalp consultations",
      "Maintain hygiene of tools and workstation",
    ],
    requirements: [
      "Diploma in hair styling preferred",
      "Freshers with passion are welcome",
      "Creativity and attention to detail",
      "Good communication skills",
      "Ability to work flexible hours",
    ],
    perks: [
      "Friendly work environment",
      "On-the-job learning from seniors",
      "Product discounts",
      "Performance-based incentives",
    ],
  },
  {
    id: "4",
    slug: "nail-art-specialist",
    type: "Full Time",
    title: "Nail Art Specialist",
    salon: "The Nail Bar",
    location: "Indira Nagar",
    salary: "₹16k–24k",
    experience: "1+ year",
    openings: 1,
    description:
      "We need a talented Nail Art Specialist skilled in manicures, pedicures, gel and acrylic nail art to delight our fashion-forward clients.",
    responsibilities: [
      "Perform manicures, pedicures and nail extensions",
      "Create intricate gel and acrylic nail art",
      "Consult clients on nail care and designs",
      "Maintain tool hygiene and sanitization",
      "Stay updated on nail art trends",
    ],
    requirements: [
      "1+ years of nail art experience",
      "Certification in nail technology",
      "Creative portfolio of designs",
      "Knowledge of nail health and hygiene",
      "Artistic eye and steady hands",
    ],
    perks: [
      "Attractive salary package",
      "Free nail products for personal use",
      "Creative freedom in designs",
      "Feature work on our Instagram",
    ],
  },
];

export const reviews: Review[] = [
  {
    id: "1",
    author: "Ritika Singh",
    initial: "R",
    rating: 5,
    date: "2 days ago",
    comment:
      "Absolutely love this shade! Stays on for hours and doesn't dry my lips. Highly recommend.",
  },
  {
    id: "2",
    author: "Meera Joshi",
    initial: "M",
    rating: 4,
    date: "1 week ago",
    comment:
      "Great pigmentation and lovely packaging. Delivery was quick within Lucknow.",
  },
  {
    id: "3",
    author: "Kavya N.",
    initial: "K",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Premium quality products at honest prices. The serum transformed my skin within weeks!",
  },
];

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