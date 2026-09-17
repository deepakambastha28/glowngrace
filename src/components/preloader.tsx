import Image from "next/image";
import gngLoaderLogo from "@/images/gngloader-logo.png";

export function Preloader({
  fullscreen = true,
  label = "Loading...",
}: {
  fullscreen?: boolean;
  label?: string;
}) {
  const content = (
    <div className="gg-loader" data-testid="gg-loader" role="status" aria-label={label}>
      <div className="gg-loader-logowrap">
        <div className="gg-loader-ring" />
        <div className="gg-loader-spark" />
        <Image
          src={gngLoaderLogo}
          alt=""
          width={716}
          height={716}
          priority
          className="gg-loader-logo"
        />
      </div>
      <div className="gg-loader-text">{label}</div>
      <div className="gg-loader-dots" aria-hidden="true">
        <span className="gg-loader-dot" />
        <span className="gg-loader-dot" />
        <span className="gg-loader-dot" />
        <span className="gg-loader-dot" />
        <span className="gg-loader-dot" />
      </div>
    </div>
  );

  if (!fullscreen) return content;

  return (
    <div className="grid min-h-screen w-full place-items-center bg-[#050505]" data-testid="preloader">
      {content}
    </div>
  );
}