import type {
  OrderPayload,
  ApplicationPayload,
  PartnerPayload,
  CandidatePayload,
} from "@/lib/schemas";
import type { Product } from "@/lib/data";
import type { Partner } from "@/lib/data";
import type { Job } from "@/lib/data";

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  errorMessage: string | null;
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }
    return {
      ok: res.ok,
      status: res.status,
      data,
      errorMessage: res.ok ? null : "Request failed. Please try again.",
    };
  } catch {
    return { ok: false, status: 0, data: null, errorMessage: "Network error" };
  }
}

function body(value: unknown): RequestInit {
  return { body: JSON.stringify(value) };
}

export type OrderResponse = { persisted: boolean; orderId?: string };
export type ApplicationResponse = { applied: boolean };
export type ApplicationRecord = {
  id: string;
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  experience: string;
  specialization: string;
  qualification: string;
  coverNote: string;
  resumeName: string | null;
  createdAt: string;
};
export type PartnerResponse = { registered: boolean };
export type CartSnapshotResponse = { synced?: boolean; items?: unknown[]; wishlist?: unknown[] };

/** POST /api/orders — persist a completed checkout. */
export function createOrder(
  order: OrderPayload
): Promise<ApiResponse<OrderResponse>> {
  return request<OrderResponse>("/api/orders", {
    method: "POST",
    ...body(order),
  });
}

/** POST /api/applications — persist a job application. */
export function submitApplication(
  application: ApplicationPayload
): Promise<ApiResponse<ApplicationResponse>> {
  return request<ApplicationResponse>("/api/applications", {
    method: "POST",
    ...body(application),
  });
}

/** GET /api/applications?email=... — fetch applications by email (last 30 days). */
export function fetchApplications(
  email: string
): Promise<ApiResponse<{ persisted: boolean; items: ApplicationRecord[] }>> {
  return request(`/api/applications?email=${encodeURIComponent(email)}`);
}

export type OrderRecord = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: unknown;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  gst: number;
  shipping: number;
  total: number;
  deliveryOption: string;
  paymentMethod: string;
  createdAt: string;
};

/** GET /api/orders?email=... — fetch orders by email (last 30 days). */
export function fetchOrders(
  email: string
): Promise<ApiResponse<{ persisted: boolean; orders: OrderRecord[] }>> {
  return request(`/api/orders?email=${encodeURIComponent(email)}`);
}

/** POST /api/partners — register a partner salon. */
export function submitPartnerForm(
  partner: PartnerPayload
): Promise<ApiResponse<PartnerResponse>> {
  return request<PartnerResponse>("/api/partners", {
    method: "POST",
    ...body(partner),
  });
}

/** PUT /api/cart — upsert the cart + wishlist snapshot for a device id. */
export function syncCartSnapshot(
  deviceId: string,
  snapshot: { items: unknown[]; wishlist: string[] }
): Promise<ApiResponse<CartSnapshotResponse>> {
  return request<CartSnapshotResponse>("/api/cart", {
    method: "PUT",
    headers: { "x-device-id": deviceId },
    ...body(snapshot),
  });
}

/** GET /api/cart — read the persisted snapshot for a device id. */
export function fetchCartSnapshot(
  deviceId: string
): Promise<ApiResponse<CartSnapshotResponse>> {
  return request<CartSnapshotResponse>("/api/cart", {
    headers: { "x-device-id": deviceId },
  });
}

/** GET /api/products — storefront catalogue: curated products merged with admin-created products. */
export function fetchProducts(): Promise<ApiResponse<{ items: Product[] }>> {
  return request<{ items: Product[] }>("/api/products");
}

/** GET /api/partners — storefront directory: curated partners merged with admin-created partners. */
export function fetchPartners(): Promise<ApiResponse<{ items: Partner[] }>> {
  return request<{ items: Partner[] }>("/api/partners");
}

/** GET /api/jobs — storefront jobs: admin-created jobs only. */
export function fetchJobs(): Promise<ApiResponse<{ items: Job[] }>> {
  return request<{ items: Job[] }>("/api/jobs");
}

// ---------------------------------------------------------------
// Admin
// ---------------------------------------------------------------

export type AdminSessionResponse = { authed: boolean; email?: string };
export type AdminLoginResponse = {
  authed: boolean;
  email?: string;
  error?: string;
};
export type AdminProductResponse = { persisted: boolean; id?: number };
export type AdminJobResponse = { persisted: boolean; id?: number };
export type AdminReviewResponse = { persisted: boolean; id?: number };
export type AdminPartnerResponse = { persisted: boolean; id?: number; slug?: string };
export type AdminEventResponse = { persisted: boolean; id?: number };

export function adminLogin(
  email: string,
  password: string
): Promise<ApiResponse<AdminLoginResponse>> {
  return request<AdminLoginResponse>("/api/admin/login", {
    method: "POST",
    ...body({ email, password }),
  });
}

export function adminLogout(): Promise<ApiResponse<AdminSessionResponse>> {
  return request<AdminSessionResponse>("/api/admin/logout", {
    method: "POST",
  });
}

export function adminSession(
  signal?: AbortSignal
): Promise<ApiResponse<AdminSessionResponse>> {
  return request<AdminSessionResponse>(
    "/api/admin/session",
    signal ? { signal } : {}
  );
}

export function createAdminProduct(
  product: unknown
): Promise<ApiResponse<AdminProductResponse>> {
  return request<AdminProductResponse>("/api/admin/products", {
    method: "POST",
    ...body(product),
  });
}

export function createAdminJob(
  job: unknown
): Promise<ApiResponse<AdminJobResponse>> {
  return request<AdminJobResponse>("/api/admin/jobs", {
    method: "POST",
    ...body(job),
  });
}

export function createAdminReview(
  review: unknown
): Promise<ApiResponse<AdminReviewResponse>> {
  return request<AdminReviewResponse>("/api/admin/reviews", {
    method: "POST",
    ...body(review),
  });
}

export function createAdminPartner(
  partner: unknown
): Promise<ApiResponse<AdminPartnerResponse>> {
  return request<AdminPartnerResponse>("/api/admin/partners", {
    method: "POST",
    ...body(partner),
  });
}

export type AdminProductRecord = {
  id: string;
  slug: string;
  emoji: string;
  brand: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  stock: number;
  status: string;
  description: string;
  descriptionHtml: string;
  features: string[];
  tags: string[];
  imageData: string | null;
  shade: string;
  size: string;
  finish: string;
  ingredients: string;
  isNew: boolean;
  hidden: boolean;
  createdAt: string;
};

export type AdminJobRecord = {
  id: string;
  slug: string;
  title: string;
  salon: string;
  location: string;
  type: string;
  salaryMin: number;
  salaryMax: number;
  salaryText: string;
  experience: string;
  openings: number;
  description: string;
  requirements: string[];
  status: string;
  hidden: boolean;
  createdAt: string;
};

export type AdminPartnerRecord = {
  id: string;
  slug: string;
  name: string;
  type: string;
  loc: string;
  emoji: string;
  gradient: string;
  rating: number;
  reviews: number;
  estd: number;
  staff: number;
  services: number;
  description: string;
  tags: string[];
  status: string;
  createdAt: string;
};

/** GET /api/admin/products — list or fetch one product (by id). */
export function fetchAdminProducts(
  id?: string
): Promise<ApiResponse<{ persisted: boolean; items: AdminProductRecord[]; item: AdminProductRecord | null }>> {
  return request(`/api/admin/products${id ? `?id=${encodeURIComponent(id)}` : ""}`);
}

/** PATCH /api/admin/products?id=... — update a product (or toggle its hidden flag). */
export function updateAdminProduct(
  id: string,
  patch: unknown
): Promise<ApiResponse<{ persisted: boolean }>> {
  return request<{ persisted: boolean }>(`/api/admin/products?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    ...body(patch),
  });
}

/** DELETE /api/admin/products?id=... — delete an admin-created product. */
export function deleteAdminProduct(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return request<{ deleted: boolean }>(`/api/admin/products?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** GET /api/admin/jobs — list or fetch one job (by id). */
export function fetchAdminJobs(
  id?: string
): Promise<ApiResponse<{ persisted: boolean; items: AdminJobRecord[]; item: AdminJobRecord | null }>> {
  return request(`/api/admin/jobs${id ? `?id=${encodeURIComponent(id)}` : ""}`);
}

/** PATCH /api/admin/jobs?id=... — update a job (or toggle its hidden flag). */
export function updateAdminJob(
  id: string,
  patch: unknown
): Promise<ApiResponse<{ persisted: boolean }>> {
  return request<{ persisted: boolean }>(`/api/admin/jobs?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    ...body(patch),
  });
}

/** DELETE /api/admin/jobs?id=... — delete an admin-created job. */
export function deleteAdminJob(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return request<{ deleted: boolean }>(`/api/admin/jobs?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** GET /api/admin/partners — list or fetch one partner (by id). */
export function fetchAdminPartners(
  id?: string
): Promise<ApiResponse<{ persisted: boolean; items: AdminPartnerRecord[]; item: AdminPartnerRecord | null }>> {
  return request(`/api/admin/partners${id ? `?id=${encodeURIComponent(id)}` : ""}`);
}

/** PATCH /api/admin/partners?id=... — update a partner (or its status). */
export function updateAdminPartner(
  id: string,
  patch: unknown
): Promise<ApiResponse<{ persisted: boolean }>> {
  return request<{ persisted: boolean }>(`/api/admin/partners?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    ...body(patch),
  });
}

/** DELETE /api/admin/partners?id=... — delete an admin-created partner. */
export function deleteAdminPartner(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return request<{ deleted: boolean }>(`/api/admin/partners?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------
// Candidate Profile
// ---------------------------------------------------------------

export type CandidateResponse = { persisted: boolean; id?: number };
export type CandidateListResponse = { persisted: boolean; items: CandidateRecord[] };
export type CandidateRecord = {
  id: string;
  userEmail: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  experience: string;
  specialization: string;
  qualification: string;
  bio: string;
  skills: string[];
  gallery: string[];
  resumeName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

/** GET /api/candidates?email=... — fetch a candidate profile by email. */
export function fetchCandidate(
  email: string
): Promise<ApiResponse<{ persisted: boolean; candidate: CandidateRecord | null }>> {
  return request(`/api/candidates?email=${encodeURIComponent(email)}`);
}

/** POST /api/candidates — create or update a candidate profile. */
export function saveCandidate(
  profile: CandidatePayload & { userEmail: string }
): Promise<ApiResponse<CandidateResponse>> {
  return request<CandidateResponse>("/api/candidates", {
    method: "POST",
    ...body(profile),
  });
}

/** DELETE /api/candidates?id=... — delete a candidate profile. */
export function deleteCandidate(
  id: number
): Promise<ApiResponse<{ deleted: boolean }>> {
  return request<{ deleted: boolean }>(`/api/candidates?id=${id}`, {
    method: "DELETE",
  });
}

/** GET /api/admin/candidates — list all candidates (admin). */
export function adminFetchCandidates(): Promise<ApiResponse<CandidateListResponse>> {
  return request<CandidateListResponse>("/api/admin/candidates");
}

/** DELETE /api/admin/candidates?id=... — delete a candidate (admin). */
export function adminDeleteCandidate(
  id: number
): Promise<ApiResponse<{ deleted: boolean }>> {
  return request<{ deleted: boolean }>(`/api/admin/candidates?id=${id}`, {
    method: "DELETE",
  });
}

/** GET /api/admin/candidates?id=... — fetch one candidate by id (admin). */
export function fetchAdminCandidate(
  id: string
): Promise<ApiResponse<{ persisted: boolean; item: CandidateRecord | null }>> {
  return request(`/api/admin/candidates?id=${encodeURIComponent(id)}`);
}

/** PATCH /api/admin/candidates?id=... — update a candidate profile or status (admin). */
export function updateAdminCandidate(
  id: string,
  patch: unknown
): Promise<ApiResponse<{ persisted: boolean }>> {
  return request<{ persisted: boolean }>(`/api/admin/candidates?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    ...body(patch),
  });
}

// ---------------------------------------------------------------
// Admin Events
// ---------------------------------------------------------------

export type AdminEventRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  emoji: string;
  gradient: string;
  date: string;
  time: string;
  loc: string;
  venue: string;
  price: string;
  capacity: number;
  spotsLeft: number;
  description: string;
  agenda: string[];
  tags: string[];
  hidden: boolean;
  createdAt: string;
};

export function createAdminEvent(
  event: unknown
): Promise<ApiResponse<AdminEventResponse>> {
  return request<AdminEventResponse>("/api/admin/events", {
    method: "POST",
    ...body(event),
  });
}

/** GET /api/admin/events — list or fetch one event (by id). */
export function fetchAdminEvents(
  id?: string
): Promise<ApiResponse<{ persisted: boolean; items: AdminEventRecord[]; item: AdminEventRecord | null }>> {
  return request(`/api/admin/events${id ? `?id=${encodeURIComponent(id)}` : ""}`);
}

/** PATCH /api/admin/events?id=... — update an event. */
export function updateAdminEvent(
  id: string,
  patch: unknown
): Promise<ApiResponse<{ persisted: boolean }>> {
  return request<{ persisted: boolean }>(`/api/admin/events?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    ...body(patch),
  });
}

/** DELETE /api/admin/events?id=... — delete an event. */
export function deleteAdminEvent(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return request<{ deleted: boolean }>(`/api/admin/events?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------
// Recruiter Profile
// ---------------------------------------------------------------

export type RecruiterResponse = { persisted: boolean; id?: number };
export type RecruiterRecord = {
  id: string;
  userEmail: string;
  fullName: string;
  phone: string;
  email: string;
  company: string;
  designation: string;
  city: string;
  bio: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
export type RecruiterListResponse = { persisted: boolean; items: RecruiterRecord[] };

/** GET /api/recruiters?email=... — fetch a recruiter profile by email. */
export function fetchRecruiter(
  email: string
): Promise<ApiResponse<{ persisted: boolean; recruiter: RecruiterRecord | null }>> {
  return request(`/api/recruiters?email=${encodeURIComponent(email)}`);
}

/** POST /api/recruiters — create or update a recruiter profile. */
export function saveRecruiter(
  profile: { userEmail: string } & Record<string, unknown>
): Promise<ApiResponse<RecruiterResponse>> {
  return request<RecruiterResponse>("/api/recruiters", {
    method: "POST",
    ...body(profile),
  });
}

/** GET /api/recruiters/candidates — list all active candidates for recruiters. */
export function fetchRecruiterCandidates(): Promise<ApiResponse<CandidateListResponse>> {
  return request<CandidateListResponse>("/api/recruiters/candidates");
}

/** POST /api/recruiters/hire — mark a candidate as hired by a recruiter. */
export function hireCandidate(
  payload: {
    candidateId: string;
    recruiterEmail: string;
    candidateName: string;
    candidateEmail: string;
  }
): Promise<ApiResponse<{ hired: boolean; alreadyHired?: boolean; id?: number; error?: string }>> {
  return request<{ hired: boolean; alreadyHired?: boolean; id?: number; error?: string }>("/api/recruiters/hire", {
    method: "POST",
    ...body(payload),
  });
}

/** GET /api/recruiters/hired — list candidates hired by a recruiter. */
export function fetchHiredCandidates(
  email: string
): Promise<ApiResponse<{ persisted: boolean; items: CandidateRecord[] }>> {
  return request(`/api/recruiters/hired?email=${encodeURIComponent(email)}`);
}

// ---------------------------------------------------------------
// Admin Recruiters
// ---------------------------------------------------------------

/** GET /api/admin/recruiters — list or fetch one recruiter (by id). */
export function fetchAdminRecruiters(
  id?: string
): Promise<ApiResponse<{ persisted: boolean; items: RecruiterRecord[]; item: RecruiterRecord | null }>> {
  return request(`/api/admin/recruiters${id ? `?id=${encodeURIComponent(id)}` : ""}`);
}

/** PATCH /api/admin/recruiters?id=... — update a recruiter. */
export function updateAdminRecruiter(
  id: string,
  patch: unknown
): Promise<ApiResponse<{ persisted: boolean }>> {
  return request<{ persisted: boolean }>(`/api/admin/recruiters?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    ...body(patch),
  });
}

/** DELETE /api/admin/recruiters?id=... — delete a recruiter. */
export function deleteAdminRecruiter(
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> {
  return request<{ deleted: boolean }>(`/api/admin/recruiters?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}