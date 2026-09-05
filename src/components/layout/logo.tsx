import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="font-heading text-2xl font-bold text-rose" data-testid="logo">
      Glow<span className="text-gold">&amp;</span>Grace
    </Link>
  );
}