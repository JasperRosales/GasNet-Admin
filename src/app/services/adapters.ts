import type { StaffRole } from "./types";

type Row = Record<string, unknown>;

export const text = (v: unknown) => (typeof v === "string" ? v : "");
export const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));
export function fail(context: string, error: { message: string } | null): never {
  throw new Error(error ? `${context}: ${error.message}` : `${context}: request failed.`);
}
export function rows(data: unknown): Row[] {
  return Array.isArray(data) ? (data as Row[]) : [];
}
export function role(v: unknown): StaffRole {
  return v === "Admin" || v === "Manager" ? v : "Staff";
}
