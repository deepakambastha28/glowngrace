"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import { fetchAdminCareerConfig, updateAdminCareerConfig } from "@/lib/api";
import {
  DEFAULT_CAREER_CONFIG,
  CAREER_SECTION_LABELS,
  normalizeCareerConfig,
  type CareerConfig,
  type CareerSectionKey,
  type CareerService,
  type CareerStep,
} from "@/lib/career-config";
import { ChevronDown, ChevronUp, Eye, EyeOff, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Preloader } from "@/components/preloader";

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
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
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function TextArea({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
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
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function TextSectionBody({
  keyPrefix,
  section,
  onChange,
  descriptionHint,
}: {
  keyPrefix: string;
  section: { eyebrow: string; title: string; description: string };
  onChange: (next: { eyebrow: string; title: string; description: string }) => void;
  descriptionHint?: string;
}) {
  return (
    <div className="grid gap-4">
      <Field
        id={`career-${keyPrefix}-eyebrow`}
        label="Eyebrow"
        value={section.eyebrow}
        onChange={(eyebrow) => onChange({ ...section, eyebrow })}
      />
      <Field
        id={`career-${keyPrefix}-title`}
        label="Heading"
        value={section.title}
        onChange={(nextTitle) => onChange({ ...section, title: nextTitle })}
      />
      <TextArea
        id={`career-${keyPrefix}-description`}
        label="Description"
        value={section.description}
        hint={descriptionHint}
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
  sectionKey: CareerSectionKey;
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
            data-testid={`career-section-restore-${sectionKey}`}
            onClick={onRestore}
            className="inline-flex items-center gap-1.5 rounded-full border-[1.6px] border-rose px-3 py-1.5 text-xs font-semibold text-rose transition-colors hover:bg-rose hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restore
          </button>
        ) : (
          <>
            <button
              type="button"
              data-testid={`career-section-toggle-${sectionKey}`}
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
              data-testid={`career-section-delete-${sectionKey}`}
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

function CareerConfigContent() {
  const [config, setConfig] = useState<CareerConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetchAdminCareerConfig().then((res) => {
      setConfig(normalizeCareerConfig(res.data?.config ?? DEFAULT_CAREER_CONFIG));
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateSection = (key: CareerSectionKey, patch: Partial<{ visible: boolean; deleted: boolean }>) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            sections: c.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)),
          }
        : c
    );
  };

  const toggleSection = (key: CareerSectionKey) => {
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

  const deleteSection = (key: CareerSectionKey) => {
    updateSection(key, { visible: false, deleted: true });
  };

  const restoreSection = (key: CareerSectionKey) => {
    updateSection(key, { visible: true, deleted: false });
  };

  const moveSection = (key: CareerSectionKey, dir: -1 | 1) => {
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

  const setService = (index: number, patch: Partial<CareerService>) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            services: {
              ...c.services,
              items: c.services.items.map((item, i) =>
                i === index ? { ...item, ...patch } : item
              ),
            },
          }
        : c
    );
  };

  const addService = () => {
    setConfig((c) =>
      c
        ? {
            ...c,
            services: { ...c.services, items: [...c.services.items, { emoji: "✨", title: "", description: "" }] },
          }
        : c
    );
  };

  const removeService = (index: number) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            services: { ...c.services, items: c.services.items.filter((_, i) => i !== index) },
          }
        : c
    );
  };

  const setStep = (index: number, patch: Partial<CareerStep>) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            steps: {
              ...c.steps,
              items: c.steps.items.map((item, i) =>
                i === index ? { ...item, ...patch } : item
              ),
            },
          }
        : c
    );
  };

  const addStep = () => {
    setConfig((c) =>
      c
        ? {
            ...c,
            steps: { ...c.steps, items: [...c.steps.items, { title: "", description: "" }] },
          }
        : c
    );
  };

  const removeStep = (index: number) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            steps: { ...c.steps, items: c.steps.items.filter((_, i) => i !== index) },
          }
        : c
    );
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    const res = await updateAdminCareerConfig(config);
    setSaving(false);
    if (res.ok) {
      toast.success("Career page configuration saved");
    } else {
      toast.error(res.data?.error || "Could not save configuration");
    }
  };

  if (!config) {
    return <Preloader />;
  }

  const sectionProps = (key: CareerSectionKey, index: number) => {
    const section = config.sections[index];
    return {
      sectionKey: key,
      label: CAREER_SECTION_LABELS[key],
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

  const sectionChildren: Record<CareerSectionKey, React.ReactNode> = {
    heading: (
      <TextSectionBody
        keyPrefix="heading"
        section={config.heading}
        descriptionHint='Use {{count}} to show the number of open positions, e.g. "{{count}} open positions".'
        onChange={(heading) => setConfig({ ...config, heading })}
      />
    ),
    services: (
      <>
        <TextSectionBody
          keyPrefix="services"
          section={config.services}
          onChange={(services) => setConfig({ ...config, services: { ...config.services, ...services } })}
        />
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-charcoal">Service cards</h4>
            <button
              type="button"
              data-testid="career-services-add"
              onClick={addService}
              className="inline-flex items-center gap-1 text-sm font-semibold text-rose"
            >
              <Plus className="h-4 w-4" /> Add service
            </button>
          </div>
          <div className="grid gap-6">
            {config.services.items.map((service, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-line p-4">
                <div className="flex gap-2">
                  <input
                    aria-label={`Service ${i + 1} emoji`}
                    data-testid={`career-services-emoji-${i}`}
                    className="field-input !w-20"
                    value={service.emoji}
                    placeholder="💼"
                    onChange={(e) => setService(i, { emoji: e.target.value })}
                  />
                  <input
                    aria-label={`Service ${i + 1} title`}
                    data-testid={`career-services-title-${i}`}
                    className="field-input"
                    value={service.title}
                    placeholder="Job Placement"
                    onChange={(e) => setService(i, { title: e.target.value })}
                  />
                  <button
                    type="button"
                    data-testid={`career-services-remove-${i}`}
                    aria-label={`Remove service ${i + 1}`}
                    onClick={() => removeService(i)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fdeaea] text-red hover:bg-red hover:text-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  aria-label={`Service ${i + 1} description`}
                  data-testid={`career-services-description-${i}`}
                  className="field-textarea"
                  rows={2}
                  value={service.description}
                  placeholder="We match certified beauticians with verified salons hiring in Lucknow."
                  onChange={(e) => setService(i, { description: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </>
    ),
    steps: (
      <>
        <TextSectionBody
          keyPrefix="steps"
          section={config.steps}
          onChange={(steps) => setConfig({ ...config, steps: { ...config.steps, ...steps } })}
        />
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-charcoal">Steps</h4>
            <button
              type="button"
              data-testid="career-steps-add"
              onClick={addStep}
              className="inline-flex items-center gap-1 text-sm font-semibold text-rose"
            >
              <Plus className="h-4 w-4" /> Add step
            </button>
          </div>
          <div className="grid gap-6">
            {config.steps.items.map((step, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-line p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-gradient text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <input
                    aria-label={`Step ${i + 1} title`}
                    data-testid={`career-steps-title-${i}`}
                    className="field-input"
                    value={step.title}
                    placeholder="Register"
                    onChange={(e) => setStep(i, { title: e.target.value })}
                  />
                  <button
                    type="button"
                    data-testid={`career-steps-remove-${i}`}
                    aria-label={`Remove step ${i + 1}`}
                    onClick={() => removeStep(i)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fdeaea] text-red hover:bg-red hover:text-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  aria-label={`Step ${i + 1} description`}
                  data-testid={`career-steps-description-${i}`}
                  className="field-textarea"
                  rows={2}
                  value={step.description}
                  placeholder="Create your profile & share your skills."
                  onChange={(e) => setStep(i, { description: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </>
    ),
    jobs: (
      <TextSectionBody
        keyPrefix="jobs"
        section={config.jobs}
        descriptionHint="The job list below this heading always renders all open positions."
        onChange={(jobs) => setConfig({ ...config, jobs })}
      />
    ),
    cta: (
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field
            id="career-cta-title"
            label="Heading"
            value={config.cta.title}
            onChange={(title) => setConfig({ ...config, cta: { ...config.cta, title } })}
          />
        </div>
        <div className="sm:col-span-2">
          <TextArea
            id="career-cta-description"
            label="Description"
            value={config.cta.description}
            onChange={(description) =>
              setConfig({ ...config, cta: { ...config.cta, description } })
            }
          />
        </div>
        <Field
          id="career-cta-primary-label"
          label="Primary button label"
          value={config.cta.primaryLabel}
          onChange={(primaryLabel) =>
            setConfig({ ...config, cta: { ...config.cta, primaryLabel } })
          }
        />
        <Field
          id="career-cta-primary-href"
          label="Primary button link"
          value={config.cta.primaryHref}
          onChange={(primaryHref) =>
            setConfig({ ...config, cta: { ...config.cta, primaryHref } })
          }
        />
        <Field
          id="career-cta-secondary-label"
          label="Secondary button label"
          value={config.cta.secondaryLabel}
          onChange={(secondaryLabel) =>
            setConfig({ ...config, cta: { ...config.cta, secondaryLabel } })
          }
        />
        <Field
          id="career-cta-secondary-href"
          label="Secondary button link"
          value={config.cta.secondaryHref}
          onChange={(secondaryHref) =>
            setConfig({ ...config, cta: { ...config.cta, secondaryHref } })
          }
        />
      </div>
    ),
  };

  return (
    <div data-testid="career-config-form">
      <AdminPageHead
        title="Career Page"
        subtitle="Configure each section independently. Hide, show, delete, or restore any section before saving. The job list content is managed from the Jobs section."
      />

      <div className="mb-6 flex justify-end">
        <button
          data-testid="career-config-save"
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

export default function AdminPagesCareerPage() {
  return (
    <AdminGuard>
      <CareerConfigContent />
    </AdminGuard>
  );
}