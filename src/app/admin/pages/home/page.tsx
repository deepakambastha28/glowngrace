"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import { fetchAdminHomeConfig, updateAdminHomeConfig } from "@/lib/api";
import {
  DEFAULT_HOME_CONFIG,
  HOME_SECTION_LABELS,
  normalizeHomeConfig,
  type HomeConfig,
  type HomeSectionKey,
} from "@/lib/home-config";
import { ChevronDown, ChevronUp, Eye, EyeOff, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
        id={`home-${keyPrefix}-eyebrow`}
        label="Eyebrow"
        value={section.eyebrow}
        onChange={(eyebrow) => onChange({ ...section, eyebrow })}
      />
      <Field
        id={`home-${keyPrefix}-title`}
        label="Heading"
        value={section.title}
        onChange={(nextTitle) => onChange({ ...section, title: nextTitle })}
      />
      <TextArea
        id={`home-${keyPrefix}-description`}
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
  sectionKey: HomeSectionKey;
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
            data-testid={`home-section-restore-${sectionKey}`}
            onClick={onRestore}
            className="inline-flex items-center gap-1.5 rounded-full border-[1.6px] border-rose px-3 py-1.5 text-xs font-semibold text-rose transition-colors hover:bg-rose hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restore
          </button>
        ) : (
          <>
            <button
              type="button"
              data-testid={`home-section-toggle-${sectionKey}`}
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
              data-testid={`home-section-delete-${sectionKey}`}
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

function HomeConfigContent() {
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetchAdminHomeConfig().then((res) => {
      setConfig(normalizeHomeConfig(res.data?.config ?? DEFAULT_HOME_CONFIG));
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateSection = (key: HomeSectionKey, patch: Partial<{ visible: boolean; deleted: boolean }>) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            sections: c.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)),
          }
        : c
    );
  };

  const toggleSection = (key: HomeSectionKey) => {
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

  const deleteSection = (key: HomeSectionKey) => {
    updateSection(key, { visible: false, deleted: true });
  };

  const restoreSection = (key: HomeSectionKey) => {
    updateSection(key, { visible: true, deleted: false });
  };

  const moveSection = (key: HomeSectionKey, dir: -1 | 1) => {
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

  const save = async () => {
    if (!config) return;
    setSaving(true);
    const res = await updateAdminHomeConfig(config);
    setSaving(false);
    if (res.ok) {
      toast.success("Home page configuration saved");
    } else {
      toast.error(res.data?.error || "Could not save configuration");
    }
  };

  if (!config) {
    return <div className="text-sm text-muted">Loading…</div>;
  }

  const hero = config.hero;

  const sectionProps = (key: HomeSectionKey, index: number) => {
    const section = config.sections[index];
    return {
      sectionKey: key,
      label: HOME_SECTION_LABELS[key],
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

  const sectionChildren: Record<HomeSectionKey, React.ReactNode> = {
    hero: (
      <>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            id="home-hero-eyebrow"
            label="Eyebrow"
            value={hero.eyebrow}
            onChange={(eyebrow) => setConfig({ ...config, hero: { ...hero, eyebrow } })}
          />
          <Field
            id="home-hero-title-highlight"
            label="Highlighted word"
            value={hero.titleHighlight}
            onChange={(titleHighlight) =>
              setConfig({ ...config, hero: { ...hero, titleHighlight } })
            }
          />
          <div className="sm:col-span-2">
            <Field
              id="home-hero-title"
              label="Headline"
              value={hero.title}
              onChange={(title) => setConfig({ ...config, hero: { ...hero, title } })}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              id="home-hero-description"
              label="Description"
              value={hero.description}
              onChange={(description) =>
                setConfig({ ...config, hero: { ...hero, description } })
              }
            />
          </div>
          <Field
            id="home-hero-primary-label"
            label="Primary button label"
            value={hero.primaryLabel}
            onChange={(primaryLabel) =>
              setConfig({ ...config, hero: { ...hero, primaryLabel } })
            }
          />
          <Field
            id="home-hero-primary-href"
            label="Primary button link"
            value={hero.primaryHref}
            onChange={(primaryHref) =>
              setConfig({ ...config, hero: { ...hero, primaryHref } })
            }
          />
          <Field
            id="home-hero-secondary-label"
            label="Secondary button label"
            value={hero.secondaryLabel}
            onChange={(secondaryLabel) =>
              setConfig({ ...config, hero: { ...hero, secondaryLabel } })
            }
          />
          <Field
            id="home-hero-secondary-href"
            label="Secondary button link"
            value={hero.secondaryHref}
            onChange={(secondaryHref) =>
              setConfig({ ...config, hero: { ...hero, secondaryHref } })
            }
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-charcoal">Stats</h4>
            <button
              type="button"
              data-testid="home-stat-add"
              onClick={() =>
                setConfig({
                  ...config,
                  hero: { ...hero, stats: [...hero.stats, { value: "", label: "" }] },
                })
              }
              className="inline-flex items-center gap-1 text-sm font-semibold text-rose"
            >
              <Plus className="h-4 w-4" /> Add stat
            </button>
          </div>
          <div className="grid gap-3">
            {hero.stats.map((stat, i) => (
              <div key={i} className="flex gap-2">
                <input
                  aria-label={`Stat ${i + 1} value`}
                  className="field-input"
                  value={stat.value}
                  placeholder="5000+"
                  onChange={(e) => {
                    const stats = hero.stats.slice();
                    stats[i] = { ...stats[i], value: e.target.value };
                    setConfig({ ...config, hero: { ...hero, stats } });
                  }}
                />
                <input
                  aria-label={`Stat ${i + 1} label`}
                  className="field-input"
                  value={stat.label}
                  placeholder="Happy Customers"
                  onChange={(e) => {
                    const stats = hero.stats.slice();
                    stats[i] = { ...stats[i], label: e.target.value };
                    setConfig({ ...config, hero: { ...hero, stats } });
                  }}
                />
                <button
                  type="button"
                  aria-label={`Remove stat ${i + 1}`}
                  onClick={() =>
                    setConfig({
                      ...config,
                      hero: { ...hero, stats: hero.stats.filter((_, idx) => idx !== i) },
                    })
                  }
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fdeaea] text-red hover:bg-red hover:text-white transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-charcoal">Trust bar</h4>
            <button
              type="button"
              data-testid="home-trust-add"
              onClick={() =>
                setConfig({
                  ...config,
                  hero: { ...hero, trust: [...hero.trust, { emoji: "", text: "" }] },
                })
              }
              className="inline-flex items-center gap-1 text-sm font-semibold text-rose"
            >
              <Plus className="h-4 w-4" /> Add item
            </button>
          </div>
          <div className="grid gap-3">
            {hero.trust.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  aria-label={`Trust ${i + 1} emoji`}
                  className="field-input !w-20"
                  value={item.emoji}
                  placeholder="🚚"
                  onChange={(e) => {
                    const trust = hero.trust.slice();
                    trust[i] = { ...trust[i], emoji: e.target.value };
                    setConfig({ ...config, hero: { ...hero, trust } });
                  }}
                />
                <input
                  aria-label={`Trust ${i + 1} text`}
                  className="field-input"
                  value={item.text}
                  placeholder="Free Delivery in Lucknow"
                  onChange={(e) => {
                    const trust = hero.trust.slice();
                    trust[i] = { ...trust[i], text: e.target.value };
                    setConfig({ ...config, hero: { ...hero, trust } });
                  }}
                />
                <button
                  type="button"
                  aria-label={`Remove trust item ${i + 1}`}
                  onClick={() =>
                    setConfig({
                      ...config,
                      hero: { ...hero, trust: hero.trust.filter((_, idx) => idx !== i) },
                    })
                  }
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fdeaea] text-red hover:bg-red hover:text-white transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </>
    ),
    categories: (
      <TextSectionBody
        keyPrefix="categories"
        section={config.categories}
        onChange={(categories) => setConfig({ ...config, categories })}
      />
    ),
    bestsellers: (
      <TextSectionBody
        keyPrefix="bestsellers"
        section={config.bestsellers}
        onChange={(bestsellers) => setConfig({ ...config, bestsellers })}
      />
    ),
    partners: (
      <TextSectionBody
        keyPrefix="partners"
        section={config.partners}
        onChange={(partners) => setConfig({ ...config, partners })}
      />
    ),
    jobs: (
      <TextSectionBody
        keyPrefix="jobs"
        section={config.jobs}
        onChange={(jobs) => setConfig({ ...config, jobs })}
      />
    ),
    cta: (
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field
            id="home-cta-title"
            label="Heading"
            value={config.cta.title}
            onChange={(title) => setConfig({ ...config, cta: { ...config.cta, title } })}
          />
        </div>
        <div className="sm:col-span-2">
          <TextArea
            id="home-cta-description"
            label="Description"
            value={config.cta.description}
            onChange={(description) =>
              setConfig({ ...config, cta: { ...config.cta, description } })
            }
          />
        </div>
        <Field
          id="home-cta-primary-label"
          label="Primary button label"
          value={config.cta.primaryLabel}
          onChange={(primaryLabel) =>
            setConfig({ ...config, cta: { ...config.cta, primaryLabel } })
          }
        />
        <Field
          id="home-cta-primary-href"
          label="Primary button link"
          value={config.cta.primaryHref}
          onChange={(primaryHref) =>
            setConfig({ ...config, cta: { ...config.cta, primaryHref } })
          }
        />
        <Field
          id="home-cta-secondary-label"
          label="Secondary button label"
          value={config.cta.secondaryLabel}
          onChange={(secondaryLabel) =>
            setConfig({ ...config, cta: { ...config.cta, secondaryLabel } })
          }
        />
        <Field
          id="home-cta-secondary-href"
          label="Secondary button link"
          value={config.cta.secondaryHref}
          onChange={(secondaryHref) =>
            setConfig({ ...config, cta: { ...config.cta, secondaryHref } })
          }
        />
      </div>
    ),
    testimonials: (
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          id="home-testimonials-eyebrow"
          label="Eyebrow"
          value={config.testimonials.eyebrow}
          onChange={(eyebrow) =>
            setConfig({ ...config, testimonials: { ...config.testimonials, eyebrow } })
          }
        />
        <Field
          id="home-testimonials-title"
          label="Heading"
          value={config.testimonials.title}
          onChange={(title) =>
            setConfig({ ...config, testimonials: { ...config.testimonials, title } })
          }
        />
      </div>
    ),
  };

  return (
    <div data-testid="home-config-form">
      <AdminPageHead
        title="Home Page"
        subtitle="Configure each section independently. Hide, show, delete, or restore any section before saving."
      />

      <div className="mb-6 flex justify-end">
        <button
          data-testid="home-config-save"
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

export default function AdminPagesHomePage() {
  return (
    <AdminGuard>
      <HomeConfigContent />
    </AdminGuard>
  );
}