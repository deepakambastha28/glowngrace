import { Briefcase, GraduationCap, Building2 } from "lucide-react";

const services = [
  {
    icon: Briefcase,
    title: "Job Placement",
    description:
      "We match certified beauticians, stylists & makeup artists with verified salons hiring in Lucknow.",
  },
  {
    icon: GraduationCap,
    title: "Skill Training",
    description:
      "Professional courses in makeup, hairstyling, skincare & nail art to boost your career.",
  },
  {
    icon: Building2,
    title: "Hire Talent",
    description:
      "Salon owners can post vacancies and access our pool of trained, verified professionals.",
  },
];

const steps = [
  { number: "1", title: "Register", description: "Create your profile & share your skills." },
  { number: "2", title: "Get Matched", description: "We connect you with suitable openings." },
  { number: "3", title: "Interview", description: "Attend interviews with our partner salons." },
  { number: "4", title: "Get Hired", description: "Start your dream job with ongoing support." },
];

export function PlacementServices() {
  return (
    <>
      {/* Dark services section */}
      <section id="services" className="section bg-dark-gradient" data-testid="services-section">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="section-head light">
            <p className="eyebrow">Beauty Career Services</p>
            <h2>Parlour Placement &amp; Job Consultancy</h2>
            <p>Connecting skilled beauty professionals with the finest parlours across Lucknow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-[18px] border border-white/10 bg-white/[0.06] p-[34px_28px] transition-all duration-300 hover:-translate-y-1.5 hover:bg-rose/15 hover:border-rose-soft"
              >
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-rose-gradient text-[1.8rem] mb-5 text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-white text-[1.25rem] mb-2.5">{title}</h3>
                <p className="text-[#d9cbd8] text-[0.92rem] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="mx-auto max-w-screen-xl px-6">
          <div className="section-head">
            <p className="eyebrow">How It Works</p>
            <h2>Your Path to a Beauty Career</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-gradient text-[1.5rem] font-bold text-white shadow-gold">
                  {step.number}
                </div>
                <h3 className="text-[1.1rem] mb-1.5">{step.title}</h3>
                <p className="text-[0.85rem] text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}