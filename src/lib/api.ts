import type {
  OrderPayload,
  ApplicationPayload,
  PartnerPayload,
} from "@/lib/schemas";

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