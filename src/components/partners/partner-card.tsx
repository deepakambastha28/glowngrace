import Link from "next/link";
import type { Partner } from "@/lib/data";

interface PartnerCardProps {
  partner: Partner;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const images = partner.images?.length ? partner.images : undefined;
  const thumbs = partner.gallery.slice(0, 4);
  const photoCount = images?.length ?? partner.gallery.length;

  return (
    <Link
      href={`/partners/${partner.slug}`}
      className="partner-card block"
      data-testid={`partner-card-${partner.id}`}
    >
      <div className="partner-photo" style={images ? undefined : { background: partner.gradient }}>
        {images ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[0]} alt={partner.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          partner.emoji
        )}
        <span className="p-badge">{partner.type}</span>
        <span className="p-count">📷 {photoCount} photos</span>
        <span className="p-rating">⭐ {partner.rating}</span>
      </div>
      <div className="partner-body">
        <h3>{partner.name}</h3>
        <div className="partner-loc">📍 {partner.loc}, Lucknow</div>
        <div className="partner-tags">
          {partner.tags.map((tag) => (
            <span key={tag} className="p-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-[0.82rem] text-muted">
          <span className="services">
            {partner.services} services · Est. {partner.estd}
          </span>
          <span className="font-bold text-rose text-[0.85rem]">View Gallery →</span>
        </div>
      </div>
      <div className="p-thumbs">
        {images ? (
          <>
            {images.slice(0, 4).map((src, i) =>
              i === 3 && images.length > 4 ? (
                <div key={i} className="pt more">
                  +{images.length - 3}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="pt" aria-hidden="true" />
              )
            )}
          </>
        ) : (
          thumbs.map((photo, i) =>
            i === 3 && photoCount > 4 ? (
              <div
                key={i}
                className="pt more"
                style={{ background: photo.gradient }}
              >
                +{photoCount - 3}
              </div>
            ) : (
              <div
                key={i}
                className="pt"
                style={{ background: photo.gradient }}
                aria-hidden="true"
              />
            )
          )
        )}
      </div>
    </Link>
  );
}