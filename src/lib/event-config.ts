export const EVENT_SECTION_KEYS = [
  "banner",
  "carousel",
  "heading",
] as const;

export type EventSectionKey = (typeof EVENT_SECTION_KEYS)[number];

export const EVENT_SECTION_LABELS: Record<EventSectionKey, string> = {
  banner: "Banner",
  carousel: "Featured Carousel",
  heading: "Events Listing",
};

export interface EventBannerContent {
  images: string[];
  title: string;
  subtitle: string;
}

export interface EventTextSection {
  eyebrow: string;
  title: string;
  description: string;
}

export interface EventSectionSetting {
  key: EventSectionKey;
  visible: boolean;
  deleted: boolean;
}

export interface EventConfig {
  sections: EventSectionSetting[];
  banner: EventBannerContent;
  heading: EventTextSection;
}

export const EVENT_BANNER_MAX_IMAGES = 5;

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  sections: EVENT_SECTION_KEYS.map((key) => ({ key, visible: true, deleted: false })),
  banner: {
    images: [],
    title: "Glow & Grace Events",
    subtitle: "Exclusive workshops, masterclasses and launches — every month across Lucknow.",
  },
  heading: {
    eyebrow: "Happenings in Lucknow",
    title: "Events",
    description:
      "Masterclasses, workshops, launches and meetups hosted by Glow & Grace and our partner parlours across Lucknow.",
  },
};

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeSections(raw: unknown): EventSectionSetting[] {
  const provided = Array.isArray(raw) ? raw : [];
  const seen = new Set<EventSectionKey>();
  const out: EventSectionSetting[] = [];
  for (const entry of provided) {
    const key = (entry as { key?: unknown })?.key;
    if (
      typeof key === "string" &&
      (EVENT_SECTION_KEYS as readonly string[]).includes(key) &&
      !seen.has(key as EventSectionKey)
    ) {
      const deleted = (entry as { deleted?: unknown }).deleted === true;
      seen.add(key as EventSectionKey);
      out.push({
        key: key as EventSectionKey,
        visible: (entry as { visible?: unknown }).visible !== false && !deleted,
        deleted,
      });
    }
  }
  for (const key of EVENT_SECTION_KEYS) {
    if (!seen.has(key)) out.push({ key, visible: false, deleted: true });
  }
  return out;
}

function normalizeTextSection(raw: unknown, fallback: EventTextSection): EventTextSection {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<EventTextSection>;
  return {
    eyebrow: str(value.eyebrow, fallback.eyebrow),
    title: str(value.title, fallback.title),
    description: str(value.description, fallback.description),
  };
}

function normalizeBanner(raw: unknown, fallback: EventBannerContent): EventBannerContent {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<EventBannerContent>;
  const images = Array.isArray(value.images)
    ? value.images.filter((src): src is string => typeof src === "string" && src.length > 0)
    : [];
  return {
    images: images.slice(0, EVENT_BANNER_MAX_IMAGES),
    title: str(value.title, fallback.title),
    subtitle: str(value.subtitle, fallback.subtitle),
  };
}

/** Merge a stored/partial config over the defaults, ignoring malformed values. */
export function normalizeEventConfig(raw: unknown): EventConfig {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<EventConfig>;
  const base = DEFAULT_EVENT_CONFIG;
  return {
    sections: normalizeSections(value.sections),
    banner: normalizeBanner(value.banner, base.banner),
    heading: normalizeTextSection(value.heading, base.heading),
  };
}