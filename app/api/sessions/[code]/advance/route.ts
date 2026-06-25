import { advanceSession, setSessionStatus } from "@/lib/db";
import { events } from "@/lib/realtime";
import { json, requireAdmin, publishSnapshot } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { code } = await params;
  const { reveal } = await request.json().catch(() => ({ reveal: false }));
  if (reveal) {
    await setSessionStatus(code, "revealing");
    return json(await publishSnapshot(code, events.reveal));
  }
  const session = await advanceSession(code);
  return json(await publishSnapshot(code, session.status === "finished" ? events.finished : events.questionChanged));
}
