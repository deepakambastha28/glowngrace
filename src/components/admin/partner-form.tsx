"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUp, Upload, Trash2, Package, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { createAdminPartner, fetchAdminPartners, updateAdminPartner } from "@/lib/api";
import { cn } from "@/lib/utils";

const partnerEmojis = ["💇‍♀️", "💅", "🧖‍♀️", "💆‍♀️", "💄", "💈", "✨", "🌸", "🪞"];

const servicePresets = [
  "Haircut & Styling",
  "Hair Colour",
  "Facials & Skin Care",
  "Bridal Makeup",
  "Party Makeup",
  "Nail Art & Manicure",
  "Spa & Massage",
  "Mehndi",
  "Parlour Services",
];

type PackageItem = {
  name: string;
  price: number;
  duration: string;
  description: string;
  services: string[];
};

type ParsedPackage = PackageItem;

function parsePackagesContent(content: string, fileName: string): ParsedPackage[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const looksJson = /\.json$/i.test(fileName) || (lines[0]?.trim() ?? "").startsWith("[");

  if (looksJson) {
    const data = JSON.parse(content);
    const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
    return items.map((it: Record<string, unknown>) => ({
      name: String(it.name ?? "").trim(),
      price: Number(it.price ?? 0),
      duration: String(it.duration ?? "").trim(),
      description: String(it.description ?? "").trim(),
      services: Array.isArray(it.services) ? it.services.map(String) : [],
    }));
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return {
      name: row.name ?? "",
      price: Number(row.price ?? 0),
      duration: row.duration ?? "",
      description: row.description ?? "",
      services: (row.services ?? "")
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean),
    };
  });
}

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
  const [cover, setCover] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [serviceItems, setServiceItems] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [packageName, setPackageName] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [packageDuration, setPackageDuration] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageServices, setPackageServices] = useState<string[]>([]);
  const [addingPackage, setAddingPackage] = useState(false);
  const [importing, setImporting] = useState(false);

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
        const galleryArr = Array.isArray(it.gallery) ? it.gallery : [];
        setCover(galleryArr[0] ?? "");
        setGallery(galleryArr.slice(1));
        setServiceItems(Array.isArray(it.tags) ? it.tags : []);
        const seeded = Array.isArray(it.menu)
          ? it.menu.map((m) => ({
              name: String(m.name ?? ""),
              price: Number(m.price ?? 0),
              duration: String(m.duration ?? ""),
              description: String(m.description ?? ""),
              services: Array.isArray(m.services) ? m.services : [],
            }))
          : [];
        setPackages(seeded);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleCoverUpload = (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.warning("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Image exceeds 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setCover(String(e.target?.result));
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.warning("Only image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(`${file.name} exceeds 5MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setGallery((prev) => [...prev, String(e.target?.result)]);
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (idx: number) => {
    setGallery(gallery.filter((_, i) => i !== idx));
  };

  const toggleService = (s: string) => {
    setServiceItems((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const addCustomService = () => {
    const v = serviceInput.trim();
    if (v && !serviceItems.includes(v)) setServiceItems([...serviceItems, v]);
    setServiceInput("");
  };

  const togglePackageService = (s: string) => {
    setPackageServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleAddPackage = () => {
    if (packageName.trim().length < 2) {
      toast.error("Package name must be at least 2 characters.");
      return;
    }
    const price = Number(packagePrice);
    if (!packagePrice.trim() || Number.isNaN(price) || price < 0) {
      toast.error("Enter a valid price.");
      return;
    }
    setAddingPackage(true);
    setPackages((prev) => [
      ...prev,
      {
        name: packageName.trim(),
        price,
        duration: packageDuration.trim(),
        description: packageDescription.trim(),
        services: packageServices,
      },
    ]);
    setPackageName("");
    setPackagePrice("");
    setPackageDuration("");
    setPackageDescription("");
    setPackageServices([]);
    setAddingPackage(false);
    toast.success("Package added ✓");
  };

  const handlePackagesFile = async (file: File | null) => {
    if (!file) return;
    setImporting(true);
    try {
      const content = await file.text();
      const items = parsePackagesContent(content, file.name);
      if (items.length === 0 || items.some((p) => !p.name)) {
        toast.error("No valid packages found. Each row/element needs a name.");
        return;
      }
      setPackages((prev) => [...prev, ...items]);
      toast.success(`Imported ${items.length} package(s) ✓`);
    } catch {
      toast.error("Could not read file. Use a JSON array or CSV with name,price,duration,description,services.");
    } finally {
      setImporting(false);
    }
  };

  const handleDeletePackage = (idx: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    setPackages(packages.filter((_, i) => i !== idx));
    toast.success("Package deleted.");
  };

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
      tags: serviceItems,
      gallery: cover ? [cover, ...gallery] : gallery,
      menu: packages,
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

  const previewGradient = "linear-gradient(135deg,#d6336c,#f4a6c0)";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{id ? "Edit Partner" : "Add New Partner"}</h1>
        <p className="mt-1 text-muted">{id ? "Update this partner's directory entry." : "Add a beauty parlour to the partner directory."}</p>
      </div>

      <form onSubmit={submit}>
        <fieldset disabled={loading} className="space-y-6 border-0 m-0 p-0 min-w-0"> 
        <div className="grid items-start gap-8 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-8">
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
                  <label className="field-label">Tile / Cover Image</label>
                  <p className="mb-2 text-xs text-muted">Shown as the tile / cover photo on the partner card and detail page.</p>
                  {cover ? (
                    <div className="relative h-28 w-full overflow-hidden rounded-xl border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt="Cover preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCover("")}
                        aria-label="Remove cover image"
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-red"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-soft bg-blush px-4 py-6 text-muted transition hover:border-rose">
                      <Upload className="h-5 w-5 text-rose" />
                      <span className="text-sm font-semibold text-rose">Upload tile image</span>
                      <input
                        type="file"
                        accept="image/*"
                        data-testid="cover-input"
                        className="hidden"
                        onChange={(e) => {
                          handleCoverUpload(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
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
            </div>

          <div className="space-y-8">
            <div className="card !shadow-lg p-6" data-testid="salon-gallery">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald/10 text-emerald">
                  <ImageUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Salon Gallery</h3>
                  <p className="text-xs text-muted">Upload photos of your salon, work and events.</p>
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald/30 bg-emerald/5 px-4 py-8 text-emerald hover:border-emerald/60">
                <Upload className="h-5 w-5" />
                <span className="text-sm font-semibold">Upload gallery images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  data-testid="gallery-input"
                  className="hidden"
                  onChange={(e) => {
                    handleGalleryUpload(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              {gallery.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {gallery.map((src, i) => (
                    <div key={`${src.slice(0, 40)}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        aria-label="Remove image"
                        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {gallery.length === 0 && (
                <p className="mt-4 text-sm text-muted">No gallery images yet.</p>
              )}
            </div>

            <div className="card !shadow-lg p-6" data-testid="services-section">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Services Provided</h3>
                <p className="text-xs text-muted">Pick from common services or add your own.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {servicePresets.map((s) => {
                  const active = serviceItems.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-medium transition-all",
                        active
                          ? "border-emerald bg-emerald text-white"
                          : "border-line bg-white text-charcoal/70 hover:border-emerald/50"
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      {s}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomService();
                    }
                  }}
                  className="field-input !rounded-full"
                  placeholder="Add a custom service…"
                  data-testid="service-input"
                />
                <button type="button" onClick={addCustomService} className="btn-primary shrink-0">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              {serviceItems.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {serviceItems.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className="flex items-center gap-1.5 rounded-full border-2 border-emerald bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald"
                    >
                      {s} ✕
                    </button>
                  ))}
                </div>
              )}
              {serviceItems.length === 0 && (
                <p className="mt-4 text-sm text-muted">No services selected yet.</p>
              )}
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

        <div className="card !shadow-lg p-6" data-testid="packages-section">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Packages</h3>
              <p className="text-xs text-muted">Create service packages or bulk-import them from a file.</p>
            </div>
          </div>

          <div className="mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-gold/40 bg-[#fbf3e2]/40 px-4 py-2.5 text-sm font-semibold text-gold hover:border-gold">
              <Upload className="h-4 w-4" />
              {importing ? "Importing…" : "Import packages from file"}
              <input
                type="file"
                accept=".json,.csv,application/json,text/csv"
                data-testid="packages-file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  e.target.value = "";
                  if (f) handlePackagesFile(f);
                }}
              />
            </label>
            <p className="text-xs text-muted">
              JSON array or CSV header: name, price, duration, description, services
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-cream/60 p-5 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="field-label" htmlFor="package-name">Package Name *</label>
                <input
                  id="package-name"
                  data-testid="package-name"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="field-input !rounded-full mt-1.5"
                  placeholder="e.g. Bridal Makeup Combo"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="package-price">Price (₹) *</label>
                <input
                  id="package-price"
                  data-testid="package-price"
                  type="number"
                  min="0"
                  value={packagePrice}
                  onChange={(e) => setPackagePrice(e.target.value)}
                  className="field-input !rounded-full mt-1.5"
                  placeholder="e.g. 2499"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="package-duration">Duration</label>
                <input
                  id="package-duration"
                  data-testid="package-duration"
                  value={packageDuration}
                  onChange={(e) => setPackageDuration(e.target.value)}
                  className="field-input !rounded-full mt-1.5"
                  placeholder="e.g. 1 month / 45 mins"
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="package-description">Description</label>
              <textarea
                id="package-description"
                data-testid="package-description"
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                rows={2}
                className="field-textarea mt-1.5"
                placeholder="What does this package include?"
              />
            </div>

            {serviceItems.length > 0 && (
              <div>
                <span className="field-label">Services in package</span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {serviceItems.map((s) => {
                    const active = packageServices.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => togglePackageService(s)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-medium transition-all",
                          active
                            ? "border-gold bg-gold text-white"
                            : "border-line bg-white text-charcoal/70 hover:border-gold/60"
                        )}
                      >
                        {active && <Check className="h-3 w-3" />}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddPackage}
              disabled={addingPackage}
              className="btn-primary w-full"
              data-testid="add-package"
            >
              <Plus className="h-4 w-4" /> {addingPackage ? "Adding…" : "Add Package"}
            </button>
          </div>

          {packages.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No packages yet. Add one above or import a file.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {packages.map((p, idx) => (
                <div
                  key={`${p.name}-${idx}`}
                  data-testid="package-row"
                  className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-white p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-charcoal">{p.name}</span>
                      <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-sm font-bold text-gold">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {p.duration && <p className="mt-1 text-xs text-muted">⏱ {p.duration}</p>}
                    {p.description && (
                      <p className="mt-1 text-sm text-charcoal/70 line-clamp-2">{p.description}</p>
                    )}
                    {p.services.length > 0 && (
                      <p className="mt-1.5 text-xs text-muted">
                        {p.services.map((s) => `• ${s}`).join("  ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePackage(idx)}
                    aria-label={`Delete ${p.name}`}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-rose/60 hover:bg-rose-blush hover:text-rose"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            <div className="overflow-hidden rounded-[16px] shadow-lg shadow-rose/10">
              <div
                className="relative flex items-center justify-center px-6 pt-8 pb-10 text-white"
                style={{ background: previewGradient }}
              >
                <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase">
                  {type || "Partner"}
                </span>
                <span className="text-[3rem]">{partnerEmojis.includes(emoji) ? emoji : "💄"}</span>
                <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-0.5 text-sm font-bold">
                  ⭐ {rating || "—"}
                </span>
              </div>
              <div className="bg-white p-4">
                <div className="truncate text-lg font-bold text-charcoal">{name || "Partner Name"}</div>
                <div className="mt-1 text-xs text-muted">📍 {loc || "—"}, Lucknow</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {serviceItems.slice(0, 4).map((s) => (
                    <span key={s} className="inline-block rounded-full border border-emerald/30 bg-emerald/10 px-2 py-0.5 text-[0.68rem] font-medium text-emerald">
                      {s}
                    </span>
                  ))}
                  {serviceItems.length > 4 && (
                    <span className="inline-block rounded-full border border-line px-2 py-0.5 text-[0.68rem] font-medium text-muted">
                      +{serviceItems.length - 4}
                    </span>
                  )}
                  {serviceItems.length === 0 && (
                    <span className="italic text-[0.68rem] text-muted">No services added yet</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Rating</span><b>{rating || "—"} ({reviews} reviews)</b></div>
              <div className="flex justify-between"><span className="text-muted">Expert Staff</span><b>{staff || "—"}</b></div>
              <div className="flex justify-between"><span className="text-muted">Services</span><b>{services || "—"}</b></div>
              <div className="flex justify-between"><span className="text-muted">Established</span><b>{estd || "—"}</b></div>
              <div className="flex justify-between"><span className="text-muted">Photos</span><b>{gallery.length || 0}</b></div>
            </div>

            {gallery.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {gallery.slice(0, 4).map((src, i) => (
                  <div key={`${src.slice(0, 30)}-${i}`} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {packages.length > 0 && (
              <div className="mt-5 border-t border-line pt-4 space-y-2">
                <div className="text-xs font-bold tracking-wide uppercase text-muted mb-2">Packages</div>
                {packages.slice(0, 3).map((p, i) => (
                  <div key={`${p.name}-${i}`} className="flex items-center justify-between rounded-xl bg-cream/50 px-3 py-2 text-sm">
                    <span className="truncate font-medium text-charcoal">{p.name}</span>
                    <span className="ml-2 shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[0.7rem] font-bold text-gold">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                {packages.length > 3 && (
                  <div className="text-center text-xs text-muted">+{packages.length - 3} more packages</div>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => router.push("/admin/partners")} className="btn-outline flex-1 text-sm">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? "Saving…" : "Save Partner"}
              </button>
            </div>
          </div>
        </div>
        </div>
        </fieldset>
      </form>
    </div>
  );
}