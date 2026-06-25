import { PlayerScreen } from "@/components/player-screen";
import { getSnapshot } from "@/lib/db";

export default async function PlayerPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const snapshot = await getSnapshot(code).catch(() => null);
  return <PlayerScreen code={code.toUpperCase()} initial={snapshot} />;
}
