import { setSessionStatus } from "@/lib/db";
import { events } from "@/lib/realtime";
import { json, requireAdmin, publishSnapshot } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { code } = await params;
  const { paused } = await request.json();
  await setSessionStatus(code, paused ? "paused" : "running");
  return json(await publishSnapshot(code, paused ? events.paused : events.questionChanged));
}
