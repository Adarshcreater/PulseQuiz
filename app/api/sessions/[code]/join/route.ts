import { joinSession } from "@/lib/db";
import { events } from "@/lib/realtime";
import { json, publishSnapshot } from "@/lib/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const { name, members } = await request.json();

    console.log("JOIN REQUEST");
    console.log("Code:", code);
    console.log("Name:", name);
    console.log("Members:", members);

    const team = await joinSession(
      code,
      name,
      Number(members || 1)
    );

    console.log("Team Created:", team.id);

    const snapshot = await publishSnapshot(
      code,
      events.playerJoined
    );

    console.log("Snapshot Published");

    return json({
      team,
      snapshot,
    });
  } catch (err) {
    console.error("========== JOIN ERROR ==========");
    console.error(err);

    return Response.json(
      {
        error:
          err instanceof Error
            ? err.message
            : String(err),
      },
      {
        status: 500,
      }
    );
  }
}
