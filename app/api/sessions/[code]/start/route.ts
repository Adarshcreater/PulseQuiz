import { startSession } from "@/lib/db";
import { events } from "@/lib/realtime";
import { json, requireAdmin, publishSnapshot } from "@/lib/api";

export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { code } = await params;
  await startSession(code);
  return json(await publishSnapshot(code, events.questionChanged));
}
