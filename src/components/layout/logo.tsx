import Image from "next/image";
import Link from "next/link";
import gngLogoColor from "@/images/gnglogo-color.png";

export function Logo() {
  return (
    <Link href="/" data-testid="logo" className="flex items-center gap-2">
      <Image
        src={gngLogoColor}
        alt=""
        className="h-10 w-auto"
        width={280}
        height={280}
      />
      <span className="font-heading text-2xl font-bold text-rose">
        Glow<span className="text-gold">&amp;</span>Grace
      </span>
    </Link>
  );
}