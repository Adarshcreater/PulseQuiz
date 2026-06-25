import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "pulsequiz_admin";

function secret() {
  return process.env.SESSION_SECRET || "dev-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export async function createAdminSession() {
  const token = `${Date.now()}.${crypto.randomUUID()}`;
  const value = `${token}.${sign(token)}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/"
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdminAuthenticated() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length < 3) return false;
  const token = parts.slice(0, -1).join(".");
  const expected = sign(token);
  const actual = parts.at(-1) || "";
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string) {
  return password.length > 0 && password === (process.env.ADMIN_PASSWORD || "admin123");
}
