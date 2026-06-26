import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const events = {
  snapshot: "snapshot",
  playerJoined: "player-joined",
  questionChanged: "question-changed",
  answerSubmitted: "answer-submitted",
  reveal: "reveal",
  finished: "finished",
  paused: "paused",
  restarted: "restarted",
} as const;

export function getPusherServer() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster =
    process.env.PUSHER_CLUSTER ||
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER ||
    "ap2";

  if (!appId || !key || !secret) return null;

  return new PusherServer({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
}

export function createPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

  if (!key) return null;

  return new PusherClient(key, { cluster });
}

export async function publish(
  code: string,
  event: string,
  payload: unknown
) {
  const pusher = getPusherServer();

  if (!pusher) return;

  try {
    const body = JSON.stringify(payload);

    console.log("========== PUSHER ==========");
    console.log("Channel:", `quiz-${code.toUpperCase()}`);
    console.log("Event:", event);
    console.log("Payload Size:", Buffer.byteLength(body, "utf8"), "bytes");

    await pusher.trigger(
      `quiz-${code.toUpperCase()}`,
      event,
      payload
    );

    console.log("PUSHER SUCCESS");
    console.log("============================");
  } catch (err) {
    console.error("PUSHER FAILED");
    console.error(err);

    throw err;
  }
}
