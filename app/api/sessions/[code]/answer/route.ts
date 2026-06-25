import { submitAnswer } from "@/lib/db";
import { events } from "@/lib/realtime";
import { error, json, publishSnapshot } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const { teamId, answer } = await request.json();
    const result = await submitAnswer(code, teamId, answer);
    await publishSnapshot(code, events.answerSubmitted);
    return json(result);
  } catch (err) {
    return error(err instanceof Error ? err.message : "Unable to submit answer");
  }
}
