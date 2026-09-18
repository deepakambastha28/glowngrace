import Image from "next/image";
import loaderGif from "@/images/loader-animated.gif";

export function Preloader({
  label = "Loading...",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      data-testid="gg-loader"
      role="status"
      aria-label={label}
    >
      <Image
        src={loaderGif}
        alt="Loading"
        width={96}
        height={96}
        priority
        unoptimized
        className="h-24 w-24 object-contain"
      />
      <div className="text-xs uppercase tracking-widest text-rose">{label}</div>
    </div>
  );
}