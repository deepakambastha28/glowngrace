import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatINR = new Intl.NumberFormat("en-IN");

export function money(n: number): string {
  return "₹" + formatINR.format(Math.round(n));
}

export function formatPrice(price: number): string {
  return money(price);
}

export function calculateDiscount(price: number, oldPrice: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function jobLocation(location: string): string {
  return location.includes(",") ? location : `${location}, Lucknow`;
}