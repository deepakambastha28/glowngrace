"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminPageHead } from "@/components/admin/page-head";
import { fetchAdminEvents, updateAdminEvent, deleteAdminEvent, type AdminEventRecord } from "@/lib/api";
import { EyeOff, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

function EventsContent() {
  const router = useRouter();
  const [items, setItems] = useState<AdminEventRecord[]>([]);
  const [count, setCount] = useState(0);

  const load = () => {
    fetchAdminEvents().then((res) => {
      const list = Array.isArray(res.data?.items) ? res.data!.items : [];
      setItems(list);
      setCount(list.length);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const toggleHide = async (e: AdminEventRecord) => {
    const res = await updateAdminEvent(e.id, { hidden: !e.hidden });
    if (res.ok) {
      toast.success(e.hidden ? "Event is now visible on the store" : "Event hidden from the store");
      load();
    } else {
      toast.error("Could not update visibility");
    }
  };

  const handleDelete = async (e: AdminEventRecord) => {
    if (!confirm(`Delete "${e.title}"? This cannot be undone.`)) return;
    const res = await deleteAdminEvent(e.id);
    if (res.ok) {
      toast.success("Event deleted");
      load();
    } else {
      toast.error("Could not delete event");
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "TBD";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div>
      <AdminPageHead
        title="Events"
        subtitle={`${count} events in calendar.`}
        actionLabel="Add Event"
        actionHref="/admin/events/new"
      />
      <div className="card !shadow-lg overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-blush text-xl">
                          {e.emoji}
                        </span>
                        <div>
                          <div className="font-semibold">{e.title}</div>
                          <div className="text-xs text-muted">
                            {e.category}
                            {e.tags?.length ? ` · ${e.tags.slice(0, 2).join(", ")}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(e.date)}</td>
                    <td>{e.loc || "TBD"}</td>
                    <td>
                      {e.spotsLeft}/{e.capacity}
                    </td>
                    <td className="font-semibold">{e.price}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/events/${e.id}/edit`)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#e9f1fa] text-[#3b82c9] hover:bg-[#3b82c9] hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleHide(e)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1f1f4] text-muted hover:bg-muted hover:text-white transition-colors"
                          title={e.hidden ? "Unhide" : "Hide"}
                        >
                          {e.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(e)}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#fdeaea] text-red hover:bg-red hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-10">
                    No events added yet.
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

export default function AdminEventsPage() {
  return (
    <AdminGuard>
      <EventsContent />
    </AdminGuard>
  );
}
