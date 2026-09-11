"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Star,
  ImageUp, Trash2, Plus, Save, Camera, Eye, Pencil,
  FileText, Clock, BriefcaseBusiness,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";
import { usePersistReady } from "@/lib/use-persist-ready";
import { saveCandidate, fetchCandidate, deleteCandidate, fetchApplications, fetchJobs } from "@/lib/api";
import type { ApplicationRecord } from "@/lib/api";
import type { Job } from "@/lib/data";
import { cn } from "@/lib/utils";

const experienceOptions = [
  "Fresher", "1-2 years", "2-3 years", "3-5 years", "5+ years",
];
const specializationOptions = [
  "Beauty & Skincare", "Makeup Artistry", "Hair Styling", "Nail Art",
  "Mehndi Artistry", "Bridal Services", "Spa & Wellness",
];
const qualificationOptions = [
  "High School", "Diploma in Cosmetology", "Certificate in Beauty Care",
  "Bachelor's Degree", "Master's Degree",
];

type Tab = "edit" | "preview" | "applications";

const specializationJobMap: Record<string, string[]> = {
  "Beauty & Skincare": ["senior-beautician", "skincare-specialist"],
  "Makeup Artistry": ["makeup-artist", "bridal-makeup-artist"],
  "Hair Styling": ["hair-stylist", "hair-colorist"],
  "Nail Art": ["nail-artist"],
  "Mehndi Artistry": ["mehndi-artist"],
  "Bridal Services": ["bridal-makeup-artist", "senior-beautician"],
  "Spa & Wellness": ["spa-therapist"],
};

function daysAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

export default function CandidatePage() {
  const router = useRouter();
  const persistReady = usePersistReady();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("edit");
  const [candidateId, setCandidateId] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [experience, setExperience] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [resumeName, setResumeName] = useState<string | null>(null);

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [allJobs, setAllJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (persistReady && !user) router.replace("/login");
  }, [persistReady, user, router]);

  useEffect(() => {
    if (!persistReady || !user) return;

    setEmail(user.email);
    setFullName(user.name);

    fetchCandidate(user.email).then((res) => {
      if (res.ok && res.data?.candidate) {
        const c = res.data.candidate;
        setCandidateId(c.id);
        setFullName(c.fullName);
        setPhone(c.phone);
        setEmail(c.email);
        setCity(c.city);
        setExperience(c.experience);
        setSpecialization(c.specialization);
        setQualification(c.qualification);
        setBio(c.bio);
        setSkills(c.skills || []);
        setGallery(c.gallery || []);
        setResumeName(c.resumeName);
      }
      setLoading(false);
    });
  }, [user, router, persistReady]);

  useEffect(() => {
    if (tab !== "applications" || !user) return;
    setAppsLoading(true);
    fetchApplications(user.email).then((res) => {
      setApplications(res.data?.items || []);
      setAppsLoading(false);
    });
  }, [tab, user]);

  useEffect(() => {
    fetchJobs().then((res) => {
      if (res.data?.items?.length) setAllJobs(res.data.items);
    });
  }, []);

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setSkillInput("");
  };

  const removeSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
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

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !city.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    const res = await saveCandidate({
      userEmail: user!.email,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      experience,
      specialization,
      qualification,
      bio,
      skills,
      gallery,
      resumeName: resumeName || undefined,
    });
    setSaving(false);
    if (res.ok) {
      if (res.data?.id) setCandidateId(String(res.data.id));
      toast.success(res.data?.persisted
        ? "Profile saved successfully ✓"
        : "Profile saved (database not configured — demo only)");
      setTab("preview");
    } else {
      toast.error("Could not save profile");
    }
  };

  const handleDelete = async () => {
    if (!candidateId) return;
    if (!confirm("Are you sure you want to delete your profile?")) return;
    const res = await deleteCandidate(Number(candidateId));
    if (res.ok) {
      setCandidateId(null);
      setFullName(user?.name || "");
      setPhone("");
      setCity("");
      setExperience("");
      setSpecialization("");
      setQualification("");
      setBio("");
      setSkills([]);
      setGallery([]);
      setResumeName(null);
      setTab("edit");
      toast.success("Profile deleted");
    }
  };

  if (!persistReady || !user) return null;

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center p-8 text-muted">
        Loading…
      </div>
    );
  }

  const hasProfile = Boolean(fullName.trim() || phone.trim() || city.trim() || skills.length || gallery.length);

  const recommendedJobs = specialization
    ? allJobs.filter((j) => {
        const matched = specializationJobMap[specialization];
        return matched?.includes(j.slug);
      })
    : allJobs.slice(0, 3);

  const tabButton = (t: Tab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setTab(t)}
      className={cn(
        "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all",
        tab === t
          ? "bg-gradient-to-br from-rose to-rose-dark text-white shadow-md shadow-rose/20"
          : "text-muted hover:text-charcoal"
      )}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Page head */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            My <span className="text-rose italic">Profile</span>
          </h1>
          <p className="mt-1 text-muted">
            {candidateId
              ? "Manage your candidate profile and showcase gallery."
              : "Create your candidate profile to get noticed by top beauty employers."}
          </p>
        </div>
        {candidateId && (
          <button onClick={handleDelete} className="btn-outline !border-red !text-red text-sm hover:!bg-red hover:!:text-white">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        )}
      </div>

      {/* Tab toggle */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-full border border-line bg-white p-1 w-fit">
        {tabButton("edit", <Pencil className="h-4 w-4" />, "Edit Profile")}
        {tabButton("preview", <Eye className="h-4 w-4" />, "Preview Profile")}
        {tabButton("applications", <BriefcaseBusiness className="h-4 w-4" />, "Applied Jobs")}
      </div>

      {tab === "edit" && (
        /* ========== EDIT MODE ========== */
        <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
          <div className="space-y-6">
            {/* Basic info */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                <User className="inline h-5 w-5 text-rose mr-2" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">
                      Full Name <span className="text-rose">*</span>
                    </label>
                    <input
                      className="field-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                    />
                  </div>
                  <div>
                    <label className="field-label">
                      Phone <span className="text-rose">*</span>
                    </label>
                    <input
                      className="field-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="field-label">
                      Email <span className="text-rose">*</span>
                    </label>
                    <input
                      className="field-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="field-label">
                      City <span className="text-rose">*</span>
                    </label>
                    <input
                      className="field-input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Lucknow"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional details */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                <Briefcase className="inline h-5 w-5 text-rose mr-2" />
                Professional Details
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="field-label">Experience</label>
                  <select
                    className="field-input"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="">Select</option>
                    {experienceOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Specialization</label>
                  <select
                    className="field-input"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  >
                    <option value="">Select</option>
                    {specializationOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Qualification</label>
                  <select
                    className="field-input"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                  >
                    <option value="">Select</option>
                    {qualificationOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="field-label">Bio</label>
                <textarea
                  className="field-textarea min-h-[100px]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell employers about yourself, your passion for beauty, and career goals..."
                  maxLength={600}
                />
                <p className="mt-1 text-xs text-muted">{bio.length}/600 characters</p>
              </div>
            </div>

            {/* Skills */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                <Star className="inline h-5 w-5 text-rose mr-2" />
                Skills
              </h3>
              <div className="flex gap-2">
                <input
                  className="field-input flex-1"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="e.g. Hair Coloring, Lash Extensions"
                />
                <button type="button" onClick={addSkill} className="btn-outline text-sm">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blush px-4 py-1.5 text-sm font-semibold text-rose"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(i)}
                        className="ml-1 text-rose/60 hover:text-rose"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side: Gallery + Actions */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Gallery */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                <Camera className="inline h-5 w-5 text-rose mr-2" />
                Showcase Gallery
              </h3>
              <p className="text-sm text-muted mb-4">
                Upload your best work — hair styles, makeup looks, nail art, and more.
              </p>
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-rose-soft bg-blush p-6 text-center text-muted transition hover:border-rose hover:bg-[#fdeaf0]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleGalleryUpload(e.dataTransfer.files);
                }}
              >
                <ImageUp className="h-8 w-8 text-rose" />
                <span>
                  Click to <b className="text-rose">upload</b> or drag &amp; drop
                </span>
                <small>PNG, JPG, WEBP up to 5MB each</small>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleGalleryUpload(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              {gallery.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {gallery.map((src, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-[10px] border border-line bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute right-1 top-1 grid h-[22px] w-[22px] place-items-center rounded-full bg-charcoal/70 text-[0.8rem] text-white hover:bg-red"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {gallery.length === 0 && (
                <div className="mt-4 rounded-[12px] border border-dashed border-line bg-cream/40 p-6 text-center">
                  <Camera className="mx-auto h-8 w-8 text-muted/40" />
                  <p className="mt-2 text-xs text-muted">
                    Your showcase gallery is empty. Upload images to highlight your work.
                  </p>
                </div>
              )}
            </div>

            {/* Save / Cancel */}
            <div className="card !shadow-lg p-6">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTab("preview")}
                  className="btn-outline flex-1 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1 text-sm"
                >
                  {saving ? "Saving…" : <><Save className="h-4 w-4" /> Save Profile</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "preview" && (
        /* ========== PREVIEW MODE ========== */
        <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
          <div className="space-y-6">
            <div className="card !shadow-lg p-6">
              {/* Profile header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-rose text-white text-2xl font-bold shrink-0">
                  {hasProfile ? fullName.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{hasProfile ? fullName : "Your Name"}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted">
                    {city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {city}</span>}
                    {email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {email}</span>}
                    {phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {phone}</span>}
                    {!hasProfile && <span className="text-muted/50 italic">Fill in your profile to see details here</span>}
                  </div>
                </div>
              </div>

              {/* Stats */}
              {(experience || specialization || qualification) ? (
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  {experience && (
                    <div className="rounded-[12px] bg-blush p-4 text-center">
                      <Briefcase className="mx-auto h-5 w-5 text-rose mb-1" />
                      <div className="text-xs text-muted">Experience</div>
                      <div className="font-semibold text-sm">{experience}</div>
                    </div>
                  )}
                  {specialization && (
                    <div className="rounded-[12px] bg-blush p-4 text-center">
                      <Star className="mx-auto h-5 w-5 text-rose mb-1" />
                      <div className="text-xs text-muted">Specialization</div>
                      <div className="font-semibold text-sm">{specialization}</div>
                    </div>
                  )}
                  {qualification && (
                    <div className="rounded-[12px] bg-blush p-4 text-center">
                      <GraduationCap className="mx-auto h-5 w-5 text-rose mb-1" />
                      <div className="text-xs text-muted">Qualification</div>
                      <div className="font-semibold text-sm">{qualification}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { icon: Briefcase, label: "Experience" },
                    { icon: Star, label: "Specialization" },
                    { icon: GraduationCap, label: "Qualification" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-[12px] border border-dashed border-line bg-cream/40 p-4 text-center">
                      <s.icon className="mx-auto h-5 w-5 text-muted/40 mb-1" />
                      <div className="text-xs text-muted/50">{s.label}</div>
                      <div className="text-sm text-muted/40 italic">Not set</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bio */}
              {bio ? (
                <div>
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">About</h3>
                  <p className="text-sm text-charcoal/80 leading-relaxed">{bio}</p>
                </div>
              ) : (
                <div className="rounded-[12px] border border-dashed border-line bg-cream/40 p-5 text-center">
                  <p className="text-sm text-muted/50 italic">Add a bio to tell employers about yourself</p>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span key={i} className="rounded-full bg-blush px-4 py-1.5 text-sm font-semibold text-rose">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[12px] border border-dashed border-line bg-cream/40 p-5 text-center">
                  <p className="text-sm text-muted/50 italic">Add skills to showcase your expertise</p>
                </div>
              )}
            </div>

            {/* Recommended Jobs */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-1">
                <BriefcaseBusiness className="inline h-5 w-5 text-rose mr-2" />
                Recommended Jobs
              </h3>
              <p className="text-sm text-muted mb-4">
                {specialization
                  ? `Based on your ${specialization} specialization`
                  : "Top picks for you — set your specialization for personalised matches"}
              </p>
              <div className="space-y-3">
                {recommendedJobs.map((j) => (
                  <Link
                    key={j.id}
                    href={`/careers/${j.slug}`}
                    className="flex items-center justify-between rounded-[12px] border border-line bg-white p-4 transition hover:border-rose-soft hover:shadow-md"
                  >
                    <div>
                      <div className="font-semibold text-sm">{j.title}</div>
                      <div className="text-xs text-muted">{j.salon} · {j.location}</div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-sm font-bold text-rose">{j.salary}</div>
                      <span className="job-type">{j.type}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/careers" className="mt-4 block text-center text-sm font-semibold text-rose hover:underline">
                View all open positions →
              </Link>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Gallery preview */}
            <div className="card !shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                <Camera className="inline h-5 w-5 text-rose mr-2" />
                Showcase Gallery
              </h3>
              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {gallery.map((src, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-[10px] border border-line bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[12px] border border-dashed border-line bg-cream/40 p-6 text-center">
                  <Camera className="mx-auto h-8 w-8 text-muted/40" />
                  <p className="mt-2 text-xs text-muted/50 italic">
                    No gallery images yet. Switch to Edit to upload your work.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="card !shadow-lg p-6">
              <button
                onClick={() => setTab("edit")}
                className="btn-primary w-full text-sm"
              >
                <Pencil className="h-4 w-4" /> {hasProfile ? "Edit Profile" : "Create Profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "applications" && (
        /* ========== APPLIED JOBS ========== */
        <div>
          <div className="card !shadow-lg overflow-hidden !p-0">
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-lg font-semibold">Applied Jobs</h3>
              <p className="text-sm text-muted mt-1">Applications from the last 30 days.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Salon</th>
                    <th>Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appsLoading ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-10">
                        Loading applications…
                      </td>
                    </tr>
                  ) : applications.length > 0 ? (
                    applications.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <Link href={`/careers/${a.jobSlug}`} className="font-semibold hover:text-rose transition-colors">
                            {a.jobTitle}
                          </Link>
                        </td>
                        <td className="text-muted">{a.jobSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</td>
                        <td className="text-muted">{daysAgo(a.createdAt)}</td>
                        <td><span className="p-pill green">Applied</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <FileText className="mx-auto h-10 w-10 text-muted/30 mb-3" />
                        <p className="text-muted font-semibold">No applications in the last 30 days</p>
                        <Link href="/careers" className="mt-2 inline-block text-sm text-rose font-semibold hover:underline">
                          Browse open positions →
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
