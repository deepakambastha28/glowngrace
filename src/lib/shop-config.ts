export const SHOP_SECTION_KEYS = [
  "banner",
  "heading",
  "categories",
] as const;

export type ShopSectionKey = (typeof SHOP_SECTION_KEYS)[number];

export const SHOP_SECTION_LABELS: Record<ShopSectionKey, string> = {
  banner: "Banner",
  heading: "Page Heading",
  categories: "Category Chips",
};

export interface ShopBannerContent {
  images: string[];
  title: string;
  subtitle: string;
}

export interface ShopHeadingContent {
  eyebrow: string;
  title: string;
  description: string;
}

export interface ShopSectionSetting {
  key: ShopSectionKey;
  visible: boolean;
  deleted: boolean;
}

export interface ShopConfig {
  sections: ShopSectionSetting[];
  banner: ShopBannerContent;
  heading: ShopHeadingContent;
  categories: string[];
}

export const SHOP_BANNER_MAX_IMAGES = 5;

export const DEFAULT_SHOP_CONFIG: ShopConfig = {
  sections: SHOP_SECTION_KEYS.map((key) => ({ key, visible: true, deleted: false })),
  banner: {
    images: [],
    title: "Glow & Grace Cosmetics",
    subtitle: "Premium beauty products, authentic & affordable — delivered across Lucknow.",
  },
  heading: {
    eyebrow: "Product Collection",
    title: "Explore Our Curated Beauty Range",
    description: "{{count}} premium products — authentic, affordable, Love Lucknow.",
  },
  categories: [],
};

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeSections(raw: unknown): ShopSectionSetting[] {
  const provided = Array.isArray(raw) ? raw : [];
  const seen = new Set<ShopSectionKey>();
  const out: ShopSectionSetting[] = [];
  for (const entry of provided) {
    const key = (entry as { key?: unknown })?.key;
    if (
      typeof key === "string" &&
      (SHOP_SECTION_KEYS as readonly string[]).includes(key) &&
      !seen.has(key as ShopSectionKey)
    ) {
      const deleted = (entry as { deleted?: unknown }).deleted === true;
      seen.add(key as ShopSectionKey);
      out.push({
        key: key as ShopSectionKey,
        visible: (entry as { visible?: unknown }).visible !== false && !deleted,
        deleted,
      });
    }
  }
  for (const key of SHOP_SECTION_KEYS) {
    if (!seen.has(key)) out.push({ key, visible: false, deleted: true });
  }
  return out;
}

function normalizeHeading(raw: unknown, fallback: ShopHeadingContent): ShopHeadingContent {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<ShopHeadingContent>;
  return {
    eyebrow: str(value.eyebrow, fallback.eyebrow),
    title: str(value.title, fallback.title),
    description: str(value.description, fallback.description),
  };
}

/** Merge a stored/partial config over the defaults, ignoring malformed values. */
export function normalizeShopConfig(raw: unknown): ShopConfig {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<ShopConfig>;
  const base = DEFAULT_SHOP_CONFIG;
  const banner = (value.banner && typeof value.banner === "object" ? value.banner : {}) as Partial<ShopBannerContent>;

  const legacyImage = str((banner as { image?: unknown }).image, "");
  const images = Array.isArray(banner.images)
    ? banner.images.filter((src): src is string => typeof src === "string" && src.length > 0)
    : legacyImage
    ? [legacyImage]
    : [];

  return {
    sections: normalizeSections(value.sections),
    banner: {
      images: images.slice(0, SHOP_BANNER_MAX_IMAGES),
      title: str(banner.title, base.banner.title),
      subtitle: str(banner.subtitle, base.banner.subtitle),
    },
    heading: normalizeHeading(value.heading, base.heading),
    categories: Array.isArray(value.categories)
      ? value.categories.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      : base.categories,
  };
}