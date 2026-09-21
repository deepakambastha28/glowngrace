export const CAREER_SECTION_KEYS = [
  "heading",
  "services",
  "steps",
  "jobs",
  "cta",
] as const;

export type CareerSectionKey = (typeof CAREER_SECTION_KEYS)[number];

export const CAREER_SECTION_LABELS: Record<CareerSectionKey, string> = {
  heading: "Page Heading",
  services: "Career Services",
  steps: "How It Works",
  jobs: "Job Vacancies",
  cta: "CTA Banner",
};

export interface CareerTextSection {
  eyebrow: string;
  title: string;
  description: string;
}

export interface CareerService {
  emoji: string;
  title: string;
  description: string;
}

export interface CareerStep {
  title: string;
  description: string;
}

export interface CareerCtaContent {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export interface CareerSectionSetting {
  key: CareerSectionKey;
  visible: boolean;
  deleted: boolean;
}

export interface CareerConfig {
  sections: CareerSectionSetting[];
  heading: CareerTextSection;
  services: CareerTextSection & { items: CareerService[] };
  steps: CareerTextSection & { items: CareerStep[] };
  jobs: CareerTextSection;
  cta: CareerCtaContent;
}

export const DEFAULT_CAREER_CONFIG: CareerConfig = {
  sections: CAREER_SECTION_KEYS.map((key) => ({ key, visible: true, deleted: false })),
  heading: {
    eyebrow: "Careers",
    title: "Build Your Beauty Career With Us",
    description:
      "{{count}} open positions across Lucknow's premium salons — with training, growth and empowerment for every woman.",
  },
  services: {
    eyebrow: "Beauty Career Services",
    title: "Parlour Placement & Job Consultancy",
    description:
      "Connecting skilled beauty professionals with the finest parlours across Lucknow.",
    items: [
      {
        emoji: "💼",
        title: "Job Placement",
        description:
          "We match certified beauticians, stylists & makeup artists with verified salons hiring in Lucknow.",
      },
      {
        emoji: "🎓",
        title: "Skill Training",
        description:
          "Professional courses in makeup, hairstyling, skincare & nail art to boost your career.",
      },
      {
        emoji: "🏢",
        title: "Hire Talent",
        description:
          "Salon owners can post vacancies and access our pool of trained, verified professionals.",
      },
    ],
  },
  steps: {
    eyebrow: "How It Works",
    title: "Your Path to a Beauty Career",
    description:
      "Four simple steps from first registration to landing your dream beauty job.",
    items: [
      { title: "Register", description: "Create your profile & share your skills." },
      { title: "Get Matched", description: "We connect you with suitable openings." },
      { title: "Interview", description: "Attend interviews with our partner salons." },
      { title: "Get Hired", description: "Start your dream job with ongoing support." },
    ],
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
};

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeSections(raw: unknown): CareerSectionSetting[] {
  const provided = Array.isArray(raw) ? raw : [];
  const seen = new Set<CareerSectionKey>();
  const out: CareerSectionSetting[] = [];
  for (const entry of provided) {
    const key = (entry as { key?: unknown })?.key;
    if (
      typeof key === "string" &&
      (CAREER_SECTION_KEYS as readonly string[]).includes(key) &&
      !seen.has(key as CareerSectionKey)
    ) {
      const deleted = (entry as { deleted?: unknown }).deleted === true;
      seen.add(key as CareerSectionKey);
      out.push({
        key: key as CareerSectionKey,
        visible: (entry as { visible?: unknown }).visible !== false && !deleted,
        deleted,
      });
    }
  }
  for (const key of CAREER_SECTION_KEYS) {
    if (!seen.has(key)) out.push({ key, visible: false, deleted: true });
  }
  return out;
}

function normalizeTextSection(raw: unknown, fallback: CareerTextSection): CareerTextSection {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<CareerTextSection>;
  return {
    eyebrow: str(value.eyebrow, fallback.eyebrow),
    title: str(value.title, fallback.title),
    description: str(value.description, fallback.description),
  };
}

/** Merge a stored/partial config over the defaults, ignoring malformed values. */
export function normalizeCareerConfig(raw: unknown): CareerConfig {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<CareerConfig>;
  const base = DEFAULT_CAREER_CONFIG;
  const cta = (value.cta && typeof value.cta === "object" ? value.cta : {}) as Partial<CareerCtaContent>;

  const servicesRaw = (value.services && typeof value.services === "object" ? value.services : {}) as Partial<
    CareerTextSection & { items?: unknown }
  >;
  const stepsRaw = (value.steps && typeof value.steps === "object" ? value.steps : {}) as Partial<
    CareerTextSection & { items?: unknown }
  >;

  return {
    sections: normalizeSections(value.sections),
    heading: normalizeTextSection(value.heading, base.heading),
    services: {
      ...normalizeTextSection(servicesRaw, base.services),
      items: Array.isArray(servicesRaw.items)
        ? servicesRaw.items
            .map((item) => {
              const entry = (item && typeof item === "object" ? item : {}) as Partial<CareerService>;
              return {
                emoji: str(entry.emoji, ""),
                title: str(entry.title, ""),
                description: str(entry.description, ""),
              };
            })
            .slice(0, 12)
        : base.services.items,
    },
    steps: {
      ...normalizeTextSection(stepsRaw, base.steps),
      items: Array.isArray(stepsRaw.items)
        ? stepsRaw.items
            .map((item) => {
              const entry = (item && typeof item === "object" ? item : {}) as Partial<CareerStep>;
              return {
                title: str(entry.title, ""),
                description: str(entry.description, ""),
              };
            })
            .slice(0, 12)
        : base.steps.items,
    },
    jobs: normalizeTextSection(value.jobs, base.jobs),
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