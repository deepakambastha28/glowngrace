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
    salaryUnit: "per month",
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
    salaryUnit: "per month",
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
    salaryUnit: "per month",
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
    salaryUnit: "per month",
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
  {
    id: "5",
    slug: "mehndi-artist",
    type: "Part Time",
    title: "Mehndi Artist",
    salon: "Mehndi by Grace",
    location: "Omega Green Park Township, Uattardhona, Uttar Pradesh",
    salary: "₹100–500",
    salaryUnit: "per hand",
    experience: "Fresher OK",
    openings: 2,
    description:
      "Bridal & festive mehndi bookings across Lucknow. Showcase your designs and keep 100% of your earnings — we connect you directly with clients, with no bidding, no middlemen and no commission.",
    responsibilities: [
      "Create intricate bridal mehndi designs for weddings and events",
      "Provide festival and party mehndi services for clients",
      "Consult clients on design preferences and pricing",
      "Maintain hygiene standards for tools and workspace",
      "Build a loyal client base across Lucknow",
    ],
    requirements: [
      "Based in Lucknow",
      "Experience as a Mehndi Artist (fresh talent also welcome)",
      "Own mehndi/henna tools or equipment",
      "Smartphone with internet access",
      "Available for at least a few hours per week",
    ],
    perks: [
      "Flexible schedule — accept only what suits you",
      "Work locally near your area of Lucknow",
    ],
    occasions: [
      "Durga Ashtami: Sunday, October 18, 2026",
      "Maha Navami: Monday, October 19, 2026",
    ],
  },
];

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

export const localityPos: Record<string, { x: number; y: number }> = {
  Hazratganj: { x: 48, y: 52 },
  "Gomti Nagar": { x: 72, y: 32 },
  Aliganj: { x: 34, y: 18 },
  "Indira Nagar": { x: 78, y: 20 },
  "Vibhuti Khand": { x: 66, y: 48 },
  Mahanagar: { x: 44, y: 30 },
};

export const partners: Partner[] = [
  {
    id: "1",
    slug: "blush-beauty-lounge",
    name: "Blush Beauty Lounge",
    type: "Premium Unisex Salon",
    loc: "Hazratganj",
    emoji: "💇‍♀️",
    gradient: "linear-gradient(135deg,#d6336c,#f4a6c0)",
    rating: 4.9,
    reviews: 214,
    estd: 2016,
    staff: 12,
    services: 32,
    description:
      "A luxurious full-service beauty lounge in the heart of Hazratganj, offering premium hair, skin and bridal services with certified professionals and international products.",
    tags: ["Bridal", "Hair Spa", "Facials", "Keratin"],
    gallery: [
      { emoji: "💇‍♀️", gradient: "linear-gradient(135deg,#d6336c,#f4a6c0)", caption: "Styling Station" },
      { emoji: "💅", gradient: "linear-gradient(135deg,#c9a35b,#f0d9a8)", caption: "Nail Bar" },
      { emoji: "🧖‍♀️", gradient: "linear-gradient(135deg,#8a1f47,#d6336c)", caption: "Facial Room" },
      { emoji: "💄", gradient: "linear-gradient(135deg,#b02a5b,#f4a6c0)", caption: "Makeup Studio" },
      { emoji: "💆‍♀️", gradient: "linear-gradient(135deg,#2e9e6b,#a8e0c5)", caption: "Spa Suite" },
      { emoji: "👰", gradient: "linear-gradient(135deg,#c9a35b,#d6336c)", caption: "Bridal Lounge" },
      { emoji: "🪮", gradient: "linear-gradient(135deg,#3b82c9,#a8c9f0)", caption: "Hair Wash" },
      { emoji: "✨", gradient: "linear-gradient(135deg,#d6336c,#c9a35b)", caption: "Reception" },
    ],
    menu: [
      { name: "💇‍♀️ Hair Cut & Style", price: "₹499" },
      { name: "🎨 Hair Colour", price: "₹1,499" },
      { name: "💆‍♀️ Hair Spa", price: "₹899" },
      { name: "🧖‍♀️ Gold Facial", price: "₹1,299" },
      { name: "👰 Bridal Makeup", price: "₹8,999" },
      { name: "💅 Gel Manicure", price: "₹699" },
    ],
  },
  {
    id: "2",
    slug: "glamour-studio",
    name: "Glamour Studio",
    type: "Makeup & Bridal Studio",
    loc: "Gomti Nagar",
    emoji: "💄",
    gradient: "linear-gradient(135deg,#c9a35b,#f0d9a8)",
    rating: 4.8,
    reviews: 189,
    estd: 2018,
    staff: 9,
    services: 24,
    description:
      "A trend-setting makeup and bridal studio in Gomti Nagar known for flawless HD & airbrush makeup, styled by award-winning artists for weddings and events.",
    tags: ["HD Makeup", "Airbrush", "Party", "Draping"],
    gallery: [
      { emoji: "💄", gradient: "linear-gradient(135deg,#c9a35b,#f0d9a8)", caption: "Makeup Bar" },
      { emoji: "👰", gradient: "linear-gradient(135deg,#d6336c,#f4a6c0)", caption: "Bridal Suite" },
      { emoji: "✨", gradient: "linear-gradient(135deg,#b02a5b,#c9a35b)", caption: "Glam Corner" },
      { emoji: "💇‍♀️", gradient: "linear-gradient(135deg,#8a1f47,#d6336c)", caption: "Styling" },
      { emoji: "📸", gradient: "linear-gradient(135deg,#3b82c9,#a8c9f0)", caption: "Photo Zone" },
      { emoji: "💍", gradient: "linear-gradient(135deg,#c9a35b,#d6336c)", caption: "Trial Room" },
    ],
    menu: [
      { name: "💄 HD Makeup", price: "₹3,499" },
      { name: "✈️ Airbrush Makeup", price: "₹5,999" },
      { name: "👰 Bridal Package", price: "₹12,999" },
      { name: "🎉 Party Makeup", price: "₹2,499" },
      { name: "🧣 Saree Draping", price: "₹499" },
      { name: "💇‍♀️ Hair Styling", price: "₹899" },
    ],
  },
  {
    id: "3",
    slug: "style-hub-salon",
    name: "Style Hub Salon",
    type: "Hair & Styling Salon",
    loc: "Aliganj",
    emoji: "💇",
    gradient: "linear-gradient(135deg,#3b82c9,#a8c9f0)",
    rating: 4.7,
    reviews: 142,
    estd: 2019,
    staff: 8,
    services: 20,
    description:
      "Aliganj's favourite hair studio specialising in modern cuts, global colour and keratin treatments in a chic, relaxed setting.",
    tags: ["Hair Cut", "Colour", "Smoothening", "Kids"],
    gallery: [
      { emoji: "💇", gradient: "linear-gradient(135deg,#3b82c9,#a8c9f0)", caption: "Cutting Zone" },
      { emoji: "🎨", gradient: "linear-gradient(135deg,#d6336c,#f4a6c0)", caption: "Colour Bar" },
      { emoji: "🪮", gradient: "linear-gradient(135deg,#2e9e6b,#a8e0c5)", caption: "Wash Area" },
      { emoji: "💆", gradient: "linear-gradient(135deg,#c9a35b,#f0d9a8)", caption: "Treatment" },
      { emoji: "✨", gradient: "linear-gradient(135deg,#8a1f47,#d6336c)", caption: "Lounge" },
    ],
    menu: [
      { name: "💇 Hair Cut", price: "₹399" },
      { name: "🎨 Global Colour", price: "₹2,499" },
      { name: "💆 Keratin", price: "₹3,999" },
      { name: "🌿 Smoothening", price: "₹3,499" },
      { name: "👦 Kids Cut", price: "₹249" },
      { name: "💧 Hair Spa", price: "₹799" },
    ],
  },
  {
    id: "4",
    slug: "the-nail-bar",
    name: "The Nail Bar",
    type: "Nail Art & Spa",
    loc: "Indira Nagar",
    emoji: "💅",
    gradient: "linear-gradient(135deg,#8a1f47,#d6336c)",
    rating: 4.9,
    reviews: 167,
    estd: 2020,
    staff: 6,
    services: 18,
    description:
      "A dedicated nail art & spa boutique in Indira Nagar offering gel, acrylic and intricate nail art alongside relaxing hand & foot spas.",
    tags: ["Gel Nails", "Acrylic", "Nail Art", "Pedicure"],
    gallery: [
      { emoji: "💅", gradient: "linear-gradient(135deg,#8a1f47,#d6336c)", caption: "Nail Studio" },
      { emoji: "🦶", gradient: "linear-gradient(135deg,#2e9e6b,#a8e0c5)", caption: "Pedi Lounge" },
      { emoji: "🎨", gradient: "linear-gradient(135deg,#c9a35b,#f0d9a8)", caption: "Art Corner" },
      { emoji: "✨", gradient: "linear-gradient(135deg,#d6336c,#f4a6c0)", caption: "Reception" },
      { emoji: "💎", gradient: "linear-gradient(135deg,#3b82c9,#a8c9f0)", caption: "Gems Bar" },
    ],
    menu: [
      { name: "💅 Gel Manicure", price: "₹699" },
      { name: "💎 Acrylic Extensions", price: "₹1,499" },
      { name: "🎨 Nail Art (per nail)", price: "₹99" },
      { name: "🦶 Spa Pedicure", price: "₹899" },
      { name: "✋ Spa Manicure", price: "₹699" },
      { name: "💧 Paraffin Treatment", price: "₹499" },
    ],
  },
  {
    id: "5",
    slug: "serene-skin-clinic",
    name: "Serene Skin Clinic",
    type: "Skin & Wellness",
    loc: "Vibhuti Khand",
    emoji: "🧖‍♀️",
    gradient: "linear-gradient(135deg,#2e9e6b,#a8e0c5)",
    rating: 4.8,
    reviews: 98,
    estd: 2017,
    staff: 7,
    services: 22,
    description:
      "A calming skin & wellness clinic offering advanced facials, clean-ups and dermatologist-approved treatments for glowing, healthy skin.",
    tags: ["Facials", "Clean-up", "Anti-Ageing", "Peels"],
    gallery: [
      { emoji: "🧖‍♀️", gradient: "linear-gradient(135deg,#2e9e6b,#a8e0c5)", caption: "Facial Suite" },
      { emoji: "💆‍♀️", gradient: "linear-gradient(135deg,#d6336c,#f4a6c0)", caption: "Therapy Room" },
      { emoji: "🌿", gradient: "linear-gradient(135deg,#c9a35b,#f0d9a8)", caption: "Herbal Bar" },
      { emoji: "✨", gradient: "linear-gradient(135deg,#3b82c9,#a8c9f0)", caption: "Waiting Area" },
    ],
    menu: [
      { name: "🧖‍♀️ Fruit Facial", price: "₹999" },
      { name: "💎 Diamond Facial", price: "₹1,799" },
      { name: "🌿 Herbal Clean-up", price: "₹599" },
      { name: "⏳ Anti-Ageing", price: "₹2,499" },
      { name: "🧴 Chemical Peel", price: "₹1,999" },
      { name: "💧 Hydra Glow", price: "₹2,299" },
    ],
  },
  {
    id: "6",
    slug: "elegance-bridal-house",
    name: "Elegance Bridal House",
    type: "Bridal & Occasion",
    loc: "Mahanagar",
    emoji: "👰",
    gradient: "linear-gradient(135deg,#b02a5b,#f4a6c0)",
    rating: 5.0,
    reviews: 203,
    estd: 2015,
    staff: 14,
    services: 28,
    description:
      "Lucknow's celebrated bridal house delivering complete wedding beauty — from pre-bridal packages to the perfect big-day look, all under one elegant roof.",
    tags: ["Bridal", "Pre-Bridal", "Mehndi", "Groom"],
    gallery: [
      { emoji: "👰", gradient: "linear-gradient(135deg,#b02a5b,#f4a6c0)", caption: "Bridal Suite" },
      { emoji: "💄", gradient: "linear-gradient(135deg,#c9a35b,#f0d9a8)", caption: "Makeup Room" },
      { emoji: "🖐️", gradient: "linear-gradient(135deg,#2e9e6b,#a8e0c5)", caption: "Mehndi Corner" },
      { emoji: "💇‍♀️", gradient: "linear-gradient(135deg,#d6336c,#f4a6c0)", caption: "Hair Studio" },
      { emoji: "💍", gradient: "linear-gradient(135deg,#8a1f47,#d6336c)", caption: "Trial Lounge" },
      { emoji: "📸", gradient: "linear-gradient(135deg,#3b82c9,#a8c9f0)", caption: "Photo Set" },
      { emoji: "✨", gradient: "linear-gradient(135deg,#c9a35b,#d6336c)", caption: "Reception" },
    ],
    menu: [
      { name: "👰 Complete Bridal", price: "₹18,999" },
      { name: "🌸 Pre-Bridal Package", price: "₹9,999" },
      { name: "🖐️ Bridal Mehndi", price: "₹3,999" },
      { name: "🤵 Groom Grooming", price: "₹4,499" },
      { name: "💄 Reception Look", price: "₹6,999" },
      { name: "👗 Engagement Makeup", price: "₹5,499" },
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