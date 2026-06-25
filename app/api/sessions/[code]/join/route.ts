import { joinSession } from "@/lib/db";
import { events } from "@/lib/realtime";
import { error, json, publishSnapshot } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const { name, members } = await request.json();
    const team = await joinSession(code, name, Number(members || 1));
    const snapshot = await publishSnapshot(code, events.playerJoined);
    return json({ team, snapshot });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to join");
  }
}
