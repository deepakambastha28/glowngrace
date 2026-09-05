import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <span className="text-7xl">🌸</span>
      <h1 className="mt-6 font-heading text-4xl font-semibold text-charcoal">
        404 — Page Not <span className="text-gradient italic">Found</span>
      </h1>
      <p className="mt-3 text-charcoal/60">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        <ArrowLeft className="h-5 w-5" /> Back to Home
      </Link>
    </div>
  );
}