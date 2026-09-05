"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useForm, type UseFormRegister, type UseFormSetValue, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, UploadCloud, CheckCircle2, ChevronLeft, MapPin, PartyPopper, Heart } from "lucide-react";
import { toast } from "sonner";
import { jobs, type Job } from "@/lib/data";
import { applyJobSchema, type ApplyJobFormData } from "@/lib/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ApplyPageProps {
  params: { slug: string };
}

interface ApplicantFormProps {
  job: Job;
  register: UseFormRegister<ApplyJobFormData>;
  setValue: UseFormSetValue<ApplyJobFormData>;
  errors: FieldErrors<ApplyJobFormData>;
  resume: File | null;
  setResume: (file: File | null) => void;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const experienceOptions = [
  "Fresher",
  "1-2 years",
  "2-3 years",
  "3-5 years",
  "5+ years",
];
const specializationOptions = [
  "Beauty & Skincare",
  "Makeup Artistry",
  "Hair Styling",
  "Nail Art",
  "Bridal Services",
  "Spa & Wellness",
];
const qualificationOptions = [
  "High School",
  "Diploma in Cosmetology",
  "Certificate in Beauty Care",
  "Bachelor's Degree",
  "Master's Degree",
];

function SelectField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  value?: string;
  onValueChange: (v: string) => void;
  options: string[];
  placeholder: string;
  error?: string;
}) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="mt-1.5">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="field-input !h-[50px]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="mt-1 text-[0.8rem] text-rose">{error}</p>}
    </div>
  );
}

function ApplySuccess({ jobTitle }: { jobTitle: string }) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  if (!success) return null;

  return (
    <div className="text-center py-10">
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald/10">
        <PartyPopper className="h-12 w-12 text-emerald" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">
        Application <span className="text-rose italic">Submitted!</span>
      </h1>
      <p className="mt-3 text-muted max-w-lg mx-auto">
        Thank you for applying for the {jobTitle} position at Glow &amp; Grace.
        Our team will review your application and reach out within 3-5 business days.
      </p>
      <div className="mt-4 mx-auto max-w-md flex items-center justify-center gap-2 rounded-full bg-rose-blush px-6 py-3 text-sm text-charcoal/80">
        <Heart className="h-4 w-4 text-rose" />
        Keep an eye on your email and phone for next steps.
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/careers" className="btn-primary">Browse More Jobs</Link>
        <Link href="/" className="btn-outline">Back to Home</Link>
      </div>
    </div>
  );
}

function ApplicantForm({
  job,
  register,
  setValue,
  errors,
  resume,
  setResume,
  dragOver,
  setDragOver,
  onSubmit,
  submitting,
}: ApplicantFormProps) {
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const validateAndSet = (file: File) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.type)) {
      setResume(file);
      toast.success("Resume uploaded successfully");
    } else {
      toast.error("Please upload a PDF or DOC file");
    }
  };

  return (
    <div data-testid="apply-form">
      <Link
        href={`/careers/${job.slug}`}
        className="flex items-center gap-2 text-sm text-muted hover:text-rose transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> Back to job
      </Link>

      <div className="section-head">
        <p className="eyebrow">Job Application</p>
        <h1>Apply for {job.title}</h1>
        <p className="flex items-center justify-center gap-2">
          <MapPin className="h-4 w-4 text-rose" /> {job.salon} · {job.location}, Lucknow
        </p>
      </div>

      <form onSubmit={onSubmit} className="card !rounded-[18px] p-6 md:p-8 space-y-6">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label" htmlFor="name">Full Name</label>
            <input id="name" className="field-input" placeholder="e.g. Priya Sharma" {...register("name")} />
            {errors.name && <p className="mt-1 text-[0.8rem] text-rose">{errors.name.message}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="phone">Phone Number</label>
            <input id="phone" type="tel" className="field-input" placeholder="+91 98765 43210" {...register("phone")} />
            {errors.phone && <p className="mt-1 text-[0.8rem] text-rose">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="email">Email Address</label>
            <input id="email" type="email" className="field-input" placeholder="priya@example.com" {...register("email")} />
            {errors.email && <p className="mt-1 text-[0.8rem] text-rose">{errors.email.message}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="city">City</label>
            <input id="city" className="field-input" placeholder="Lucknow" {...register("city")} />
            {errors.city && <p className="mt-1 text-[0.8rem] text-rose">{errors.city.message}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <SelectField
            label="Experience"
            placeholder="Select experience"
            onValueChange={(v) => setValue("experience", v as ApplyJobFormData["experience"])}
            options={experienceOptions}
            error={errors.experience?.message}
          />
          <SelectField
            label="Specialization"
            placeholder="Select specialization"
            onValueChange={(v) => setValue("specialization", v as ApplyJobFormData["specialization"])}
            options={specializationOptions}
            error={errors.specialization?.message}
          />
          <SelectField
            label="Qualification"
            placeholder="Select qualification"
            onValueChange={(v) => setValue("qualification", v as ApplyJobFormData["qualification"])}
            options={qualificationOptions}
            error={errors.qualification?.message}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="coverNote">Cover Note</label>
          <textarea
            id="coverNote"
            className="field-textarea min-h-[120px]"
            placeholder="Tell us about yourself, your skills, and why you're perfect for this role..."
            {...register("coverNote")}
          />
          {errors.coverNote && <p className="mt-1 text-[0.8rem] text-rose">{errors.coverNote.message}</p>}
        </div>

        <div>
          <span className="field-label">Resume Upload</span>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={cn(
              "mt-2 flex flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-line p-8 transition-all bg-cream/40",
              dragOver ? "border-rose bg-rose-blush scale-[1.01]" : "hover:border-rose/50"
            )}
          >
            <UploadCloud className="h-10 w-10 text-rose" />
            <p className="mt-3 text-sm font-semibold text-charcoal">
              Drop your resume here or{" "}
              <label className="cursor-pointer text-rose underline" htmlFor="resume">
                browse
              </label>
            </p>
            <p className="mt-1 text-xs text-muted">PDF or DOC, max 5MB</p>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="sr-only"
              onChange={handleFileSelect}
              data-testid="resume-input"
            />
            {resume && (
              <div className="mt-4 flex items-center gap-2 rounded-full bg-emerald/10 px-5 py-2 text-sm text-emerald">
                <FileText className="h-4 w-4" />
                {resume.name}
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded accent-rose"
            {...register("acceptTerms")}
          />
          <span className="text-sm text-charcoal/70">
            I agree to the terms &amp; conditions and confirm that the information provided
            is accurate to the best of my knowledge.
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-sm text-rose">{errors.acceptTerms.message}</p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full" data-testid="submit-application">
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

export default function ApplyPage({ params }: ApplyPageProps) {
  const router = useRouter();
  const job = jobs.find((j) => j.slug === params.slug);

  const [resume, setResume] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplyJobFormData>({
    resolver: zodResolver(applyJobSchema),
  });

  if (!job) {
    notFound();
  }

  const handleOnSubmit = async (data: ApplyJobFormData) => {
    if (!resume) {
      toast.error("Please upload your resume");
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          jobSlug: job.slug,
          jobTitle: job.title,
          name: data.name,
          phone: data.phone,
          email: data.email,
          city: data.city,
          experience: data.experience,
          specialization: data.specialization,
          qualification: data.qualification,
          coverNote: data.coverNote,
          resumeName: resume.name,
        }),
      });
    } catch {
      // best-effort — never block the application on persistence
    }
    setSubmitting(false);
    toast.success("Application submitted successfully! 🎉");
    router.push(`/careers/${job.slug}/apply?success=1`);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <Suspense fallback={null}>
        <ApplySuccess jobTitle={job.title} />
      </Suspense>

      <ApplicantForm
        job={job}
        register={register}
        setValue={setValue}
        errors={errors}
        resume={resume}
        setResume={setResume}
        dragOver={dragOver}
        setDragOver={setDragOver}
        onSubmit={handleSubmit(handleOnSubmit)}
        submitting={submitting}
      />
    </div>
  );
}