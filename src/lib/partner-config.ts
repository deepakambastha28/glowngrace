export const PARTNER_SECTION_KEYS = [
  "banner",
  "directory",
  "benefits",
  "steps",
  "cta",
] as const;

export type PartnerSectionKey = (typeof PARTNER_SECTION_KEYS)[number];

export const PARTNER_SECTION_LABELS: Record<PartnerSectionKey, string> = {
  banner: "Banner",
  directory: "Partner Directory",
  benefits: "Why Partner",
  steps: "How It Works",
  cta: "CTA Banner",
};

export interface PartnerBannerContent {
  images: string[];
  title: string;
  subtitle: string;
}

export interface PartnerTextSection {
  eyebrow: string;
  title: string;
  description: string;
}

export interface PartnerBenefit {
  emoji: string;
  title: string;
  description: string;
}

export interface PartnerStep {
  title: string;
  description: string;
}

export interface PartnerCtaContent {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface PartnerSectionSetting {
  key: PartnerSectionKey;
  visible: boolean;
  deleted: boolean;
}

export interface PartnerConfig {
  sections: PartnerSectionSetting[];
  banner: PartnerBannerContent;
  directory: PartnerTextSection;
  benefits: PartnerTextSection & { items: PartnerBenefit[] };
  steps: PartnerTextSection & { items: PartnerStep[] };
  cta: PartnerCtaContent;
}

export const PARTNER_BANNER_MAX_IMAGES = 5;

export const DEFAULT_PARTNER_CONFIG: PartnerConfig = {
  sections: PARTNER_SECTION_KEYS.map((key) => ({ key, visible: true, deleted: false })),
  banner: {
    images: [],
    title: "Partner With Glow & Grace",
    subtitle:
      "Grow your salon with verified partners across Lucknow — hire trained talent and reach new customers.",
  },
  directory: {
    eyebrow: "Our Network",
    title: "Partner Beauty Parlours",
    description:
      "Explore our network of premium beauty parlours & salons across Lucknow. Browse their galleries, services and ratings.",
  },
  benefits: {
    eyebrow: "Why Partner With Us",
    title: "Perks of a Glow & Grace Partnership",
    description: "",
    items: [
      {
        emoji: "🧑‍🤝‍🧑",
        title: "Verified Talent Pool",
        description:
          "Access a growing pool of trained, background-checked beauticians and stylists ready to join your team.",
      },
      {
        emoji: "📣",
        title: "Free Job Posting",
        description:
          "List vacancies on our platform at no cost and reach thousands of job-seeking beauty professionals.",
      },
      {
        emoji: "📈",
        title: "Grow Your Salon",
        description:
          "Attract more customers with your partner badge and premium listing across our storefront and channels.",
      },
      {
        emoji: "🛡️",
        title: "Trusted Partnership",
        description:
          "Partner with a trusted Lucknow beauty brand and gain instant credibility in the local market.",
      },
    ],
  },
  steps: {
    eyebrow: "How It Works",
    title: "From Sign-Up to Scaling",
    description: "",
    items: [
      { title: "Register", description: "Tell us about your salon in minutes." },
      { title: "Get Verified", description: "Our team verifies and onboards your salon." },
      { title: "Hire Talent", description: "Post jobs and interview vetted professionals." },
      { title: "Grow Together", description: "Get customer leads and grow with us." },
    ],
  },
  cta: {
    title: "Representing Globally Recognised Beauty Brands",
    description:
      "Become a verified partner salon and hire trained, passionate professionals through Glow & Grace.",
    primaryLabel: "Register Your Salon",
    primaryHref: "/signup?accountType=recruiter",
    secondaryLabel: "",
    secondaryHref: "",
  },
};

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeSections(raw: unknown): PartnerSectionSetting[] {
  const provided = Array.isArray(raw) ? raw : [];
  const seen = new Set<PartnerSectionKey>();
  const out: PartnerSectionSetting[] = [];
  for (const entry of provided) {
    const key = (entry as { key?: unknown })?.key;
    if (
      typeof key === "string" &&
      (PARTNER_SECTION_KEYS as readonly string[]).includes(key) &&
      !seen.has(key as PartnerSectionKey)
    ) {
      const deleted = (entry as { deleted?: unknown }).deleted === true;
      seen.add(key as PartnerSectionKey);
      out.push({
        key: key as PartnerSectionKey,
        visible: (entry as { visible?: unknown }).visible !== false && !deleted,
        deleted,
      });
    }
  }
  for (const key of PARTNER_SECTION_KEYS) {
    if (!seen.has(key)) out.push({ key, visible: true, deleted: false });
  }
  return out;
}

function normalizeTextSection(raw: unknown, fallback: PartnerTextSection): PartnerTextSection {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<PartnerTextSection>;
  return {
    eyebrow: str(value.eyebrow, fallback.eyebrow),
    title: str(value.title, fallback.title),
    description: str(value.description, fallback.description),
  };
}

function normalizeBanner(raw: unknown, fallback: PartnerBannerContent): PartnerBannerContent {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<PartnerBannerContent>;
  const images = Array.isArray(value.images)
    ? value.images.filter((src): src is string => typeof src === "string" && src.length > 0)
    : [];
  return {
    images: images.slice(0, PARTNER_BANNER_MAX_IMAGES),
    title: str(value.title, fallback.title),
    subtitle: str(value.subtitle, fallback.subtitle),
  };
}

/** Merge a stored/partial config over the defaults, ignoring malformed values. */
export function normalizePartnerConfig(raw: unknown): PartnerConfig {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<PartnerConfig>;
  const base = DEFAULT_PARTNER_CONFIG;
  const cta = (value.cta && typeof value.cta === "object" ? value.cta : {}) as Partial<PartnerCtaContent>;

  const benefitsRaw = (value.benefits && typeof value.benefits === "object" ? value.benefits : {}) as Partial<
    PartnerTextSection & { items?: unknown }
  >;
  const stepsRaw = (value.steps && typeof value.steps === "object" ? value.steps : {}) as Partial<
    PartnerTextSection & { items?: unknown }
  >;

  return {
    sections: normalizeSections(value.sections),
    banner: normalizeBanner(value.banner, base.banner),
    directory: normalizeTextSection(value.directory, base.directory),
    benefits: {
      ...normalizeTextSection(benefitsRaw, base.benefits),
      items: Array.isArray(benefitsRaw.items)
        ? benefitsRaw.items
            .map((item) => {
              const entry = (item && typeof item === "object" ? item : {}) as Partial<PartnerBenefit>;
              return {
                emoji: str(entry.emoji, ""),
                title: str(entry.title, ""),
                description: str(entry.description, ""),
              };
            })
            .slice(0, 12)
        : base.benefits.items,
    },
    steps: {
      ...normalizeTextSection(stepsRaw, base.steps),
      items: Array.isArray(stepsRaw.items)
        ? stepsRaw.items
            .map((item) => {
              const entry = (item && typeof item === "object" ? item : {}) as Partial<PartnerStep>;
              return {
                title: str(entry.title, ""),
                description: str(entry.description, ""),
              };
            })
            .slice(0, 12)
        : base.steps.items,
    },
    cta: {
      title: str(cta.title, base.cta.title),
      description: str(cta.description, base.cta.description),
      primaryLabel: str(cta.primaryLabel, base.cta.primaryLabel),
      primaryHref: str(cta.primaryHref, base.cta.primaryHref),
      secondaryLabel: str(cta.secondaryLabel, base.cta.secondaryLabel),
      secondaryHref: str(cta.secondaryHref, base.cta.secondaryHref),
    },
  };
}