"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, ShoppingBag, Lock, MapPin, MessageSquare,
  Mail, Phone, ChevronRight, Save, Check, Package,
  Plus, Trash2, Eye, Star, Clock,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";
import { usePersistReady } from "@/lib/use-persist-ready";
import { useCartStore } from "@/lib/store";
import { money, cn } from "@/lib/utils";
import { fetchOrders } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Schemas                                                            */
/* ------------------------------------------------------------------ */

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  phone: z.string().min(6, "Phone is required"),
});
type ProfileData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type PasswordData = z.infer<typeof passwordSchema>;

const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  street: z.string().min(3, "Street is required"),
  locality: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(5, "Pincode is required"),
  phone: z.string().min(6, "Phone is required"),
});
type AddressData = z.infer<typeof addressSchema>;

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type ContactData = z.infer<typeof contactSchema>;

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "password", label: "Change Password", icon: Lock },
  { id: "address", label: "My Addresses", icon: MapPin },
  { id: "contact", label: "Contact Us", icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface SavedAddress {
  id: string;
  label: string;
  street: string;
  locality?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

const ADDRESS_KEY = "glow-grace-addresses";

function loadAddresses(): SavedAddress[] {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAddresses(addr: SavedAddress[]) {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(addr));
}

/* ------------------------------------------------------------------ */
/*  Registered users helpers                                           */
/* ------------------------------------------------------------------ */

const REGISTERED_KEY = "glow-grace-registered-users";

function getRegisteredUsers(): { name: string; email: string; password: string; phone: string; role: string }[] {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_KEY) || "[]");
  } catch {
    return [];
  }
}

function updateRegisteredUser(email: string, updates: Partial<{ name: string; phone: string; password: string }>) {
  const users = getRegisteredUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(REGISTERED_KEY, JSON.stringify(users));
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ShopperPage() {
  const router = useRouter();
  const persistReady = usePersistReady();
  const user = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  useEffect(() => {
    if (persistReady && !user) router.replace("/login");
  }, [persistReady, user, router]);

  if (!persistReady || !user) return null;

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gold/15">
            <User className="h-7 w-7 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Hello, <span className="text-gold italic">{user.name.split(" ")[0]}</span>
            </h1>
            <p className="text-sm text-muted">Manage your account &amp; orders</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar tabs */}
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === t.id
                    ? "bg-gold/10 text-gold shadow-sm"
                    : "text-charcoal/60 hover:bg-cream hover:text-charcoal"
                )}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                {t.label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          <div>
            {activeTab === "profile" && <ProfileTab user={user} signIn={signIn} />}
            {activeTab === "orders" && <OrdersTab user={user} />}
            {activeTab === "password" && <PasswordTab user={user} />}
            {activeTab === "address" && <AddressTab />}
            {activeTab === "contact" && <ContactTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile Tab                                                        */
/* ------------------------------------------------------------------ */

function ProfileTab({ user, signIn }: { user: { name: string; email: string; role: string }; signIn: (u: any) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email, phone: "" },
  });

  const onSubmit = (data: ProfileData) => {
    updateRegisteredUser(user.email, { name: data.name, phone: data.phone });
    signIn({ ...user, name: data.name });
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="card !rounded-[20px] p-7">
      <h2 className="text-lg font-semibold mb-1">Personal Information</h2>
      <p className="text-sm text-muted mb-6">Update your name and contact details</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="s-name">Full Name</label>
            <div className="relative mt-1.5">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
              <input id="s-name" className="field-input !rounded-full !pl-11" {...register("name")} />
            </div>
            {errors.name && <p className="mt-1 text-sm text-rose">{errors.name.message}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="s-phone">Phone</label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
              <input id="s-phone" type="tel" className="field-input !rounded-full !pl-11" {...register("phone")} placeholder="+91 98765 43210" />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-rose">{errors.phone.message}</p>}
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="s-email">Email Address</label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
            <input id="s-email" type="email" className="field-input !rounded-full !pl-11 bg-cream/60" {...register("email")} disabled />
          </div>
          <p className="mt-1 text-xs text-muted">Email cannot be changed</p>
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Orders Tab                                                         */
/* ------------------------------------------------------------------ */

function OrdersTab({ user }: { user: { email: string } }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchOrders(user.email);
        setOrders(res.data?.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.email]);

  if (loading) {
    return (
      <div className="card !rounded-[20px] p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="mt-3 text-sm text-muted">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="card !rounded-[20px] p-10 text-center">
        <Package className="mx-auto h-12 w-12 text-gold/40" />
        <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
        <p className="mt-1 text-sm text-muted">Your order history will appear here</p>
        <Link href="/products" className="btn-primary mt-5 inline-flex items-center gap-2">
          Browse Products <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Order History</h2>
      {orders.map((order: any) => {
        const open = selected === order.id;
        return (
          <div key={order.id} className="card !rounded-[16px] overflow-hidden">
            <button
              onClick={() => setSelected(open ? null : order.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-cream/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gold/10">
                  <Package className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </span>
                    <span className="text-xs text-muted">{order.items?.length || 0} item(s)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gold">{money(order.total)}</span>
                <ChevronRight className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-90")} />
              </div>
            </button>
            {open && (
              <div className="border-t border-line px-5 pb-5 pt-4">
                <div className="space-y-3">
                  {(order.items || []).map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-charcoal/70">{item.name || item.productName || "Item"} × {item.quantity}</span>
                      <span className="font-medium">{money((item.price || 0) * (item.quantity || 1))}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="flex items-center gap-1 text-xs">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      order.status === "delivered" ? "bg-emerald/10 text-emerald" :
                      order.status === "shipped" ? "bg-blue-50 text-blue-600" :
                      "bg-gold/10 text-gold"
                    )}>
                      <Check className="h-3 w-3" /> {order.status || "placed"}
                    </span>
                  </span>
                  <span className="text-sm font-semibold">Total: {money(order.total)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Password Tab                                                       */
/* ------------------------------------------------------------------ */

function PasswordTab({ user }: { user: { email: string; role: string } }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordData) => {
    const users = getRegisteredUsers();
    const found = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (!found) {
      toast.error("Cannot change password for demo accounts.");
      return;
    }
    if (found.password !== data.currentPassword) {
      toast.error("Current password is incorrect.");
      return;
    }
    updateRegisteredUser(user.email, { password: data.newPassword });
    toast.success("Password changed successfully!");
    reset();
  };

  return (
    <div className="card !rounded-[20px] p-7">
      <h2 className="text-lg font-semibold mb-1">Change Password</h2>
      <p className="text-sm text-muted mb-6">Update your account password</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
        <div>
          <label className="field-label" htmlFor="cur-pw">Current Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
            <input id="cur-pw" type="password" className="field-input !rounded-full !pl-11" {...register("currentPassword")} placeholder="••••••••" />
          </div>
          {errors.currentPassword && <p className="mt-1 text-sm text-rose">{errors.currentPassword.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="new-pw">New Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
            <input id="new-pw" type="password" className="field-input !rounded-full !pl-11" {...register("newPassword")} placeholder="••••••••" />
          </div>
          {errors.newPassword && <p className="mt-1 text-sm text-rose">{errors.newPassword.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="conf-pw">Confirm New Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gold" />
            <input id="conf-pw" type="password" className="field-input !rounded-full !pl-11" {...register("confirmPassword")} placeholder="••••••••" />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-rose">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" /> Update Password
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Address Tab                                                        */
/* ------------------------------------------------------------------ */

function AddressTab() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);

  useEffect(() => {
    setAddresses(loadAddresses());
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
  });

  const openNew = () => {
    setEditing(null);
    reset({ label: "", street: "", locality: "", city: "Lucknow", state: "Uttar Pradesh", pincode: "", phone: "" });
    setShowForm(true);
  };

  const openEdit = (addr: SavedAddress) => {
    setEditing(addr);
    reset(addr);
    setShowForm(true);
  };

  const onSubmit = (data: AddressData) => {
    let updated: SavedAddress[];
    if (editing) {
      updated = addresses.map((a) => a.id === editing.id ? { ...a, ...data } : a);
    } else {
      updated = [...addresses, { ...data, id: Date.now().toString() }];
    }
    setAddresses(updated);
    saveAddresses(updated);
    setShowForm(false);
    setEditing(null);
    toast.success(editing ? "Address updated!" : "Address added!");
  };

  const remove = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    saveAddresses(updated);
    toast.success("Address removed.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Saved Addresses</h2>
          <p className="text-sm text-muted">Manage your delivery addresses</p>
        </div>
        {!showForm && (
          <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Address
          </button>
        )}
      </div>

      {showForm && (
        <div className="card !rounded-[20px] p-6">
          <h3 className="font-semibold mb-4">{editing ? "Edit Address" : "New Address"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Label</label>
                <input className="field-input mt-1.5" {...register("label")} placeholder="Home, Office..." />
                {errors.label && <p className="mt-1 text-sm text-rose">{errors.label.message}</p>}
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input className="field-input mt-1.5" {...register("phone")} placeholder="+91 98765 43210" />
                {errors.phone && <p className="mt-1 text-sm text-rose">{errors.phone.message}</p>}
              </div>
            </div>
            <div>
              <label className="field-label">Street Address</label>
              <input className="field-input mt-1.5" {...register("street")} placeholder="123, Beauty Lane" />
              {errors.street && <p className="mt-1 text-sm text-rose">{errors.street.message}</p>}
            </div>
            <div>
              <label className="field-label">Locality / Area</label>
              <input className="field-input mt-1.5" {...register("locality")} placeholder="Hazratganj" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="field-label">City</label>
                <input className="field-input mt-1.5" {...register("city")} />
                {errors.city && <p className="mt-1 text-sm text-rose">{errors.city.message}</p>}
              </div>
              <div>
                <label className="field-label">State</label>
                <input className="field-input mt-1.5" {...register("state")} />
                {errors.state && <p className="mt-1 text-sm text-rose">{errors.state.message}</p>}
              </div>
              <div>
                <label className="field-label">Pincode</label>
                <input className="field-input mt-1.5" {...register("pincode")} />
                {errors.pincode && <p className="mt-1 text-sm text-rose">{errors.pincode.message}</p>}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="h-4 w-4" /> {editing ? "Update" : "Save"} Address
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && addresses.length === 0 && (
        <div className="card !rounded-[20px] p-10 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gold/40" />
          <h3 className="mt-4 text-lg font-semibold">No addresses saved</h3>
          <p className="mt-1 text-sm text-muted">Add a delivery address for faster checkout</p>
        </div>
      )}

      {!showForm && addresses.map((addr) => (
        <div key={addr.id} className="card !rounded-[16px] p-5 flex items-start justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-gold/10 px-3 py-0.5 text-xs font-semibold text-gold mb-2">{addr.label}</span>
            <p className="text-sm font-medium">{addr.street}{addr.locality ? `, ${addr.locality}` : ""}</p>
            <p className="text-sm text-charcoal/70">{addr.city}, {addr.state} — {addr.pincode}</p>
            <p className="text-xs text-muted mt-1">📞 {addr.phone}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => openEdit(addr)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-cream transition-colors">
              Edit
            </button>
            <button onClick={() => remove(addr.id)} className="rounded-lg border border-rose/20 px-3 py-1.5 text-xs font-medium text-rose hover:bg-rose/5 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact Tab                                                        */
/* ------------------------------------------------------------------ */

function ContactTab() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactData) => {
    toast.success("Message sent! We'll get back to you within 24 hours.");
    reset();
  };

  return (
    <div className="card !rounded-[20px] p-7">
      <h2 className="text-lg font-semibold mb-1">Contact Us</h2>
      <p className="text-sm text-muted mb-6">Have a question or feedback? We&apos;d love to hear from you.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Mail, label: "Email", value: "hello@glowngrace.in", href: "mailto:hello@glowngrace.in" },
          { icon: Phone, label: "Phone", value: "+91 89718 21213", href: "tel:+918971821213" },
          { icon: MapPin, label: "Visit", value: "Hazratganj, Lucknow", href: "#" },
        ].map((c) => (
          <a key={c.label} href={c.href} className="flex items-center gap-3 rounded-[14px] border border-line bg-cream/50 p-4 hover:shadow-sm transition-shadow">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gold/10">
              <c.icon className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-xs text-muted">{c.label}</p>
              <p className="text-sm font-medium">{c.value}</p>
            </div>
          </a>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Your Name</label>
            <input className="field-input mt-1.5" {...register("name")} placeholder="Priya Sharma" />
            {errors.name && <p className="mt-1 text-sm text-rose">{errors.name.message}</p>}
          </div>
          <div>
            <label className="field-label">Email</label>
            <input type="email" className="field-input mt-1.5" {...register("email")} placeholder="you@example.com" />
            {errors.email && <p className="mt-1 text-sm text-rose">{errors.email.message}</p>}
          </div>
        </div>
        <div>
          <label className="field-label">Subject</label>
          <input className="field-input mt-1.5" {...register("subject")} placeholder="How can we help?" />
          {errors.subject && <p className="mt-1 text-sm text-rose">{errors.subject.message}</p>}
        </div>
        <div>
          <label className="field-label">Message</label>
          <textarea className="field-input mt-1.5 min-h-[120px] resize-y" {...register("message")} placeholder="Tell us more..." />
          {errors.message && <p className="mt-1 text-sm text-rose">{errors.message.message}</p>}
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Send Message
        </button>
      </form>
    </div>
  );
}
