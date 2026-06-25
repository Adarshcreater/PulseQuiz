import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell";
import { LiveAdmin } from "@/components/live-admin";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSnapshot } from "@/lib/db";

export default async function LiveAdminPage({ params }: { params: Promise<{ code: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { code } = await params;
  const snapshot = await getSnapshot(code);
  return <AppShell><LiveAdmin code={code} initial={snapshot} /></AppShell>;
}
