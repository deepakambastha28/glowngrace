import Link from "next/link";
import type { Partner } from "@/lib/data";

interface PartnerCardProps {
  partner: Partner;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const thumbs = partner.gallery.slice(0, 4);

  return (
    <Link
      href={`/partners/${partner.slug}`}
      className="partner-card block"
      data-testid={`partner-card-${partner.id}`}
    >
      <div className="partner-photo" style={{ background: partner.gradient }}>
        <span className="p-badge">{partner.type}</span>
        {partner.emoji}
        <span className="p-count">📷 {partner.gallery.length} photos</span>
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
        {thumbs.map((photo, i) =>
          i === 3 && partner.gallery.length > 4 ? (
            <div
              key={i}
              className="pt more"
              style={{ background: photo.gradient }}
            >
              +{partner.gallery.length - 3}
            </div>
          ) : (
            <div
              key={i}
              className="pt"
              style={{ background: photo.gradient }}
              aria-hidden="true"
            />
          )
        )}
      </div>
    </Link>
  );
}