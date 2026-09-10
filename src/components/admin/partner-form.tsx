"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAdminPartner, fetchAdminPartners, updateAdminPartner } from "@/lib/api";

const partnerEmojis = ["💇‍♀️", "💅", "🧖‍♀️", "💆‍♀️", "💄", "💈", "✨", "🌸", "🪞"];

export function PartnerForm({ id }: { id?: string }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState("Beauty Parlour");
  const [loc, setLoc] = useState("");
  const [emoji, setEmoji] = useState("💇‍♀️");
  const [rating, setRating] = useState("4.5");
  const [reviews, setReviews] = useState("0");
  const [estd, setEstd] = useState("2024");
  const [staff, setStaff] = useState("1");
  const [services, setServices] = useState("1");
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [errors, setErrors] = useState<{ name?: boolean }>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetchAdminPartners(id)
      .then((res) => {
        if (!active) return;
        const it = res.data?.item;
        if (!it) return;
        setName(it.name);
        setType(it.type || "Beauty Parlour");
        setLoc(it.loc || "");
        setEmoji(it.emoji || "💇‍♀️");
        setRating(String(it.rating));
        setReviews(String(it.reviews));
        setEstd(String(it.estd));
        setStaff(String(it.staff));
        setServices(String(it.services));
        setDescription(it.description || "");
        setTagsText(Array.isArray(it.tags) ? it.tags.join(", ") : "");
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: boolean } = {};
    if (!name.trim()) nextErrors.name = true;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      type,
      loc,
      emoji,
      gradient: "",
      rating,
      reviews,
      estd,
      staff,
      services,
      description,
      tags,
    };
    const res = id ? await updateAdminPartner(id, payload) : await createAdminPartner(payload);

    if (res.data?.persisted) {
      toast.success(id ? "Partner updated successfully ✓" : "Partner saved successfully ✓");
      router.push("/admin/partners");
    } else {
      toast.error("Could not save partner");
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{id ? "Edit Partner" : "Add New Partner"}</h1>
        <p className="mt-1 text-muted">{id ? "Update this partner's directory entry." : "Add a beauty parlour to the partner directory."}</p>
      </div>

      <form onSubmit={submit}>
        <fieldset disabled={loading} className="space-y-6 border-0 m-0 p-0 min-w-0"> 
        <div className="card !shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🖋️ Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="pn-name">
                Partner Name <span className="text-rose">*</span>
              </label>
              <input
                id="pn-name"
                className={`field-input ${errors.name ? "!border-red" : ""}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Blush Beauty Lounge"
              />
              {errors.name && <p className="mt-1 text-sm text-red">Please enter a partner name.</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="pn-type">Salon Type</label>
                <input
                  id="pn-type"
                  className="field-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g. Premium Unisex Salon"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="pn-loc">Locality / Area</label>
                <input
                  id="pn-loc"
                  className="field-input"
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  placeholder="e.g. Hazratganj"
                />
              </div>
            </div>
            <div>
              <label className="field-label">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {partnerEmojis.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`grid h-11 w-11 place-items-center rounded-[11px] border-[1.5px] text-xl transition ${
                      emoji === em
                        ? "border-rose bg-blush shadow-md shadow-rose/20"
                        : "border-line hover:border-rose-soft"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card !shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="field-label">Rating (0–5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="field-input"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="4.5"
              />
            </div>
            <div>
              <label className="field-label">Reviews</label>
              <input
                type="number"
                className="field-input"
                value={reviews}
                onChange={(e) => setReviews(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="field-label">Established</label>
              <input
                type="number"
                className="field-input"
                value={estd}
                onChange={(e) => setEstd(e.target.value)}
                placeholder="2024"
              />
            </div>
            <div>
              <label className="field-label">Staff</label>
              <input
                type="number"
                className="field-input"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <label className="field-label">Services</label>
              <input
                type="number"
                className="field-input"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="field-label">Tags</label>
            <input
              className="field-input"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Comma separated — e.g. Bridal, Facials, Hair Spa"
            />
          </div>
        </div>

        <div className="card !shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">📝 Description</h3>
          <textarea
            className="field-textarea min-h-[110px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={"Describe the parlour, specialities and vibe..."}
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/partners")} className="btn-outline flex-1 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
            {saving ? "Saving…" : "Save Partner"}
          </button>
        </div>
        </fieldset>
      </form>
    </div>
  );
}