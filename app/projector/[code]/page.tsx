import { ProjectorScreen } from "@/components/projector-screen";
import { getSnapshot } from "@/lib/db";

export default async function ProjectorPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const snapshot = code === "demo" ? null : await getSnapshot(code).catch(() => null);
  return <ProjectorScreen code={code.toUpperCase()} initial={snapshot} />;
}
