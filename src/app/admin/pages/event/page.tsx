"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import { fetchAdminEventConfig, updateAdminEventConfig } from "@/lib/api";
import {
  DEFAULT_EVENT_CONFIG,
  EVENT_BANNER_MAX_IMAGES,
  EVENT_SECTION_LABELS,
  normalizeEventConfig,
  type EventConfig,
  type EventSectionKey,
} from "@/lib/event-config";
import { ChevronDown, ChevronUp, Eye, EyeOff, ImagePlus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Preloader } from "@/components/preloader";

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        data-testid={id}
        className="field-input mt-1.5"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextArea({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        data-testid={id}
        className="field-textarea mt-1.5"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextSectionBody({
  keyPrefix,
  section,
  onChange,
}: {
  keyPrefix: string;
  section: { eyebrow: string; title: string; description: string };
  onChange: (next: { eyebrow: string; title: string; description: string }) => void;
}) {
  return (
    <div className="grid gap-4">
      <Field
        id={`event-${keyPrefix}-eyebrow`}
        label="Eyebrow"
        value={section.eyebrow}
        onChange={(eyebrow) => onChange({ ...section, eyebrow })}
      />
      <Field
        id={`event-${keyPrefix}-title`}
        label="Heading"
        value={section.title}
        onChange={(nextTitle) => onChange({ ...section, title: nextTitle })}
      />
      <TextArea
        id={`event-${keyPrefix}-description`}
        label="Description"
        value={section.description}
        onChange={(description) => onChange({ ...section, description })}
      />
    </div>
  );
}

function SectionCard({
  sectionKey,
  label,
  visible,
  deleted,
  index,
  count,
  onMoveUp,
  onMoveDown,
  onToggle,
  onDelete,
  onRestore,
  children,
}: {
  sectionKey: EventSectionKey;
  label: string;
  visible: boolean;
  deleted: boolean;
  index: number;
  count: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onRestore: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!deleted);

  return (
    <div className="card !shadow-lg mb-6">
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label={`Move ${label} up`}
            className="text-muted hover:text-rose disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === count - 1}
            aria-label={`Move ${label} down`}
            className="text-muted hover:text-rose disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!deleted) setOpen((o) => !o);
          }}
          className="flex flex-1 items-center gap-2 text-left"
          aria-expanded={deleted ? false : open}
        >
          <span className="font-semibold text-charcoal">{label}</span>
          {deleted ? (
            <span className="rounded-full bg-[#f1f1f4] px-2.5 py-0.5 text-xs font-semibold text-muted">
              Deleted
            </span>
          ) : !visible ? (
            <span className="rounded-full bg-amber/10 px-2.5 py-0.5 text-xs font-semibold text-amber">
              Hidden
            </span>
          ) : null}
        </button>

        {deleted ? (
          <button
            type="button"
            data-testid={`event-section-restore-${sectionKey}`}
            onClick={onRestore}
            className="inline-flex items-center gap-1.5 rounded-full border-[1.6px] border-rose px-3 py-1.5 text-xs font-semibold text-rose transition-colors hover:bg-rose hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restore
          </button>
        ) : (
          <>
            <button
              type="button"
              data-testid={`event-section-toggle-${sectionKey}`}
              onClick={onToggle}
              aria-pressed={visible}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                visible ? "bg-emerald/15 text-emerald" : "bg-[#f1f1f4] text-muted"
              }`}
            >
              {visible ? (
                <>
                  <Eye className="h-3.5 w-3.5" /> Visible
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" /> Hidden
                </>
              )}
            </button>
            <button
              type="button"
              data-testid={`event-section-delete-${sectionKey}`}
              onClick={onDelete}
              aria-label={`Delete ${label} section`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#fdeaea] px-3 py-1.5 text-xs font-semibold text-red transition-colors hover:bg-red hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </>
        )}
      </div>

      {open && !deleted && <div className="grid gap-4 px-6 pb-6">{children}</div>}
    </div>
  );
}

function EventConfigContent() {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetchAdminEventConfig().then((res) => {
      setConfig(normalizeEventConfig(res.data?.config ?? DEFAULT_EVENT_CONFIG));
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateSection = (key: EventSectionKey, patch: Partial<{ visible: boolean; deleted: boolean }>) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            sections: c.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)),
          }
        : c
    );
  };

  const toggleSection = (key: EventSectionKey) => {
    setConfig((c) => {
      if (!c) return c;
      const section = c.sections.find((s) => s.key === key);
      if (!section || section.deleted) return c;
      return {
        ...c,
        sections: c.sections.map((s) =>
          s.key === key ? { ...s, visible: !s.visible } : s
        ),
      };
    });
  };

  const deleteSection = (key: EventSectionKey) => {
    updateSection(key, { visible: false, deleted: true });
  };

  const restoreSection = (key: EventSectionKey) => {
    updateSection(key, { visible: true, deleted: false });
  };

  const moveSection = (key: EventSectionKey, dir: -1 | 1) => {
    setConfig((c) => {
      if (!c) return c;
      const idx = c.sections.findIndex((s) => s.key === key);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= c.sections.length) return c;
      const next = c.sections.slice();
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...c, sections: next };
    });
  };

  const handleBannerUpload = (list: FileList | null) => {
    if (!config) return;
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      toast.warning("Only image files are allowed");
      return;
    }
    const remaining = EVENT_BANNER_MAX_IMAGES - config.banner.images.length;
    if (remaining <= 0) {
      toast.warning(`You can add up to ${EVENT_BANNER_MAX_IMAGES} banner images`);
      return;
    }
    if (files.length > remaining) {
      toast.warning(`You can add up to ${EVENT_BANNER_MAX_IMAGES} banner images (${remaining} left)`);
    }
    const accepted = files.slice(0, remaining);
    if (accepted.some((f) => f.size > 8 * 1024 * 1024)) {
      toast.warning("One or more banner images exceed 8MB");
      return;
    }
    const readers = accepted.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(String(e.target?.result ?? ""));
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((dataUrls) =>
      setConfig((c) =>
        c
          ? {
              ...c,
              banner: {
                ...c.banner,
                images: [...c.banner.images, ...dataUrls].slice(0, EVENT_BANNER_MAX_IMAGES),
              },
            }
          : c
      )
    );
  };

  const removeBannerImage = (index: number) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            banner: {
              ...c.banner,
              images: c.banner.images.filter((_, i) => i !== index),
            },
          }
        : c
    );
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    const res = await updateAdminEventConfig(config);
    setSaving(false);
    if (res.ok) {
      toast.success("Events page configuration saved");
    } else {
      toast.error(res.data?.error || "Could not save configuration");
    }
  };

  if (!config) {
    return <Preloader />;
  }

  const sectionProps = (key: EventSectionKey, index: number) => {
    const section = config.sections[index];
    return {
      sectionKey: key,
      label: EVENT_SECTION_LABELS[key],
      visible: section.visible,
      deleted: section.deleted,
      index,
      count: config.sections.length,
      onMoveUp: () => moveSection(key, -1),
      onMoveDown: () => moveSection(key, 1),
      onToggle: () => toggleSection(key),
      onDelete: () => deleteSection(key),
      onRestore: () => restoreSection(key),
    };
  };

  const sectionChildren: Record<EventSectionKey, React.ReactNode> = {
    banner: (
      <>
        <div>
          <label className="field-label">
            Banner Images&nbsp;
            <span className="text-muted">({config.banner.images.length}/{EVENT_BANNER_MAX_IMAGES})</span>
          </label>
          <p className="mb-2 text-xs text-muted">
            Shown at the top of the events page as a rotating slideshow. Upload up to{" "}
            <b>{EVENT_BANNER_MAX_IMAGES} images</b> — recommended size <b>1920 × 460 px</b>{" "}
            (wide landscape, ~4:1 ratio, min width 1200 px, max 8MB each). Leave empty to use the
            default gradient banner.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {config.banner.images.map((src, index) => (
              <div
                key={index}
                className="relative h-32 w-full overflow-hidden rounded-xl border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Banner image ${index + 1}`}
                  data-testid="event-banner-image-preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeBannerImage(index)}
                  aria-label={`Remove banner image ${index + 1}`}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-red"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {config.banner.images.length < EVENT_BANNER_MAX_IMAGES && (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-soft bg-blush px-4 py-6 text-muted transition hover:border-rose">
                <ImagePlus className="h-5 w-5 text-rose" />
                <span className="text-sm font-semibold text-rose">
                  {config.banner.images.length === 0 ? "Upload banner image" : "Add banner image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  data-testid="event-banner-image-upload"
                  className="hidden"
                  onChange={(e) => {
                    handleBannerUpload(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        </div>
        <Field
          id="event-banner-title"
          label="Banner title"
          value={config.banner.title}
          onChange={(title) => setConfig({ ...config, banner: { ...config.banner, title } })}
        />
        <Field
          id="event-banner-subtitle"
          label="Banner subtitle"
          value={config.banner.subtitle}
          onChange={(subtitle) =>
            setConfig({ ...config, banner: { ...config.banner, subtitle } })
          }
        />
      </>
    ),
    carousel: (
      <p className="text-sm text-muted">
        The featured events carousel at the top of the page. It always shows the
        four soonest events from the Events section. You can only show, hide,
        delete, or restore it.
      </p>
    ),
    heading: (
      <TextSectionBody
        keyPrefix="heading"
        section={config.heading}
        onChange={(heading) => setConfig({ ...config, heading })}
      />
    ),
  };

  return (
    <div data-testid="event-config-form">
      <AdminPageHead
        title="Events Page"
        subtitle="Configure each section independently. Hide, show, delete, or restore any section before saving. The event listing content is managed from the Events section."
      />

      <div className="mb-6 flex justify-end">
        <button
          data-testid="event-config-save"
          onClick={save}
          disabled={saving}
          className="btn-primary text-sm disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {config.sections.map((section, index) => (
        <SectionCard key={section.key} {...sectionProps(section.key, index)}>
          {sectionChildren[section.key]}
        </SectionCard>
      ))}

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary text-sm disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default function AdminPagesEventPage() {
  return (
    <AdminGuard>
      <EventConfigContent />
    </AdminGuard>
  );
}