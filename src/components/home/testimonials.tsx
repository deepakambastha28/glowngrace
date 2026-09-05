import { testimonials } from "@/lib/data";
import { RatingStars } from "@/components/ui/rating-stars";

export function Testimonials() {
  return (
    <section className="section bg-rose-blush" id="testimonials" data-testid="testimonials-section">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="section-head">
          <p className="eyebrow">Testimonials</p>
          <h2>Loved by Women Across Lucknow</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-[26px]">
          {testimonials.map((t) => (
            <div key={t.id} className="card !rounded-[18px] p-[30px]">
              <div className="font-heading text-[2.4rem] leading-none text-rose-soft">
                &ldquo;
              </div>
              <RatingStars rating={t.rating} size={14} className="mt-2" />
              <p className="text-charcoal text-[0.95rem] mt-3 leading-relaxed min-h-[64px]">
                {t.text}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-gradient font-bold text-white">
                  {t.initial}
                </div>
                <div>
                  <h4 className="text-[0.95rem]">{t.name}</h4>
                  <span className="text-[0.78rem] text-muted">{t.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}