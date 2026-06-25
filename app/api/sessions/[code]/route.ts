import { getSnapshot } from "@/lib/db";
import { error, json } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const snapshot = await getSnapshot(code);
  return snapshot ? json(snapshot) : error("Session not found", 404);
}
