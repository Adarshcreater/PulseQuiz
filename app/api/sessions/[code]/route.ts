import { getSnapshot } from "@/lib/db";
import { error, json } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const snapshot = await getSnapshot(code);

    if (!snapshot) {
      return error("Session not found", 404);
    }

    // Hide the correct answer from players while the quiz is running
    const safeSnapshot = {
      ...snapshot,
      currentQuestion: snapshot.currentQuestion
        ? {
            ...snapshot.currentQuestion,
            correct_answer:
              snapshot.session.status === "revealing" ||
              snapshot.session.status === "finished"
                ? snapshot.currentQuestion.correct_answer
                : "",
          }
        : undefined,
    };

    return json(safeSnapshot);
  } catch (err) {
    console.error("GET SESSION ERROR:", err);

    if (err instanceof Error) {
      return error(err.message);
    }

    return error(String(err));
  }
}
