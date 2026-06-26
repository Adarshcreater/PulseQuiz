import { joinSession } from "@/lib/db";
import { events } from "@/lib/realtime";
import { error, json, publishSnapshot } from "@/lib/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { name, members } = await request.json();

    console.log("STEP 1");

    const team = await joinSession(code, name, Number(members || 1));

    console.log("STEP 2");

    const snapshot = await publishSnapshot(code, events.playerJoined);

    console.log("STEP 3");

    return json({ team, snapshot });

  } catch (err) {
    console.error("JOIN ERROR:");
    console.error(err);

    if (err instanceof Error) {
      console.error(err.stack);
      return error(err.message);
    }

    return error(String(err));
  }
}
