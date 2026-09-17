export const HOME_SECTION_KEYS = [
  "hero",
  "categories",
  "bestsellers",
  "partners",
  "jobs",
  "cta",
  "testimonials",
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export const HOME_SECTION_LABELS: Record<HomeSectionKey, string> = {
  hero: "Hero",
  categories: "Shop Categories",
  bestsellers: "Bestsellers",
  partners: "Partner Parlours",
  jobs: "Job Vacancies",
  cta: "CTA Banner",
  testimonials: "Testimonials",
};

export interface HomeStat {
  value: string;
  label: string;
}

export interface HomeTrustItem {
  emoji: string;
  text: string;
}

export interface HomeHeroContent {
  eyebrow: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  stats: HomeStat[];
  trust: HomeTrustItem[];
}

export interface HomeTextSection {
  eyebrow: string;
  title: string;
  description: string;
}

export interface HomeCtaContent {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface HomeSectionSetting {
  key: HomeSectionKey;
  visible: boolean;
}

export interface HomeConfig {
  sections: HomeSectionSetting[];
  hero: HomeHeroContent;
  categories: HomeTextSection;
  bestsellers: HomeTextSection;
  partners: HomeTextSection;
  jobs: HomeTextSection;
  cta: HomeCtaContent;
  testimonials: { eyebrow: string; title: string };
}

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  sections: HOME_SECTION_KEYS.map((key) => ({ key, visible: true })),
  hero: {
    eyebrow: "Lucknow's Premier Beauty Destination",
    title: "Discover Your Radiant Beauty & Career",
    titleHighlight: "Radiant",
    description:
      "Shop premium women's cosmetics and skincare, or launch your dream career in the beauty industry with our trusted parlour placement services.",
    primaryLabel: "Shop Cosmetics",
    primaryHref: "/products",
    secondaryLabel: "Find a Career",
    secondaryHref: "/careers",
    stats: [
      { value: "5000+", label: "Happy Customers" },
      { value: "200+", label: "Beauty Placements" },
      { value: "150+", label: "Partner Parlours" },
    ],
    trust: [
      { emoji: "🚚", text: "Free Delivery in Lucknow" },
      { emoji: "✅", text: "100% Authentic Products" },
      { emoji: "💳", text: "Secure Payments" },
      { emoji: "🤝", text: "Verified Job Placements" },
    ],
  },
  categories: {
    eyebrow: "Shop by Category",
    title: "Everything to Enhance Your Beauty",
    description:
      "Explore our curated collection of premium cosmetic and beauty products.",
  },
  bestsellers: {
    eyebrow: "Bestsellers",
    title: "Trending Beauty Picks",
    description: "Handpicked favourites loved by women across Lucknow.",
  },
  partners: {
    eyebrow: "Our Network",
    title: "Featured Partner Parlours",
    description:
      "Premium beauty parlours & salons partnered with Glow & Grace across Lucknow.",
  },
  jobs: {
    eyebrow: "Latest Openings",
    title: "Current Beauty Job Vacancies",
    description: "Fresh opportunities from trusted parlours & salons in Lucknow.",
  },
  cta: {
    title: "Ready to Begin Your Beauty Journey?",
    description:
      "Whether you're shopping for the perfect glow or searching for your dream beauty career, Glow & Grace is here for you.",
    primaryLabel: "Get Started Today",
    primaryHref: "/products",
    secondaryLabel: "Explore Careers",
    secondaryHref: "/careers",
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "Loved by Women Across Lucknow",
  },
};

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeSections(raw: unknown): HomeSectionSetting[] {
  const provided = Array.isArray(raw) ? raw : [];
  const seen = new Set<HomeSectionKey>();
  const out: HomeSectionSetting[] = [];
  for (const entry of provided) {
    const key = (entry as { key?: unknown })?.key;
    if (
      typeof key === "string" &&
      (HOME_SECTION_KEYS as readonly string[]).includes(key) &&
      !seen.has(key as HomeSectionKey)
    ) {
      seen.add(key as HomeSectionKey);
      out.push({
        key: key as HomeSectionKey,
        visible: (entry as { visible?: unknown }).visible !== false,
      });
    }
  }
  for (const key of HOME_SECTION_KEYS) {
    if (!seen.has(key)) out.push({ key, visible: true });
  }
  return out;
}

function normalizeTextSection(raw: unknown, fallback: HomeTextSection): HomeTextSection {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<HomeTextSection>;
  return {
    eyebrow: str(value.eyebrow, fallback.eyebrow),
    title: str(value.title, fallback.title),
    description: str(value.description, fallback.description),
  };
}

/** Merge a stored/partial config over the defaults, ignoring malformed values. */
export function normalizeHomeConfig(raw: unknown): HomeConfig {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<HomeConfig>;
  const base = DEFAULT_HOME_CONFIG;
  const hero = (value.hero && typeof value.hero === "object" ? value.hero : {}) as Partial<HomeHeroContent>;
  const cta = (value.cta && typeof value.cta === "object" ? value.cta : {}) as Partial<HomeCtaContent>;
  const testimonials = (value.testimonials && typeof value.testimonials === "object"
    ? value.testimonials
    : {}) as { eyebrow?: unknown; title?: unknown };

  return {
    sections: normalizeSections(value.sections),
    hero: {
      eyebrow: str(hero.eyebrow, base.hero.eyebrow),
      title: str(hero.title, base.hero.title),
      titleHighlight: str(hero.titleHighlight, base.hero.titleHighlight),
      description: str(hero.description, base.hero.description),
      primaryLabel: str(hero.primaryLabel, base.hero.primaryLabel),
      primaryHref: str(hero.primaryHref, base.hero.primaryHref),
      secondaryLabel: str(hero.secondaryLabel, base.hero.secondaryLabel),
      secondaryHref: str(hero.secondaryHref, base.hero.secondaryHref),
      stats: Array.isArray(hero.stats) ? hero.stats : base.hero.stats,
      trust: Array.isArray(hero.trust) ? hero.trust : base.hero.trust,
    },
    categories: normalizeTextSection(value.categories, base.categories),
    bestsellers: normalizeTextSection(value.bestsellers, base.bestsellers),
    partners: normalizeTextSection(value.partners, base.partners),
    jobs: normalizeTextSection(value.jobs, base.jobs),
    cta: {
      title: str(cta.title, base.cta.title),
      description: str(cta.description, base.cta.description),
      primaryLabel: str(cta.primaryLabel, base.cta.primaryLabel),
      primaryHref: str(cta.primaryHref, base.cta.primaryHref),
      secondaryLabel: str(cta.secondaryLabel, base.cta.secondaryLabel),
      secondaryHref: str(cta.secondaryHref, base.cta.secondaryHref),
    },
    testimonials: {
      eyebrow: str(testimonials.eyebrow, base.testimonials.eyebrow),
      title: str(testimonials.title, base.testimonials.title),
    },
  };
}
