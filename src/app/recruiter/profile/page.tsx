"use client";

import { useEffect, useState } from "react";
import {
  User, Mail, Phone, Building2, BriefcaseBusiness, MapPin, Save,
  ImageUp, Trash2, Package, Upload, Plus, Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";
import {
  fetchRecruiter,
  saveRecruiter,
  fetchRecruiterPackages,
  createRecruiterPackages,
  deleteRecruiterPackage,
  type RecruiterPackageRecord,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { Preloader } from "@/components/preloader";

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

type ParsedPackage = {
  name: string;
  price: number;
  duration: string;
  description: string;
  services: string[];
};

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

export default function RecruiterProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");

  const [packages, setPackages] = useState<RecruiterPackageRecord[]>([]);
  const [packageName, setPackageName] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [packageDuration, setPackageDuration] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageServices, setPackageServices] = useState<string[]>([]);
  const [addingPackage, setAddingPackage] = useState(false);
  const [importing, setImporting] = useState(false);

  const loadPackages = () => {
    if (!user) return;
    fetchRecruiterPackages(user.email).then((res) => {
      setPackages(res.data?.items || []);
    });
  };

  useEffect(() => {
    if (!user) return;
    fetchRecruiter(user.email).then((res) => {
      const r = res.data?.recruiter;
      if (r) {
        setFullName(r.fullName);
        setPhone(r.phone);
        setEmail(r.email);
        setCompany(r.company);
        setDesignation(r.designation);
        setCity(r.city);
        setBio(r.bio);
        setGallery(r.gallery || []);
        setServices(r.services || []);
      } else if (user) {
        setFullName(user.name);
        setEmail(user.email);
      }
      setLoading(false);
    });
    loadPackages();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim() || !phone.trim() || !email.trim() || !company.trim() || !city.trim()) {
      toast.error("Please fill in the required fields.");
      return;
    }
    setSaving(true);
    const res = await saveRecruiter({
      userEmail: user.email,
      fullName,
      phone,
      email,
      company,
      designation,
      city,
      bio,
      gallery,
      services,
    });
    setSaving(false);
    if (res.ok && res.data?.persisted) {
      toast.success("Profile saved!");
    } else if (res.ok) {
      toast.info("Profile acknowledged — database not configured.");
    } else {
      toast.error("Could not save profile.");
    }
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
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const addCustomService = () => {
    const v = serviceInput.trim();
    if (v && !services.includes(v)) setServices([...services, v]);
    setServiceInput("");
  };

  const togglePackageService = (s: string) => {
    setPackageServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleAddPackage = async () => {
    if (!user) return;
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
    const res = await createRecruiterPackages({
      recruiterEmail: user.email,
      items: [
        {
          name: packageName.trim(),
          price,
          duration: packageDuration.trim(),
          description: packageDescription.trim(),
          services: packageServices,
        },
      ],
    });
    setAddingPackage(false);
    if (res.ok) {
      toast.success(res.data?.persisted
        ? "Package added ✓"
        : "Package acknowledged (database not configured — demo only)");
      setPackageName("");
      setPackagePrice("");
      setPackageDuration("");
      setPackageDescription("");
      setPackageServices([]);
      loadPackages();
    } else {
      toast.error("Could not add package.");
    }
  };

  const handlePackagesFile = async (file: File | null) => {
    if (!file || !user) return;
    setImporting(true);
    try {
      const content = await file.text();
      const items = parsePackagesContent(content, file.name);
      if (items.length === 0 || items.some((p) => !p.name)) {
        toast.error("No valid packages found. Each row/element needs a name.");
        return;
      }
      const res = await createRecruiterPackages({ recruiterEmail: user.email, items });
      if (res.ok) {
        toast.success(res.data?.persisted
          ? `Imported ${res.data.created ?? items.length} package(s) ✓`
          : `Parsed ${items.length} package(s) (demo mode — not persisted)`);
        loadPackages();
      } else {
        toast.error("Could not import packages.");
      }
    } catch {
      toast.error("Could not read file. Use a JSON array or CSV with name,price,duration,description,services.");
    } finally {
      setImporting(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this package?")) return;
    const res = await deleteRecruiterPackage(id, user.email);
    if (res.ok && res.data?.deleted) {
      toast.success("Package deleted.");
      loadPackages();
    }
  };

  if (loading) {
    return (
      <div className="card !shadow-lg p-8">
        <Preloader fullscreen={false} label="Loading profile..." />
      </div>
    );
  }

  const previewGradient = "linear-gradient(135deg,#2e9e6b,#0e2a20)";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-1 text-muted">
          Your salon details, gallery, services and packages.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-8">
          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🖋️ Basic Information</h3>

            <div className="mb-6 flex items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#2e9e6b] to-[#0e2a20] text-2xl font-bold text-white">
                {(fullName || "R").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold">{fullName || "Recruiter"}</div>
                <div className="text-sm text-muted">{designation || "Talent Recruiter"}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label" htmlFor="fullName">Full Name </label><span className="text-rose" aria-hidden="true">*</span>
                  <div className="relative mt-1.5">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e6b]" />
                    <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="field-input !rounded-full !pl-11" />
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="phone">Phone </label><span className="text-rose" aria-hidden="true">*</span>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e6b]" />
                    <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="field-input !rounded-full !pl-11" placeholder="+91 …" />
                  </div>
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="email">Email </label><span className="text-rose" aria-hidden="true">*</span>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e6b]" />
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input !rounded-full !pl-11" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label" htmlFor="company">Company / Salon </label><span className="text-rose" aria-hidden="true">*</span>
                  <div className="relative mt-1.5">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e6b]" />
                    <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="field-input !rounded-full !pl-11" placeholder="e.g. Luxe Salon Lucknow" />
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="designation">Designation</label>
                  <div className="relative mt-1.5">
                    <BriefcaseBusiness className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e6b]" />
                    <input id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} className="field-input !rounded-full !pl-11" placeholder="e.g. HR Manager" />
                  </div>
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="city">City </label><span className="text-rose" aria-hidden="true">*</span>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e6b]" />
                  <input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="field-input !rounded-full !pl-11" placeholder="Lucknow" />
                </div>
              </div>
            </div>
          </div>

          <div className="card !shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">📝 About</h3>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="field-textarea"
              placeholder="Tell the team about your salon and hiring focus…"
            />
          </div>

          <div className="card !shadow-lg p-6" data-testid="salon-gallery">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald/10 text-emerald">
                <ImageUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Salon Gallery</h2>
                <p className="text-xs text-muted">Upload photos of your salon, work and events.</p>
              </div>
            </div>

            <label
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald/30 bg-emerald/5 px-4 py-8 text-emerald hover:border-emerald/60"
            >
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
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {gallery.map((src, i) => (
                  <div key={`${src.slice(0, 40)}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                    <button
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
              <h2 className="text-lg font-semibold">Services Provided</h2>
              <p className="text-xs text-muted">Pick from common services or add your own.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {servicePresets.map((s) => {
                const active = services.includes(s);
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

            {services.length === 0 && (
              <p className="mt-4 text-sm text-muted">No services selected yet.</p>
            )}
          </div>

          <div className="card !shadow-lg p-6" data-testid="packages-section">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Packages</h2>
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
                  <label className="field-label" htmlFor="package-name">Package Name </label><span className="text-rose" aria-hidden="true">*</span>
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
                  <label className="field-label" htmlFor="package-price">Price (₹) </label><span className="text-rose" aria-hidden="true">*</span>
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

              {services.length > 0 && (
                <div>
                  <span className="field-label">Services in package</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {services.map((s) => {
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
                {packages.map((p) => (
                  <div
                    key={p.id}
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
                      onClick={() => handleDeletePackage(p.id)}
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
            <div className="overflow-hidden rounded-[16px] shadow-lg shadow-emerald/10">
              <div
                className="relative flex items-center justify-center gap-4 px-6 pt-8 pb-10 text-white"
                style={{ background: previewGradient }}
              >
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white/20 text-4xl font-bold">
                  {(fullName || "R").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xl font-bold">{fullName || "Recruiter"}</div>
                  <div className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-sm font-semibold">
                    {designation || "Talent Recruiter"}
                  </div>
                </div>
              </div>
              <div className="bg-white p-4">
                <div className="truncate text-sm font-semibold">{company || "Your Salon"}</div>
                <div className="text-sm text-muted">{designation || "Talent Recruiter"}</div>

                <div className="mt-4 space-y-2 text-sm text-charcoal/80">
                  {email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-[#2e9e6b]" />
                      <span className="truncate">{email}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-[#2e9e6b]" />
                      <span className="truncate">{phone}</span>
                    </div>
                  )}
                  {city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-[#2e9e6b]" />
                      <span>{city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {gallery.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-xs font-bold tracking-wide uppercase text-muted">Gallery</div>
                <div className="flex flex-wrap gap-2">
                  {gallery.slice(0, 6).map((src, i) => (
                    <div key={`${src.slice(0, 30)}-${i}`} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {packages.length > 0 && (
              <div className="mt-5 space-y-2 border-t border-line pt-4">
                <div className="mb-2 text-xs font-bold tracking-wide uppercase text-muted">Packages</div>
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
              <a href="/recruiter" className="btn-outline flex flex-1 items-center justify-center text-sm">
                Cancel
              </a>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm">
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}