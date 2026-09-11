"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAdminEvent, fetchAdminEvents, updateAdminEvent } from "@/lib/api";

const emojis = ["🎉", "💄", "👰", "🧴", "💇‍♀️", "💅", "💍", "🎪", "💋", "✨", "🎨", "📸"];
const gradients = [
  "linear-gradient(135deg,#d6336c,#f4a6c0)",
  "linear-gradient(135deg,#c9a35b,#d6336c)",
  "linear-gradient(135deg,#2e9e6b,#a8e0c5)",
  "linear-gradient(135deg,#3b82c9,#a8c9f0)",
  "linear-gradient(135deg,#c9a35b,#f0d9a8)",
  "linear-gradient(135deg,#b02a5b,#f4a6c0)",
  "linear-gradient(135deg,#8a1f47,#d6336c)",
];

const LOCATIONS = ["Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar", "Vibhuti Khand", "Mahanagar"];

export function EventForm({ id }: { id?: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Workshop");
  const [emoji, setEmoji] = useState("🎉");
  const [gradient, setGradient] = useState(gradients[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [loc, setLoc] = useState("");
  const [venue, setVenue] = useState("");
  const [price, setPrice] = useState("Free");
  const [capacity, setCapacity] = useState("50");
  const [spotsLeft, setSpotsLeft] = useState("50");
  const [description, setDescription] = useState("");
  const [agendaText, setAgendaText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetchAdminEvents(id)
      .then((res) => {
        if (!active) return;
        const it = res.data?.item;
        if (!it) return;
        setTitle(it.title);
        setCategory(it.category);
        setEmoji(it.emoji);
        setGradient(it.gradient);
        setDate(it.date);
        setTime(it.time);
        setLoc(it.loc);
        setVenue(it.venue);
        setPrice(it.price);
        setCapacity(String(it.capacity));
        setSpotsLeft(String(it.spotsLeft));
        setDescription(it.description);
        setAgendaText(Array.isArray(it.agenda) ? it.agenda.join("\n") : "");
        setTags(Array.isArray(it.tags) ? it.tags : []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const addTag = () => {
    const v = tagInput.trim().replace(/,/g, "");
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagInput("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, boolean> = {
      title: !title.trim(),
      date: !date,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    const agenda = agendaText
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      category,
      emoji,
      gradient,
      date,
      time,
      loc,
      venue,
      price,
      capacity: parseInt(capacity) || 50,
      spotsLeft: parseInt(spotsLeft) || parseInt(capacity) || 50,
      description,
      agenda,
      tags,
    };
    const res = id ? await updateAdminEvent(id, payload) : await createAdminEvent(payload);
    setSaving(false);

    if (res.ok) {
      toast.success(
        res.data?.persisted
          ? id
            ? "Event updated successfully ✓"
            : "Event saved successfully ✓"
          : "Event saved (database not configured — demo only)"
      );
      router.push("/admin/events");
    } else {
      toast.error("Could not save event");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="text-sm text-muted mb-1">
          Dashboard / Events / <span className="text-rose font-semibold">{id ? "Edit Event" : "Add Event"}</span>
        </div>
        <h1 className="text-3xl font-bold">{id ? "Edit Event" : "Add New Event"}</h1>
        <p className="mt-1 text-muted">
          {id ? "Update your event details." : "Create a new beauty event or workshop."}
        </p>
      </div>

      <form onSubmit={submit}>
        <fieldset
          disabled={loading}
          className="grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start border-0 m-0 p-0 min-w-0"
        >
          <div className="space-y-6">
            {/* Basic info */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🎉 Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="field-label">
                    Event Title <span className="text-rose">*</span>
                  </label>
                  <input
                    className={`field-input ${errors.title ? "!border-red" : ""}`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Festive Makeup Masterclass"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red">Please enter an event title.</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Category</label>
                    <input
                      className="field-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Workshop, Masterclass, Expo"
                    />
                  </div>
                  <div>
                    <label className="field-label">Price</label>
                    <input
                      className="field-input"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Free or ₹499"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📅 Schedule &amp; Venue</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="field-label">
                    Date <span className="text-rose">*</span>
                  </label>
                  <input
                    type="date"
                    className={`field-input ${errors.date ? "!border-red" : ""}`}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red">Please select a date.</p>}
                </div>
                <div>
                  <label className="field-label">Time</label>
                  <input
                    className="field-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:00 AM"
                  />
                </div>
                <div>
                  <label className="field-label">Location</label>
                  <select className="field-input" value={loc} onChange={(e) => setLoc(e.target.value)}>
                    <option value="">Select location</option>
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Venue</label>
                  <input
                    className="field-input"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Glow & Grace Studio, Aliganj"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="field-label">Total Capacity</label>
                  <input
                    type="number"
                    className="field-input"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="field-label">Spots Left</label>
                  <input
                    type="number"
                    className="field-input"
                    value={spotsLeft}
                    onChange={(e) => setSpotsLeft(e.target.value)}
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            {/* Description & Agenda */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📝 Description &amp; Agenda</h3>
              <div className="space-y-4">
                <div>
                  <label className="field-label">Event Description</label>
                  <textarea
                    className="field-textarea min-h-[100px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the event, what attendees will learn, and why they should attend..."
                  />
                </div>
                <div>
                  <label className="field-label">Agenda Items</label>
                  <textarea
                    className="field-textarea min-h-[90px]"
                    value={agendaText}
                    onChange={(e) => setAgendaText(e.target.value)}
                    placeholder={"One per line — e.g.\nSkin prep for long-lasting festive makeup\nBase & contouring fundamentals\nFestive eye looks: smokey & shimmer"}
                  />
                  <p className="mt-1 text-xs text-muted">One item per line — these appear as the event agenda.</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🏷️ Tags</h3>
              <div className="flex gap-2">
                <input
                  className="field-input flex-1"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Type a tag and press Enter"
                />
                <button type="button" onClick={addTag} className="btn-outline text-sm">
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-blush px-3 py-1 text-sm font-medium text-rose"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                        className="ml-0.5 text-rose/60 hover:text-rose"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side preview */}
          <div className="space-y-6 lg:sticky lg:top-6">
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <div
                className="rounded-[14px] p-6 text-center text-white min-h-[160px] flex flex-col items-center justify-center"
                style={{ background: gradient }}
              >
                <span className="text-[3.4rem]">{emoji}</span>
                <div className="mt-2 text-[0.7rem] tracking-widest font-bold uppercase opacity-80">
                  {category || "Category"}
                </div>
                <div className="font-heading text-lg font-semibold mt-1">
                  {title || "Event Title"}
                </div>
                <div className="text-sm mt-1 opacity-90">
                  {date ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "Date TBD"} · {time}
                </div>
                <div className="text-sm mt-1 opacity-80">
                  {loc || "Location TBD"}
                </div>
                <div className="mt-2 font-bold text-lg">{price || "Free"}</div>
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Venue</span>
                  <b className="text-right max-w-[60%] truncate">{venue || "TBD"}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Capacity</span>
                  <b>{capacity} seats</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Available</span>
                  <b>{spotsLeft} spots left</b>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="rounded-full bg-blush px-2.5 py-0.5 text-xs font-medium text-rose">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => router.push("/admin")} className="btn-outline flex-1 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                  {saving ? "Saving…" : "Save Event"}
                </button>
              </div>
            </div>

            {/* Appearance */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🎨 Appearance</h3>
              <div>
                <label className="field-label">Icon</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {emojis.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`grid h-10 w-10 place-items-center rounded-[11px] border-[1.5px] text-xl transition ${
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
              <div className="mt-4">
                <label className="field-label">Gradient</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {gradients.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGradient(g)}
                      className={`h-10 w-10 rounded-full border-2 transition ${
                        gradient === g ? "border-charcoal scale-110 shadow-md" : "border-transparent hover:scale-105"
                      }`}
                      style={{ background: g }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
