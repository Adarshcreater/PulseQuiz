import { getSnapshot } from "@/lib/db";
import { error, json } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const snapshot = await getSnapshot(code);

    return snapshot
      ? json(snapshot)
      : error("Session not found", 404);

  } catch (err) {
    console.error("GET SESSION ERROR:", err);

    if (err instanceof Error) {
      console.error(err.stack);
      return error(err.message);
    }

    return error(String(err));
  }
}
