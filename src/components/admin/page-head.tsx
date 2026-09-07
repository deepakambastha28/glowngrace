import Link from "next/link";
import { Plus } from "lucide-react";

export function AdminPageHead({
  title,
  subtitle,
  actionLabel,
  actionHref,
}: {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-muted">{subtitle}</p>
      </div>
      <Link href={actionHref} className="btn-primary text-sm">
        <Plus className="h-4 w-4" /> {actionLabel}
      </Link>
    </div>
  );
}
