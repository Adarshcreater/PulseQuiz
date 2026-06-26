import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSnapshot } from "@/lib/db";
import { publish, events } from "@/lib/realtime";

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return error("Unauthorized", 401);
  }
  return null;
}

export async function publishSnapshot(
  code: string, 
  event: string = events.snapshot
) {
  const snapshot = await getSnapshot(code);
  if (snapshot) {
    await publish(code, event,timestamp),
      }
      return snapshot;
}

