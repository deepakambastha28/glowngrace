"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import {
  fetchAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser,
  type AdminUserRecord,
} from "@/lib/api";
import { adminUserCreateSchema } from "@/lib/schemas";
import { Eye, Trash2, Pause, Play, KeyRound, Lock, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

const PROTECTED_EMAIL = "admin@glowngrace.in";

const roleMeta: Record<string, { label: string; avatar: string; pill: string }> = {
  user: { label: "User", avatar: "from-gold to-[#d9a13b] text-white", pill: "bg-[#fbf3e2] text-gold" },
  candidate: { label: "Candidate", avatar: "from-rose-soft to-rose text-white", pill: "bg-blush text-rose" },
  recruiter: { label: "Recruiter", avatar: "from-emerald to-[#2e9e6b] text-white", pill: "bg-[#eaf7f0] text-[#2e9e6b]" },
  admin: { label: "Admin", avatar: "from-[#3b82c9] to-[#2b6cb0] text-white", pill: "bg-[#e9f1fa] text-[#3b82c9]" },
};

function statusPill(status: string) {
  const key = (status || "").toLowerCase();
  const cls = key === "active" ? "green" : key === "suspended" ? "red" : "grey";
  return <span className={`p-pill ${cls}`}>{key === "active" ? "Active" : key === "suspended" ? "Suspended" : status}</span>;
}

const isProtected = (u: AdminUserRecord) => u.role === "admin" && u.email.toLowerCase() === PROTECTED_EMAIL;

function UsersContent() {
  const [items, setItems] = useState<AdminUserRecord[]>([]);
  const [viewing, setViewing] = useState<AdminUserRecord | null>(null);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAdd, setShowAdd] = useState(false);
  const [add, setAdd] = useState({ name: "", email: "", phone: "", role: "user", password: "" });

  const [resetTarget, setResetTarget] = useState<AdminUserRecord | null>(null);
  const [reset, setReset] = useState({ password: "", confirm: "" });

  const load = useCallback(() => {
    fetchAdminUsers({ role: roleFilter, status: statusFilter, q }).then((res) => {
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
    });
  }, [roleFilter, statusFilter, q]);

  useEffect(() => { load(); }, [load]);

  const clearFilters = () => {
    setQ("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const resetAdd = () => {
    setAdd({ name: "", email: "", phone: "", role: "user", password: "" });
    setShowAdd(false);
  };

  const handleCreate = async () => {
    const parsed = adminUserCreateSchema.safeParse(add);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid user details");
      return;
    }
    const res = await createAdminUser(parsed.data);
    if (res.ok) {
      toast.success(`User account for ${parsed.data.name} created`);
      resetAdd();
      load();
    } else {
      const err = (res.data as { error?: string } | null)?.error;
      toast.error(err || "Could not create user");
    }
  };

  const patchStatus = async (u: AdminUserRecord, status: string) => {
    const res = await updateAdminUser(u.id, { status });
    if (res.ok) {
      toast.success(status === "suspended" ? `${u.name} suspended` : `${u.name} activated`);
      load();
    } else {
      toast.error("Could not update account status");
    }
  };

  const handleReset = async () => {
    if (!resetTarget) return;
    if (reset.password.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (reset.password !== reset.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    const res = await updateAdminUser(resetTarget.id, { password: reset.password });
    if (res.ok) {
      toast.success(`Password updated for ${resetTarget.email}`);
      setResetTarget(null);
      setReset({ password: "", confirm: "" });
    } else {
      toast.error((res.data as { error?: string } | null)?.error || "Could not reset password");
    }
  };

  const handleDelete = async (u: AdminUserRecord) => {
    if (!confirm(`Delete the account for ${u.email}? This cannot be undone.`)) return;
    const res = await deleteAdminUser(u.id);
    if (res.ok) {
      toast.success(`Account for ${u.name} deleted`);
      if (viewing?.id === u.id) setViewing(null);
      load();
    } else {
      toast.error((res.data as { error?: string } | null)?.error || "Could not delete account");
    }
  };

  const roleOf = (u: AdminUserRecord) => roleMeta[u.role]?.label ?? u.role;

  return (
    <div>
      <AdminPageHead
        title="Users"
        subtitle={`${items.length} account${items.length === 1 ? "" : "s"} across all roles.`}
        actionLabel=""
        actionHref=""
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="admin-search !w-72">
          <Search className="h-4 w-4 text-rose" />
          <input
            data-testid="user-search"
            placeholder="Search name or email…"
            aria-label="Search users"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          data-testid="user-role-filter"
          className="field-input !w-44 !py-2.5"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Filter by role"
        >
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
        <select
          data-testid="user-status-filter"
          className="field-input !w-44 !py-2.5"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        {(q || roleFilter !== "all" || statusFilter !== "all") && (
          <button
            data-testid="user-clear"
            onClick={clearFilters}
            className="rounded-full bg-[#f1f1f4] px-4 py-2 text-sm font-semibold text-muted hover:text-rose transition-colors"
          >
            <X className="mr-1 inline h-3.5 w-3.5" /> Clear
          </button>
        )}
        <button
          data-testid="user-add"
          onClick={() => { if (!showAdd) resetAdd(); setShowAdd(true); }}
          className="btn-primary text-sm ml-auto"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {showAdd && (
        <div data-testid="add-user-form" className="card !shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Add User</h3>
            <button onClick={() => setShowAdd(false)} className="text-muted hover:text-rose text-sm font-semibold">
              ✕ Close
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="au-name">Full Name</label>
              <input id="au-name" className="field-input mt-1.5" value={add.name} onChange={(e) => setAdd({ ...add, name: e.target.value })} placeholder="Priya Sharma" />
            </div>
            <div>
              <label className="field-label" htmlFor="au-email">Email Address</label>
              <input id="au-email" type="email" className="field-input mt-1.5" value={add.email} onChange={(e) => setAdd({ ...add, email: e.target.value })} placeholder="user@example.com" />
            </div>
            <div>
              <label className="field-label" htmlFor="au-phone">Phone Number</label>
              <input id="au-phone" className="field-input mt-1.5" value={add.phone} onChange={(e) => setAdd({ ...add, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="field-label" htmlFor="au-role">Role</label>
              <select id="au-role" data-testid="add-user-role" className="field-input mt-1.5" value={add.role} onChange={(e) => setAdd({ ...add, role: e.target.value })}>
                <option value="user">User</option>
                <option value="candidate">Candidate</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="au-password">Password</label>
              <input id="au-password" type="password" className="field-input mt-1.5" value={add.password} onChange={(e) => setAdd({ ...add, password: e.target.value })} placeholder="••••••••" />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={handleCreate} className="btn-primary text-sm">
              Create User
            </button>
          </div>
        </div>
      )}

      {resetTarget && (
        <div data-testid="reset-password-form" className="card !shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Reset Password — {resetTarget.email}</h3>
            <button onClick={() => { setResetTarget(null); setReset({ password: "", confirm: "" }); }} className="text-muted hover:text-rose text-sm font-semibold">
              ✕ Close
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="rp-password">New Password</label>
              <input id="rp-password" type="password" className="field-input mt-1.5" value={reset.password} onChange={(e) => setReset({ ...reset, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div>
              <label className="field-label" htmlFor="rp-confirm">Confirm New Password</label>
              <input id="rp-confirm" type="password" className="field-input mt-1.5" value={reset.confirm} onChange={(e) => setReset({ ...reset, confirm: e.target.value })} placeholder="••••••••" />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            The user will need to sign in with the new password. Their old one stops working immediately.
          </p>
          <div className="mt-5 flex justify-end">
            <button onClick={handleReset} className="btn-primary text-sm">
              Save New Password
            </button>
          </div>
        </div>
      )}

      {viewing && (
        <div className="card !shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Account Details</h3>
            <button onClick={() => setViewing(null)} className="text-muted hover:text-rose text-sm font-semibold">
              ✕ Close
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted">Name:</span> <b>{viewing.name}</b></div>
            <div><span className="text-muted">Email:</span> <b>{viewing.email}</b></div>
            <div><span className="text-muted">Phone:</span> <b>{viewing.phone || "N/A"}</b></div>
            <div><span className="text-muted">Role:</span> <b className="capitalize">{roleOf(viewing)}</b></div>
            <div><span className="text-muted">Status:</span> {statusPill(viewing.status)}</div>
            <div><span className="text-muted">Joined:</span> <b>{new Date(viewing.createdAt).toLocaleDateString("en-IN")}</b></div>
          </div>
        </div>
      )}

      <div className="card !shadow-lg overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((u) => {
                  const meta = roleMeta[u.role] ?? roleMeta.user;
                  const protectedAccount = isProtected(u);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span
                            role="img"
                            aria-label={meta.label}
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${meta.avatar} text-sm font-bold`}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 font-semibold">
                              {u.name}
                              {protectedAccount && (
                                <span
                                  data-testid="protected-badge"
                                  title="Protected account"
                                  className="inline-flex items-center gap-1 rounded-full bg-[#e9f1fa] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-[#3b82c9]"
                                >
                                  <Lock className="h-3 w-3" /> Protected
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{u.phone || "—"}</td>
                      <td>
                        <span className={`p-pill ${meta.pill}`}>{meta.label}</span>
                      </td>
                      <td>{statusPill(u.status)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewing(u)}
                            className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {!protectedAccount && (
                            <button
                              onClick={() => patchStatus(u, u.status === "suspended" ? "active" : "suspended")}
                              className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdf3e3] text-[#c98a3b] hover:bg-[#c98a3b] hover:text-white transition-colors"
                              title={u.status === "suspended" ? "Activate" : "Suspend"}
                            >
                              {u.status === "suspended" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                            </button>
                          )}
                          {!protectedAccount && (
                            <button
                              onClick={() => { setResetTarget(u); setReset({ password: "", confirm: "" }); }}
                              className="grid h-8 w-8 place-items-center rounded-lg bg-[#f3eaf9] text-[#8b5ab5] hover:bg-[#8b5ab5] hover:text-white transition-colors"
                              title="Reset Password"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                          )}
                          {!protectedAccount && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdeaea] text-red hover:bg-red hover:text-white transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-10">
                    {q || roleFilter !== "all" || statusFilter !== "all"
                      ? "No accounts match your filters."
                      : "No user accounts yet. Users who sign up on the site will appear here."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <UsersContent />
    </AdminGuard>
  );
}