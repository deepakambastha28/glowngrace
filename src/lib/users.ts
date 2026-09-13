import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const ADMIN_EMAIL = "admin@glowngrace.in";

const format = (input: unknown) => String(input ?? "");

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = `${stored}`.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

export function isProtectedAccount(email: unknown, role: unknown): boolean {
  return format(role) === "admin" && format(email).toLowerCase() === ADMIN_EMAIL;
}

export function toUserItem(r: Record<string, unknown>) {
  return {
    id: format(r.id),
    name: format(r.name),
    email: format(r.email),
    phone: format(r.phone),
    role: format(r.role),
    status: format(r.status),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}