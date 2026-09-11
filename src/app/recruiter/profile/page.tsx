"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Building2, BriefcaseBusiness, MapPin, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";
import { fetchRecruiter, saveRecruiter } from "@/lib/api";
import type { RecruiterRecord } from "@/lib/api";

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
      } else if (user) {
        setFullName(user.name);
        setEmail(user.email);
      }
      setLoading(false);
    });
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

  if (loading) {
    return (
      <div className="card !shadow-lg p-8 text-center text-muted">Loading profile…</div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="mt-1 text-muted">Your details, visible to the Glow &amp; Grace team.</p>
      </div>

      <div className="card !shadow-lg p-7">
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
              <label className="field-label" htmlFor="fullName">Full Name *</label>
              <div className="relative mt-1.5">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e6b]" />
                <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="field-input !rounded-full !pl-11" />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="phone">Phone *</label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e6b]" />
                <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="field-input !rounded-full !pl-11" placeholder="+91 …" />
              </div>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="email">Email *</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e6b]" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-input !rounded-full !pl-11" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="company">Company / Salon *</label>
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
            <label className="field-label" htmlFor="city">City *</label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2e9e6b]" />
              <input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="field-input !rounded-full !pl-11" placeholder="Lucknow" />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="bio">About you</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="field-textarea"
              placeholder="Tell the team about your hiring focus…"
            />
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}